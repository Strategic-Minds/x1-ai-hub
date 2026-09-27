import { createClientFromRequest, createClient } from 'npm:@base44/sdk@0.8.44';
import { secrets } from 'base44:runtime';

const GUARDIAN_AGENT_ID = '6ab8df33d68088bf03a68307';
const GUARDIAN_AGENT_URL = `https://app.base44.com/api/agents/${GUARDIAN_AGENT_ID}`;
const SECRET_ALIASES = [
  'BASE44_GUARDIAN_PAT',
  'BASE44_PERSONAL_ACCESS_TOKEN',
  'BASE44_PAT',
  'BASE44_API_TOKEN',
  'BASE44_TOKEN',
];

const CANARY_MESSAGE = [
  'GUARDIAN BRIDGE CANARY',
  'Action class: READ.',
  'Return only: guardian_agent=true, canary=PASS, protected_actions_executed=0, secret_values_returned=0.',
  'Do not call external connectors. Do not deploy, merge, mutate schema/RLS, access or change secrets, send outbound communications, spend money, publish, or perform destructive actions.',
].join('\n');

function resolveCredential() {
  for (const alias of SECRET_ALIASES) {
    try {
      const value = secrets.get(alias);
      if (value && typeof value === 'string') return { alias, value };
    } catch (_) {
      // Alias not bound in this runtime.
    }
  }
  return null;
}

function safeAgentMetadata(agent) {
  return {
    id: agent?.id || GUARDIAN_AGENT_ID,
    name: agent?.name || null,
    app_id: agent?.app_id || agent?.appId || null,
  };
}

async function requireAdmin(req) {
  const caller = createClientFromRequest(req);
  const user = await caller.auth.me();
  if (!user || user.role !== 'admin') throw new Error('ADMIN_REQUIRED');
}

async function readAgentWithCredential(token) {
  const res = await fetch(GUARDIAN_AGENT_URL, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  let body = null;
  try { body = await res.json(); } catch (_) {}

  return { ok: res.ok, status: res.status, body };
}

async function waitForAssistant(client, conversationId) {
  for (let i = 0; i < 8; i++) {
    const conv = await client.agents.getConversation(conversationId);
    const messages = Array.isArray(conv?.messages) ? conv.messages : [];
    const assistant = [...messages].reverse().find((m) => m?.role === 'assistant');
    if (assistant) return { conversation: conv, assistant };
    await new Promise((resolve) => setTimeout(resolve, 1250));
  }
  return { conversation: await client.agents.getConversation(conversationId), assistant: null };
}

export default async function(req) {
  try {
    await requireAdmin(req);
  } catch (_) {
    return Response.json({ status: 'BLOCKED_AUTH', reason: 'ADMIN_REQUIRED' }, { status: 401 });
  }

  const credential = resolveCredential();
  if (!credential) {
    return Response.json({
      status: 'BLOCKED_AUTH',
      reason: 'NO_PROVIDER_SECRET_BINDING',
      checked_aliases: SECRET_ALIASES,
      guardian_agent_id: GUARDIAN_AGENT_ID,
    }, { status: 424 });
  }

  const probe = await readAgentWithCredential(credential.value);
  if (!probe.ok) {
    return Response.json({
      status: 'BLOCKED_AUTH',
      reason: 'BASE44_AGENT_AUTH_REJECTED',
      provider_http_status: probe.status,
      secret_alias: credential.alias,
      guardian_agent_id: GUARDIAN_AGENT_ID,
    }, { status: probe.status === 401 || probe.status === 403 ? 401 : 502 });
  }

  const agent = safeAgentMetadata(probe.body);
  if (!agent.name || !agent.app_id) {
    return Response.json({
      status: 'BLOCKED',
      reason: 'AGENT_METADATA_INCOMPLETE',
      secret_alias: credential.alias,
      guardian_agent: agent,
    }, { status: 502 });
  }

  const body = await req.json().catch(() => ({}));
  if (body?.mode === 'metadata') {
    return Response.json({
      status: 'PASS',
      mode: 'metadata',
      authenticated: true,
      secret_alias: credential.alias,
      guardian_agent: agent,
      secret_values_returned: 0,
    });
  }

  if (body?.mode !== 'canary') {
    return Response.json({
      status: 'BLOCKED',
      reason: 'CANARY_ONLY',
      allowed_modes: ['metadata', 'canary'],
    }, { status: 400 });
  }

  try {
    const guardian = createClient({ appId: agent.app_id, token: credential.value });
    const conversation = await guardian.agents.createConversation({
      agent_name: agent.name,
      metadata: {
        mission_id: 'guardian-base44-canary-20260927-001',
        action_class: 'READ',
        protected_actions: false,
      },
    });

    await guardian.agents.addMessage(conversation, {
      role: 'user',
      content: CANARY_MESSAGE,
    });

    const result = await waitForAssistant(guardian, conversation.id);
    const assistantContent = result.assistant?.content ?? null;

    return Response.json({
      status: result.assistant ? 'PASS' : 'DEGRADED',
      mode: 'canary',
      authenticated: true,
      secret_alias: credential.alias,
      guardian_agent: agent,
      conversation_id: conversation.id,
      assistant_response_received: !!result.assistant,
      assistant_content: assistantContent,
      protected_actions_executed: 0,
      secret_values_returned: 0,
    });
  } catch (error) {
    return Response.json({
      status: 'BLOCKED',
      reason: 'AGENT_CONVERSATION_FAILED',
      secret_alias: credential.alias,
      guardian_agent: agent,
      error_type: error?.name || 'Error',
      error_message: String(error?.message || error).slice(0, 300),
      protected_actions_executed: 0,
      secret_values_returned: 0,
    }, { status: 502 });
  }
}
