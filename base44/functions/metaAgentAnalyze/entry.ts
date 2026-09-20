import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const INTENT_TYPES = ["DISCOVERY","AUDIT","ARCHITECTURE","BUILD","COMPLETE","REPAIR","HEAL","HARDEN","OPTIMIZE","MIGRATE","REFACTOR","INTEGRATE","PACKAGE","DOCUMENT","TEST","VALIDATE","RELEASE_PREP","RESEARCH"];
const SYSTEM_TYPES = ["WEBSITE","WEB_APP","SAAS","MOBILE_APP","PWA","API","MCP_SERVER","AI_AGENT","AGENT_SWARM","WORKFLOW","AUTOMATION","GENERATOR","SCRAPER","BROWSER_AGENT","DATA_PIPELINE","RAG","MEMORY_SYSTEM","BUSINESS_SYSTEM","MARKETING_SYSTEM","SEO_SYSTEM","LEAD_SYSTEM","ECOMMERCE","ADMIN_PORTAL","CLIENT_PORTAL","DEVELOPER_TOOL","OTHER"];
const EXECUTORS = ["BASE44","CODEX","GITHUB_AGENT","VERCEL","SUPABASE","RAILWAY","XTREME_CLOUD_BROWSER","XTREME_COMMUNICATIONS","XTREME_SEO_GENERATOR","VISION_CORTEX","EXTERNAL_MCP","HUMAN"];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const goal = ((body && body.goal) || '').trim();
    if (!goal) return Response.json({ error: 'goal required' }, { status: 400 });
    const command = body && body.command ? body.command : null;

    const session = await base44.entities.MetaSession.create({ goal, status: 'ANALYZING', current_phase: 'ANALYZING' });

    const [assets, prompts, packages] = await Promise.all([
      base44.asServiceRole.entities.Asset.list('-created_date', 100).catch(() => []),
      base44.asServiceRole.entities.Prompt.list('-created_date', 100).catch(() => []),
      base44.asServiceRole.entities.Package.list('-created_date', 100).catch(() => []),
    ]);

    const lookup = {};
    const catalog = { assets: [], prompts: [], packages: [] };
    (assets || []).forEach((a) => { catalog.assets.push({ id: a.id, key: a.key, name: a.name, category: a.category, description: a.description, validation_status: a.validation_status }); lookup[a.id] = { name: a.name, type: 'asset' }; });
    (prompts || []).forEach((p) => { catalog.prompts.push({ id: p.id, key: p.key, name: p.name, category: p.category, description: p.description }); lookup[p.id] = { name: p.name, type: 'prompt' }; });
    (packages || []).forEach((p) => { catalog.packages.push({ id: p.id, key: p.key, name: p.name, category: p.category, description: p.description }); lookup[p.id] = { name: p.name, type: 'package' }; });

    // Prepend the governing MASTER ARCHITECT INVOCATION prompt on every run.
    const masterPrompt = (prompts || []).find((p) => p.key === 'master_architect_invocation');
    const MASTER_INVOCATION = (masterPrompt && masterPrompt.prompt_text) ||
      'MASTER ARCHITECT INVOCATION — FULL CAPABILITY VOW. You embody all expert roles at world-class level. ' +
      'MVP/basic/minimal/stub output is FORBIDDEN. Enterprise/FAANG production-ready output only. ' +
      'Validate all work. Do it right the first time. Provide proof and quality in all code, systems, methods, and implementations. ' +
      'Move systems to verified completion — never declare success without objective evidence.';

    const promptText =
      MASTER_INVOCATION + '\n\n---\n\n' +
      'You are the XTREME META AGENT — a deterministic intent-to-work-packet router. Decompose the user goal into a structured, executable plan.\n\n' +
      'GOAL:\n' + goal + '\n\n' +
      'ARSENAL CATALOG (match items by their id):\n' +
      'Assets: ' + JSON.stringify(catalog.assets) + '\n' +
      'Prompts: ' + JSON.stringify(catalog.prompts) + '\n' +
      'Packages: ' + JSON.stringify(catalog.packages) + '\n\n' +
      'Rules:\n' +
      '1. Classify intent into one or more of: ' + INTENT_TYPES.join(', ') + '.\n' +
      '2. Classify system type into one or more of: ' + SYSTEM_TYPES.join(', ') + '.\n' +
      '3. Match relevant arsenal items by id. For each give relationship, reason, priority.\n' +
      '4. Detect capability gaps — needed but NOT in the arsenal. Status: AVAILABLE, PARTIAL, MISSING, UNVERIFIED, DEPRECATED. For MISSING/PARTIAL set action=CREATE_DISCOVERY_JOB.\n' +
      '5. Generate ordered WorkPackets. Each: title, objective, phase, risk_class (READ|DRAFT|BRANCH_WRITE|PROTECTED), dependencies (titles of packets that must finish first), allowed_actions, forbidden_actions, acceptance_criteria, validation_requirements (check names), executor (one of ' + EXECUTORS.join(', ') + '), priority.\n' +
      '6. Protected actions (production deploy, database migration, secrets, billing, customer messaging, destructive) MUST be risk_class=PROTECTED with forbidden_actions preventing silent execution.\n' +
      '7. validation_plan: array of {check_name, expected, packet_title}.\n' +
      '8. readiness: {verified_score 0-100, unverified_points, failed_points, blockers[]}. No evidence = no points.\n' +
      '9. architecture: short recommended architecture summary. next_action: single next step.\n' +
      'Return strict JSON matching the schema.';

    const schema = {
      type: 'object',
      properties: {
        intent_types: { type: 'array', items: { type: 'string' } },
        system_types: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' },
        architecture: { type: 'string' },
        matched_assets: { type: 'array', items: { type: 'object', properties: {
          asset_id: { type: 'string' }, asset_type: { type: 'string' }, relationship: { type: 'string' }, reason: { type: 'string' }, priority: { type: 'string' }
        } } },
        gaps: { type: 'array', items: { type: 'object', properties: {
          needed: { type: 'string' }, found: { type: 'string' }, status: { type: 'string' }, action: { type: 'string' }
        } } },
        work_packets: { type: 'array', items: { type: 'object', properties: {
          title: { type: 'string' }, objective: { type: 'string' }, phase: { type: 'string' }, risk_class: { type: 'string' },
          dependencies: { type: 'array', items: { type: 'string' } },
          allowed_actions: { type: 'array', items: { type: 'string' } },
          forbidden_actions: { type: 'array', items: { type: 'string' } },
          acceptance_criteria: { type: 'array', items: { type: 'string' } },
          validation_requirements: { type: 'array', items: { type: 'string' } },
          executor: { type: 'string' }, priority: { type: 'string' }
        } } },
        validation_plan: { type: 'array', items: { type: 'object', properties: {
          check_name: { type: 'string' }, expected: { type: 'string' }, packet_title: { type: 'string' }
        } } },
        readiness: { type: 'object', properties: {
          verified_score: { type: 'number' }, unverified_points: { type: 'number' }, failed_points: { type: 'number' }, blockers: { type: 'array', items: { type: 'string' } }
        } },
        next_action: { type: 'string' }
      },
      required: ['intent_types', 'system_types', 'summary', 'work_packets', 'next_action']
    };

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: promptText,
      model: 'claude-sonnet-5',
      response_json_schema: schema
    });

    const a = result || {};
    const packets = a.work_packets || [];
    const riskLevel = packets.some((p) => p.risk_class === 'PROTECTED') ? 'PROTECTED' : 'BRANCH_WRITE';

    await base44.entities.MetaSession.update(session.id, {
      status: 'PLANNED',
      current_phase: 'PLANNED',
      system_types: a.system_types || [],
      intent_types: a.intent_types || [],
      summary: a.summary || '',
      architecture: a.architecture || '',
      risk_level: riskLevel,
      readiness_score: (a.readiness && a.readiness.verified_score) || 0,
      readiness_breakdown: JSON.stringify(a.readiness || {}),
      next_action: a.next_action || ''
    });

    const packetMap = {};
    const packetIds = [];
    for (const p of packets) {
      const wp = await base44.entities.WorkPacket.create({
        session_id: session.id,
        title: p.title,
        objective: p.objective || '',
        phase: p.phase || '',
        risk_class: p.risk_class || 'DRAFT',
        status: 'DRAFT',
        action_class: p.risk_class || 'DRAFT',
        dependencies: (p.dependencies || []).join(', '),
        allowed_actions: (p.allowed_actions || []).join(', '),
        forbidden_actions: (p.forbidden_actions || []).join(', '),
        acceptance_criteria: (p.acceptance_criteria || []).join('\n'),
        validation_requirements: (p.validation_requirements || []).join('\n'),
        recommended_executor: p.executor || 'BASE44',
        notes: 'priority: ' + (p.priority || 'medium')
      });
      packetMap[p.title] = wp.id;
      packetIds.push(wp.id);
    }

    const firstPid = packetIds[0] || null;
    for (const m of (a.matched_assets || [])) {
      if (!m.asset_id) continue;
      const info = lookup[m.asset_id] || { name: m.asset_id, type: m.asset_type || 'asset' };
      await base44.entities.WorkPacketAsset.create({
        work_packet_id: firstPid,
        asset_id: m.asset_id,
        asset_type: info.type,
        asset_name: info.name,
        relationship: m.relationship || 'recommended',
        reason: m.reason || '',
        priority: m.priority || 'medium'
      });
    }

    for (const g of (a.gaps || [])) {
      if (g.status === 'MISSING' || g.status === 'PARTIAL' || g.action === 'CREATE_DISCOVERY_JOB') {
        await base44.entities.DiscoveryJob.create({
          session_id: session.id,
          query: g.needed || g.found || '',
          category: g.status || 'MISSING',
          reason: g.found || 'No validated implementation found',
          status: 'PENDING',
          source_requirements: 'official sources preferred'
        });
      }
    }

    for (const v of (a.validation_plan || [])) {
      const pid = packetMap[v.packet_title] || firstPid;
      if (!pid) continue;
      await base44.entities.ValidationReceipt.create({
        work_packet_id: pid,
        session_id: session.id,
        check_name: v.check_name || '',
        expected: v.expected || '',
        actual: '',
        status: 'PENDING',
        evidence: '',
        validator: 'independent'
      });
    }

    for (const p of packets) {
      if (p.risk_class === 'PROTECTED') {
        const pid = packetMap[p.title];
        if (pid) {
          await base44.entities.ApprovalRequest.create({
            work_packet_id: pid,
            session_id: session.id,
            action: p.title,
            reason: 'Protected action requires human approval before execution',
            risk_class: 'PROTECTED',
            status: 'PENDING'
          });
        }
      }
    }

    if (command) {
      await base44.entities.CommandRun.create({
        session_id: session.id,
        command,
        parameters: goal,
        status: 'COMPLETE',
        result_summary: 'Decomposed into ' + packets.length + ' work packets'
      });
    }

    return Response.json({ session_id: session.id, packet_count: packets.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}