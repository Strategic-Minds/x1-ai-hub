import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Supabase integration — runs SQL against the builder's connected Supabase project.
// Admin-only. Read SELECTs use the read-only endpoint; writes use the query endpoint.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const query = body.query;
    if (!query || typeof query !== "string") return Response.json({ error: "query required" }, { status: 400 });
    const write = !!body.write;

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("supabase");
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    const projRes = await fetch("https://api.supabase.com/v1/projects", { headers: authHeader });
    if (!projRes.ok) return Response.json({ error: "supabase projects fetch failed", status: projRes.status }, { status: 502 });
    const projects = await projRes.json();
    if (!projects.length) return Response.json({ error: "no supabase projects found" }, { status: 404 });
    const ref = projects[0].ref;

    const endpoint = write
      ? `https://api.supabase.com/v1/projects/${ref}/database/query`
      : `https://api.supabase.com/v1/projects/${ref}/database/query/read-only`;
    const r = await fetch(endpoint, {
      method: "POST",
      headers: { ...authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });
    const data = await r.json().catch(() => ({}));
    return Response.json({ ref, ok: r.ok, status: r.status, result: data });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}