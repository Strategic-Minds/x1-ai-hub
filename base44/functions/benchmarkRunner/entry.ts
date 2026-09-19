import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { logAudit } from "../../shared/audit.ts";

// Deterministic benchmark runner — scores a URL against the five quality gates
// using rule-based HTTP/HTML/header checks (always reproducible, no LLM in the score).
// One run = five Benchmark records sharing a run_id, tagged with the generator/agent.
// Admin-only. Accepts a single {url} or a batch {urls:[...]} (max 10).
const GATES = ["STATIC_VALIDATION","FUNCTIONAL_VALIDATION","SECURITY_VALIDATION","VISUAL_VALIDATION","OPERATIONAL_VALIDATION"];

function scoreGates(html, headers, status, timingMs, finalUrl, fetchOk, errMsg) {
  if (!fetchOk) {
    const z = { STATIC_VALIDATION:0, FUNCTIONAL_VALIDATION:0, SECURITY_VALIDATION:0, VISUAL_VALIDATION:0, OPERATIONAL_VALIDATION:0 };
    return { gates: z, composite: 0, status: "fail", notes: "Fetch failed: " + errMsg };
  }
  const h = html || "";
  let staticScore = 0;
  if (/<!doctype html>/i.test(h)) staticScore += 20;
  if (/<html[^>]*lang=/i.test(h)) staticScore += 20;
  if (/<title[^>]*>[^<]+<\/title>/i.test(h)) staticScore += 20;
  if (/<meta[^>]+charset/i.test(h)) staticScore += 15;
  if (/<meta[^>]+name=["']viewport["']/i.test(h)) staticScore += 25;

  const linkCount = (h.match(/<a[^>]+href=/gi) || []).length;
  let funcScore = 0;
  funcScore += linkCount >= 10 ? 40 : linkCount >= 5 ? 25 : linkCount >= 1 ? 10 : 0;
  if (/<h1/i.test(h)) funcScore += 20;
  if (/<nav/i.test(h)) funcScore += 20;
  if (/<form|<button/i.test(h)) funcScore += 20;

  let secScore = 0;
  if (/^https:/.test(finalUrl)) secScore += 30;
  if (headers.get("strict-transport-security")) secScore += 20;
  if (headers.get("x-content-type-options")) secScore += 15;
  if (headers.get("x-frame-options") || headers.get("content-security-policy")) secScore += 20;
  if (headers.get("referrer-policy")) secScore += 15;

  let visScore = 0;
  if (/<meta[^>]+name=["']viewport["']/i.test(h)) visScore += 30;
  const imgs = h.match(/<img[^>]*>/gi) || [];
  const imgsAlt = h.match(/<img[^>]+alt=/gi) || [];
  const altRatio = imgs.length ? imgsAlt.length / imgs.length : 1;
  visScore += Math.round(altRatio * 25);
  if (/<meta[^>]+name=["']description["']/i.test(h)) visScore += 15;
  if (/<html[^>]*lang=/i.test(h)) visScore += 15;
  if (/aria-label|role=/i.test(h)) visScore += 15;

  let opScore = 0;
  if (status >= 200 && status < 400) opScore += 30;
  opScore += timingMs < 1000 ? 30 : timingMs < 2500 ? 20 : timingMs < 5000 ? 10 : 0;
  if (h.length > 1000) opScore += 25;
  if (status && status < 500) opScore += 15;

  const gates = { STATIC_VALIDATION: staticScore, FUNCTIONAL_VALIDATION: funcScore, SECURITY_VALIDATION: secScore, VISUAL_VALIDATION: visScore, OPERATIONAL_VALIDATION: opScore };
  const composite = Math.round(Object.values(gates).reduce((a, c) => a + c, 0) / 5);
  const runStatus = composite >= 80 ? "pass" : "fail";
  return { gates, composite, status: runStatus, notes: `status=${status} timing=${timingMs}ms links=${linkCount}` };
}

async function benchmarkOne(svc, url, generator, targetType, targetId) {
  const runId = crypto.randomUUID();
  let fetchOk = true, errMsg = "", html = "", status = 0, timingMs = 0, finalUrl = url;
  const start = Date.now();
  try {
    const res = await fetch(url, { headers: { "user-agent": "AIHUB-Benchmark/1.0" }, redirect: "follow" });
    timingMs = Date.now() - start;
    status = res.status;
    finalUrl = res.url || url;
    html = await res.text();
  } catch (e) {
    fetchOk = false; errMsg = e.message;
  }
  const { gates, composite, status: runStatus, notes } = scoreGates(html, status ? new Headers() : new Headers(), status, timingMs, finalUrl, fetchOk, errMsg);
  // re-fetch headers properly (the caught branch above lost them) — recompute security with real headers
  let headers = new Headers();
  if (fetchOk) {
    try { const res2 = await fetch(url, { headers: { "user-agent": "AIHUB-Benchmark/1.0" }, redirect: "follow", method: "GET" }); headers = res2.headers; } catch {}
  }
  const scored = scoreGates(html, headers, status, timingMs, finalUrl, fetchOk, errMsg);
  for (const g of GATES) {
    await svc.entities.Benchmark.create({
      name: g + " · " + url, category: g.replace("_VALIDATION", "").toLowerCase(),
      target_type: targetType || "URL", target_id: targetId || "", target_url: url,
      generator: generator || "external", metric: g,
      score: scored.gates[g], max_score: 100, composite: scored.composite,
      status: scored.gates[g] >= 80 ? "pass" : "fail",
      run_id: runId, notes: scored.notes
    });
  }
  await logAudit(svc, { event_type: "benchmark_run", action: "benchmark_url", target_type: "URL", target_id: url, details: { url, generator, composite: scored.composite, gates: scored.gates }, severity: "info" });
  return { url, generator, composite: scored.composite, gates: scored.gates, status: scored.status, run_id: runId };
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });
    const svc = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const generator = body.generator || "external";
    const targetType = body.target_type;
    const targetId = body.target_id;
    let urls = [];
    if (Array.isArray(body.urls)) urls = body.urls.slice(0, 10);
    else if (body.url) urls = [body.url];
    else return Response.json({ error: "url or urls required" }, { status: 400 });
    const results = [];
    for (const u of urls) {
      try { results.push(await benchmarkOne(svc, u, generator, targetType, targetId)); }
      catch (e) { results.push({ url: u, error: e.message }); }
    }
    return Response.json({ runs: results.length, results });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}