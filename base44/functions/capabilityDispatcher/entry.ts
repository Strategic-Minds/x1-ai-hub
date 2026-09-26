import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { logAudit } from "../../shared/audit.ts";

// ─── CAPABILITY WIRING & DISPATCHER ──────────────────────────────────────
// Wires registered Capabilities to executors and dispatches ready work packets.
//
// The capability registry defines WHAT the system can do. The executor map
// defines WHO can do it. This function connects the two and advances work
// packets from DRAFT → READY → QUEUED when the required capability is
// available and enabled.
//
// Called by the scheduled workflow (cron) after the reconciler, or manually by an admin.

// Static executor → capability-key map. Each executor handles a set of
// capability keys. These mirror the EXECUTORS list in metaAgentAnalyze.
const EXECUTOR_CAPABILITIES = {
  BASE44: [
    "app_build", "entity_operations", "frontend_render", "backend_function",
    "workflow_automation", "user_auth", "file_upload", "integration_invoke"
  ],
  CODEX: [
    "code_generation", "code_review", "refactoring", "test_generation", "documentation"
  ],
  GITHUB_AGENT: [
    "repo_clone", "branch_create", "pull_request", "merge_branch", "issue_management"
  ],
  VERCEL: [
    "deployment", "edge_function", "domain_config", "env_management", "cron_deploy"
  ],
  SUPABASE: [
    "database_query", "auth_management", "storage_operations", "realtime_subscription", "migration_run"
  ],
  RAILWAY: [
    "backend_hosting", "database_hosting", "env_management"
  ],
  XTREME_CLOUD_BROWSER: [
    "web_browsing", "web_scraping", "form_automation", "screenshot_capture"
  ],
  XTREME_COMMUNICATIONS: [
    "email_send", "sms_send", "push_notification", "social_post"
  ],
  XTREME_SEO_GENERATOR: [
    "seo_content", "meta_tags", "sitemap_generation", "schema_markup", "aeo_optimization"
  ],
  VISION_CORTEX: [
    "visual_analysis", "screenshot_comparison", "layout_validation", "accessibility_audit"
  ],
  EXTERNAL_MCP: [
    "external_tool_call", "custom_protocol"
  ],
  HUMAN: [
    "manual_review", "approval", "decision_making", "creative_direction"
  ],
};

// Reverse map: capability_key → [executors that provide it]
function buildCapabilityToExecutors() {
  const map = {};
  for (const [executor, caps] of Object.entries(EXECUTOR_CAPABILITIES)) {
    for (const cap of caps) {
      if (!map[cap]) map[cap] = [];
      map[cap].push(executor);
    }
  }
  return map;
}

// Infer required capability keys from a work packet's metadata.
function inferRequiredCapabilities(packet) {
  const caps = new Set();
  const title = (packet.title || "").toLowerCase();
  const objective = (packet.objective || "").toLowerCase();
  const actions = (packet.allowed_actions || "").toLowerCase();
  const executor = (packet.recommended_executor || "").toUpperCase();

  // If the packet already names an executor, pull that executor's capabilities
  if (EXECUTOR_CAPABILITIES[executor]) {
    for (const c of EXECUTOR_CAPABILITIES[executor]) caps.add(c);
  }

  // Infer from title/objective keywords
  const text = title + " " + objective + " " + actions;
  if (/deploy|release|host/.test(text)) caps.add("deployment");
  if (/database|sql|query|migration/.test(text)) caps.add("database_query");
  if (/scrape|browse|crawl/.test(text)) caps.add("web_scraping");
  if (/email|notify|message/.test(text)) caps.add("email_send");
  if (/seo|sitemap|meta/.test(text)) caps.add("seo_content");
  if (/code|function|component|build/.test(text)) caps.add("code_generation");
  if (/test|validate|benchmark/.test(text)) caps.add("test_generation");
  if (/repo|branch|merge|pr/.test(text)) caps.add("branch_create");
  if (/auth|login|user/.test(text)) caps.add("user_auth");
  if (/visual|screenshot|layout/.test(text)) caps.add("visual_analysis");
  if (/review|approve|decision/.test(text)) caps.add("manual_review");

  return Array.from(caps);
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    try {
      const user = await base44.auth.me();
      if (user && user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });
    } catch { /* no user context — cron */ }

    const svc = base44.asServiceRole;

    // ── Load the capability registry ────────────────────────────────────
    const capabilities = await svc.entities.Capability.list("-created_date", 500).catch(() => []);
    const capByKey = {};
    for (const c of (capabilities || [])) {
      capByKey[c.key] = c;
    }

    // ── Load existing swarm agents (for assignment) ─────────────────────
    const agents = await svc.entities.SwarmAgent.list("-created_date", 200).catch(() => []);

    // ── Load dispatchable work packets ───────────────────────────────────
    const packets = await svc.entities.WorkPacket.filter(
      { status: { $in: ["DRAFT", "READY", "QUEUED"] } },
      "created_date", 200
    ).catch(() => []);

    let wired = 0;
    let dispatched = 0;
    let blocked = 0;
    let approvalRouted = 0;
    let agentsAssigned = 0;
    let discoveryJobsCreated = 0;
    const wiringReport = [];

    const capToExecutors = buildCapabilityToExecutors();

    for (const p of (packets || [])) {
      const executor = (p.recommended_executor || "BASE44").toUpperCase();
      const requiredCaps = inferRequiredCapabilities(p);

      // ── Check if the executor is known ────────────────────────────────
      const executorKnown = !!EXECUTOR_CAPABILITIES[executor];

      // ── Check each required capability against the registry ───────────
      let allCapsAvailable = true;
      let missingCaps = [];
      let needsApproval = false;

      for (const capKey of requiredCaps) {
        const registered = capByKey[capKey];
        if (!registered) {
          // Capability not registered at all → missing
          allCapsAvailable = false;
          missingCaps.push(capKey);
        } else if (!registered.enabled) {
          // Registered but disabled → missing
          allCapsAvailable = false;
          missingCaps.push(capKey + " (disabled)");
        } else if (registered.requires_approval) {
          needsApproval = true;
        }
      }

      // ── Determine packet action ───────────────────────────────────────
      if (!executorKnown) {
        // Unknown executor → block and create discovery job
        if (p.status !== "BLOCKED") {
          await svc.entities.WorkPacket.update(p.id, { status: "BLOCKED", notes: `Unknown executor: ${executor}` });
          blocked++;
          wiringReport.push({ packet_id: p.id, title: p.title, action: "blocked_unknown_executor", executor });
        }
        continue;
      }

      if (!allCapsAvailable) {
        // Missing capabilities → create discovery jobs and block
        if (p.status !== "BLOCKED") {
          await svc.entities.WorkPacket.update(p.id, { status: "BLOCKED", notes: `Missing capabilities: ${missingCaps.join(", ")}` });
          blocked++;
          wiringReport.push({ packet_id: p.id, title: p.title, action: "blocked_missing_capability", missing: missingCaps });
        }
        // Create discovery job for the first missing capability (dedup by session)
        if (p.session_id && missingCaps.length > 0) {
          const existingJobs = await svc.entities.DiscoveryJob.filter(
            { session_id: p.session_id, query: missingCaps[0], status: "PENDING" },
            "created_date", 1
          ).catch(() => []);
          if (!existingJobs || existingJobs.length === 0) {
            await svc.entities.DiscoveryJob.create({
              session_id: p.session_id || "",
              query: missingCaps[0],
              category: "MISSING",
              reason: `Required by packet: ${p.title}`,
              status: "PENDING",
              source_requirements: "official sources preferred"
            });
            discoveryJobsCreated++;
          }
        }
        continue;
      }

      if (needsApproval || p.action_class === "PROTECTED") {
        // Capability requires approval → route to WAITING_APPROVAL
        if (p.status !== "WAITING_APPROVAL") {
          await svc.entities.WorkPacket.update(p.id, { status: "WAITING_APPROVAL", notes: `Capability requires approval. Executor: ${executor}` });
          approvalRouted++;
          wiringReport.push({ packet_id: p.id, title: p.title, action: "routed_approval", executor });
        }
        continue;
      }

      // ── All checks passed → wire and dispatch ────────────────────────
      // Update packet to READY if still DRAFT
      if (p.status === "DRAFT") {
        await svc.entities.WorkPacket.update(p.id, {
          status: "READY",
          preferred_executor: executor,
          notes: `Wired: ${requiredCaps.length} capabilities matched to ${executor}`
        });
        wired++;
        wiringReport.push({ packet_id: p.id, title: p.title, action: "wired", executor, capabilities: requiredCaps });
      }

      // If READY → dispatch to QUEUED and assign a swarm agent
      if (p.status === "READY" || p.status === "DRAFT") {
        // Find or create an agent for this executor
        let agent = (agents || []).find((a) =>
          a.role && a.role.toLowerCase().includes(executor.toLowerCase()) && a.status !== "blocked"
        );

        if (!agent) {
          // Create a new swarm agent for this executor
          agent = await svc.entities.SwarmAgent.create({
            name: executor + " Agent",
            role: executor.toLowerCase(),
            model: "automatic",
            system_prompt: `You are the ${executor} executor. Execute assigned work packets within your capability scope. Report results with evidence.`,
            capabilities: EXECUTOR_CAPABILITIES[executor] || [],
            status: "running",
            parent_id: ""
          });
          agents.push(agent);
          agentsAssigned++;
        }

        await svc.entities.WorkPacket.update(p.id, {
          status: "QUEUED",
          preferred_executor: executor,
          notes: `Dispatched to ${agent.name}. Capabilities: ${requiredCaps.join(", ")}`
        });
        dispatched++;
        wiringReport.push({ packet_id: p.id, title: p.title, action: "dispatched", executor, agent: agent.name });
      }
    }

    // ── Emit intelligence signal ────────────────────────────────────────
    await svc.entities.IntelligenceSignal.create({
      key: "capability_dispatch_" + Date.now(),
      metric: "packets_dispatched",
      value: dispatched,
      unit: "count",
      trend: dispatched > 0 ? "up" : "flat",
      source: "capabilityDispatcher",
      notes: JSON.stringify({ wired, dispatched, blocked, approval_routed: approvalRouted, agents_assigned: agentsAssigned, discovery_jobs: discoveryJobsCreated })
    });

    // ── Write audit receipt ─────────────────────────────────────────────
    await logAudit(svc, {
      event_type: "capability_dispatch",
      action: "wire_and_dispatch",
      target_type: "WorkPacket",
      target_id: "",
      details: {
        packets_processed: (packets || []).length,
        wired,
        dispatched,
        blocked,
        approval_routed: approvalRouted,
        agents_assigned: agentsAssigned,
        discovery_jobs_created: discoveryJobsCreated,
        capabilities_registered: (capabilities || []).length,
        report: wiringReport.slice(0, 20)
      },
      severity: blocked > 0 ? "warn" : "info"
    });

    return Response.json({
      packets_processed: (packets || []).length,
      capabilities_registered: (capabilities || []).length,
      wired,
      dispatched,
      blocked,
      approval_routed: approvalRouted,
      agents_assigned: agentsAssigned,
      discovery_jobs_created: discoveryJobsCreated,
      report: wiringReport
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
