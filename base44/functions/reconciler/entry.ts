import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { VALIDATION_GATES } from "../../shared/lifecycle.ts";
import { logAudit } from "../../shared/audit.ts";

// ─── REAL RECONCILER ──────────────────────────────────────────────────────
// The deterministic reconciliation heartbeat.
// Compares the EXPECTED state (validation plans, work-packet statuses,
// session readiness) against the ACTUAL state (benchmark evidence, receipt
// statuses, audit trail) and surfaces every discrepancy.
//
// Called by the scheduled workflow (cron) every 5 minutes, or manually by an admin.
// Idempotent: running twice produces the same result.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    // Cron invocations carry no user token; manual invokes require an admin.
    try {
      const user = await base44.auth.me();
      if (user && user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });
    } catch { /* no user context — cron */ }

    const svc = base44.asServiceRole;

    // ── Load all active sessions ──────────────────────────────────────────
    const sessions = await svc.entities.MetaSession.filter(
      { status: { $in: ["PLANNED", "READY", "IN_PROGRESS", "VALIDATING", "BLOCKED", "WAITING_APPROVAL"] } },
      "-created_date", 50
    );

    let receiptsUpdated = 0;
    let packetsUnblocked = 0;
    let packetsStuck = 0;
    let readinessRecalculated = 0;
    let signalsEmitted = 0;
    let auditsWritten = 0;
    const discrepancies = [];

    for (const session of sessions) {
      // ── Load session children ──────────────────────────────────────────
      const [packets, receipts, benchmarks] = await Promise.all([
        svc.entities.WorkPacket.filter({ session_id: session.id }, "created_date", 200).catch(() => []),
        svc.entities.ValidationReceipt.filter({ session_id: session.id }, "created_date", 200).catch(() => []),
        svc.entities.Benchmark.filter({ target_type: "MetaSession", target_id: session.id }, "-created_date", 200).catch(() => []),
      ]);

      // Also check project-level benchmarks (orchestrator writes these)
      const projectBenchmarks = packets.length
        ? await svc.entities.Benchmark.filter(
            { target_id: { $in: packets.map((p) => p.id) } }, "-created_date", 200
          ).catch(() => [])
        : [];
      const allBenchmarks = [...(benchmarks || []), ...(projectBenchmarks || [])];

      // ── 1. Reconcile validation receipts against benchmark evidence ─────
      const benchByMetric = {};
      for (const b of allBenchmarks) {
        const key = b.metric || b.name || "";
        if (!benchByMetric[key] || new Date(b.created_date) > new Date(benchByMetric[key].created_date)) {
          benchByMetric[key] = b;
        }
      }

      for (const r of (receipts || [])) {
        if (r.status === "PASS" || r.status === "FAIL") continue; // already reconciled

        const checkName = r.check_name || "";
        // Try exact match, then partial match against gate names
        let evidence = benchByMetric[checkName];
        if (!evidence) {
          const gateMatch = VALIDATION_GATES.find((g) =>
            checkName.toUpperCase().includes(g.replace("_VALIDATION", "")) ||
            g.includes(checkName.toUpperCase().replace(/ /g, "_"))
          );
          if (gateMatch) evidence = benchByMetric[gateMatch];
        }

        let newStatus = r.status;
        let actualText = r.actual || "";

        if (evidence) {
          if (evidence.status === "pass" && (evidence.score || 0) >= 80) {
            newStatus = "PASS";
            actualText = `score=${evidence.score}/${evidence.max_score || 100} run=${evidence.run_id || ""}`;
          } else if (evidence.status === "fail" || (evidence.score || 0) < 80) {
            newStatus = "FAIL";
            actualText = `score=${evidence.score}/${evidence.max_score || 100} run=${evidence.run_id || ""}`;
          }
        } else if (r.status === "PENDING") {
          // No evidence found after reasonable time → MISSING_EVIDENCE
          const sessionAge = Date.now() - new Date(session.created_date).getTime();
          if (sessionAge > 10 * 60 * 1000) { // 10 min grace period
            newStatus = "MISSING_EVIDENCE";
            actualText = "No benchmark evidence found for this check";
          }
        }

        if (newStatus !== r.status) {
          await svc.entities.ValidationReceipt.update(r.id, {
            status: newStatus,
            actual: actualText,
            evidence: evidence ? `benchmark:${evidence.id}` : "",
            validator: "reconciler"
          });
          receiptsUpdated++;
          discrepancies.push({
            session_id: session.id,
            type: "receipt_reconciled",
            check: checkName,
            from: r.status,
            to: newStatus
          });
        }
      }

      // ── 2. Detect stuck / unblockable work packets ─────────────────────
      const packetByTitle = {};
      for (const p of (packets || [])) packetByTitle[p.title] = p;

      for (const p of (packets || [])) {
        // Stuck: DRAFT with all dependencies passed → should be READY
        if (p.status === "DRAFT" || p.status === "WAITING_DEPENDENCY") {
          const deps = (p.dependencies || "").split(",").map((d) => d.trim()).filter(Boolean);
          const allDepsMet = deps.every((depTitle) => {
            const dep = packetByTitle[depTitle];
            return dep && (dep.status === "PASSED" || dep.status === "COMPLETE" || dep.status === "passed" || dep.status === "complete");
          });

          if (allDepsMet) {
            await svc.entities.WorkPacket.update(p.id, { status: "READY" });
            packetsUnblocked++;
            discrepancies.push({
              session_id: session.id,
              type: "packet_unblocked",
              packet: p.title,
              from: p.status,
              to: "READY"
            });
          } else if (deps.length > 0) {
            // Still waiting on dependencies
            const stuckDeps = deps.filter((depTitle) => {
              const dep = packetByTitle[depTitle];
              return !dep || (dep.status !== "PASSED" && dep.status !== "COMPLETE" && dep.status !== "passed" && dep.status !== "complete");
            });
            if (p.status !== "WAITING_DEPENDENCY") {
              await svc.entities.WorkPacket.update(p.id, { status: "WAITING_DEPENDENCY" });
              packetsStuck++;
              discrepancies.push({
                session_id: session.id,
                type: "packet_waiting",
                packet: p.title,
                blocked_by: stuckDeps
              });
            }
          }
        }

        // Stuck: RUNNING for too long without completion → flag
        if (p.status === "RUNNING" || p.status === "running") {
          const packetAge = Date.now() - new Date(p.updated_date || p.created_date).getTime();
          if (packetAge > 30 * 60 * 1000) { // 30 min timeout
            await svc.entities.WorkPacket.update(p.id, { status: "REPAIR_REQUIRED" });
            packetsStuck++;
            discrepancies.push({
              session_id: session.id,
              type: "packet_timeout",
              packet: p.title,
              from: "RUNNING",
              to: "REPAIR_REQUIRED"
            });
          }
        }
      }

      // ── 3. Recalculate readiness score from actual evidence ───────────
      const totalReceipts = (receipts || []).length;
      const passedReceipts = (receipts || []).filter((r) => r.status === "PASS").length;
      const failedReceipts = (receipts || []).filter((r) => r.status === "FAIL").length;
      const missingReceipts = (receipts || []).filter((r) => r.status === "MISSING_EVIDENCE").length;
      const pendingReceipts = (receipts || []).filter((r) => r.status === "PENDING").length;

      // Verified score = passed / total * 100 (0 if no receipts)
      const verifiedScore = totalReceipts > 0
        ? Math.round((passedReceipts / totalReceipts) * 100)
        : 0;

      // Only update if the score actually changed
      if (verifiedScore !== (session.readiness_score || 0)) {
        const breakdown = {
          verified_score: verifiedScore,
          unverified_points: pendingReceipts,
          failed_points: failedReceipts,
          missing_evidence: missingReceipts,
          blockers: failedReceipts > 0
            ? [`${failedReceipts} failed validation check(s)`]
            : missingReceipts > 0
            ? [`${missingReceipts} check(s) missing evidence`]
            : []
        };

        await svc.entities.MetaSession.update(session.id, {
          readiness_score: verifiedScore,
          readiness_breakdown: JSON.stringify(breakdown)
        });
        readinessRecalculated++;
        discrepancies.push({
          session_id: session.id,
          type: "readiness_recalculated",
          from: session.readiness_score || 0,
          to: verifiedScore
        });
      }

      // ── 4. Update session status based on packet/receipt state ────────
      const allPackets = (packets || []);
      const allPassed = allPackets.length > 0 && allPackets.every(
        (p) => p.status === "PASSED" || p.status === "COMPLETE" || p.status === "passed" || p.status === "complete"
      );
      const anyBlocked = allPackets.some((p) => p.status === "BLOCKED" || p.status === "REPAIR_REQUIRED");
      const anyRunning = allPackets.some((p) => p.status === "RUNNING" || p.status === "running" || p.status === "QUEUED");

      let newSessionStatus = session.status;
      if (allPassed) {
        newSessionStatus = "COMPLETE";
      } else if (anyBlocked) {
        newSessionStatus = "BLOCKED";
      } else if (anyRunning) {
        newSessionStatus = "IN_PROGRESS";
      }

      if (newSessionStatus !== session.status) {
        await svc.entities.MetaSession.update(session.id, { status: newSessionStatus });
        discrepancies.push({
          session_id: session.id,
          type: "session_status_drift",
          from: session.status,
          to: newSessionStatus
        });
      }
    }

    // ── 5. Emit intelligence signals for discrepancies ────────────────────
    if (discrepancies.length > 0) {
      await svc.entities.IntelligenceSignal.create({
        key: "reconcile_" + Date.now(),
        metric: "discrepancies_found",
        value: discrepancies.length,
        unit: "count",
        trend: discrepancies.length > 0 ? "up" : "flat",
        source: "reconciler",
        notes: JSON.stringify({
          receipts_updated: receiptsUpdated,
          packets_unblocked: packetsUnblocked,
          packets_stuck: packetsStuck,
          readiness_recalculated: readinessRecalculated
        })
      });
      signalsEmitted++;
    }

    // Always emit a heartbeat signal
    await svc.entities.IntelligenceSignal.create({
      key: "reconcile_heartbeat_" + Date.now(),
      metric: "reconciliation_cycle",
      value: 1,
      unit: "cycle",
      trend: "flat",
      source: "reconciler",
      notes: `Reconciled ${sessions.length} sessions: ${receiptsUpdated} receipts, ${packetsUnblocked} unblocked, ${packetsStuck} stuck, ${readinessRecalculated} readiness recalculated`
    });
    signalsEmitted++;

    // ── 6. Write audit receipt ───────────────────────────────────────────
    await logAudit(svc, {
      event_type: "reconciliation_cycle",
      action: "reconcile_state",
      target_type: "MetaSession",
      target_id: "",
      details: {
        sessions_processed: sessions.length,
        receipts_updated: receiptsUpdated,
        packets_unblocked: packetsUnblocked,
        packets_stuck: packetsStuck,
        readiness_recalculated: readinessRecalculated,
        signals_emitted: signalsEmitted,
        discrepancies: discrepancies.slice(0, 20) // cap for audit log
      },
      severity: discrepancies.length > 0 ? "warn" : "info"
    });
    auditsWritten++;

    return Response.json({
      sessions_processed: sessions.length,
      receipts_updated: receiptsUpdated,
      packets_unblocked: packetsUnblocked,
      packets_stuck: packetsStuck,
      readiness_recalculated: readinessRecalculated,
      signals_emitted: signalsEmitted,
      audits_written: auditsWritten,
      discrepancies: discrepancies
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
