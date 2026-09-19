import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Google Drive integration — list/search files and upload generated documents.
// Admin-only. Uses the builder's connected Drive account.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || "list";
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("googledrive");
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    if (action === "list") {
      const q = body.q || "";
      const url = "https://www.googleapis.com/drive/v3/files?fields=files(id,name,mimeType,modifiedTime)&pageSize=50" + (q ? `&q=${encodeURIComponent(q)}` : "");
      const r = await fetch(url, { headers: authHeader });
      const data = await r.json().catch(() => ({}));
      return Response.json({ ok: r.ok, status: r.status, files: data.files || [], error: data.error });
    }

    if (action === "upload") {
      const name = body.name || "generated.txt";
      const content = body.content || "";
      const mimeType = body.mimeType || "text/plain";
      const boundary = "aihub" + Date.now();
      const metadata = JSON.stringify({ name });
      const multipart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n${content}\r\n--${boundary}--`;
      const r = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name", {
        method: "POST",
        headers: { ...authHeader, "Content-Type": `multipart/related; boundary=${boundary}` },
        body: multipart
      });
      const data = await r.json().catch(() => ({}));
      return Response.json({ ok: r.ok, status: r.status, file: data });
    }

    return Response.json({ error: "action must be list or upload" }, { status: 400 });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}