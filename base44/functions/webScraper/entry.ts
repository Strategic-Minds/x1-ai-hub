import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Scraper system — fetches a public URL and returns title, text, and links.
// Admin-only: never expose arbitrary fetch to non-admin callers.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const url = body.url;
    if (!url || typeof url !== "string") return Response.json({ error: "url required" }, { status: 400 });
    if (!/^https?:\/\//i.test(url)) return Response.json({ error: "url must be http(s)" }, { status: 400 });

    const res = await fetch(url, { headers: { "user-agent": "AIHUB-Scraper/1.0" }, redirect: "follow" });
    const html = await res.text();
    const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [, ""])[1].trim().slice(0, 500);
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 50000);
    const links = [...html.matchAll(/<a[^>]+href=["']([^"']+)["']/gi)]
      .map((m) => m[1])
      .filter((h) => /^https?:\/\//i.test(h))
      .slice(0, 100);

    return Response.json({ url, status: res.status, title, text, links });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}