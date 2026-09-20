import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const OPS = ["list", "get", "filter", "create"];
const NAME_RE = /^[a-z][a-z0-9_]{2,47}$/;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => null);
    if (!body) return Response.json({ error: "Invalid JSON body" }, { status: 400 });

    const name = (body.name || "").toString().trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
    const description = (body.description || "").toString().trim();
    const entityName = (body.entity_name || "").toString().trim();
    const operation = (body.operation || "").toString().trim();
    const allowedFields = Array.isArray(body.allowed_fields) ? body.allowed_fields.map((f) => f.toString()) : [];

    if (!NAME_RE.test(name)) return Response.json({ error: "Invalid tool name (3-48 chars, lowercase a-z0-9_)" }, { status: 400 });
    if (description.length < 10 || description.length > 500) return Response.json({ error: "Description must be 10-500 chars" }, { status: 400 });
    if (!OPS.includes(operation)) return Response.json({ error: "Unsupported operation" }, { status: 400 });
    if (!entityName) return Response.json({ error: "Entity name required" }, { status: 400 });

    let sample;
    try {
      sample = await base44.entities[entityName].list("-created_date", 1);
    } catch {
      return Response.json({ error: "Entity not found" }, { status: 400 });
    }
    const builtIns = ["id", "created_date", "updated_date", "created_by_id"];
    const schemaFields = sample && sample[0] ? Object.keys(sample[0]).filter((k) => !builtIns.includes(k)) : [];
    if (schemaFields.length) {
      const invalidFields = allowedFields.filter((f) => !schemaFields.includes(f));
      if (invalidFields.length) return Response.json({ error: "Invalid fields: " + invalidFields.join(", ") }, { status: 400 });
    }
    const finalFields = allowedFields.length ? allowedFields : schemaFields;
    const key = "mcp_" + name;

    const inputProps = {};
    if (operation === "get") inputProps.id = { type: "string", description: "Record id" };
    if (operation === "filter") inputProps.query = { type: "object", description: "Mongo-style filter query" };
    if (operation === "create") finalFields.forEach((f) => { inputProps[f] = { type: "string" }; });

    const spec = {
      name: key,
      title: name,
      description,
      inputSchema: {
        type: "object",
        properties: inputProps,
        required: operation === "get" ? ["id"] : (operation === "create" ? finalFields.slice(0, 1) : []),
      },
      output: { entity: entityName, operation, fields: finalFields },
      hardened: true,
      least_privilege: allowedFields.length > 0,
      requires_approval: operation === "create",
      generated_by: user.id,
      generated_at: new Date().toISOString(),
    };

    const tool = await base44.entities.Tool.create({
      key,
      name,
      description,
      type: "mcp",
      endpoint: `mcp://${entityName}.${operation}`,
      enabled: true,
      requires_approval: operation === "create",
    });

    return Response.json({ ok: true, spec, tool_id: tool.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}