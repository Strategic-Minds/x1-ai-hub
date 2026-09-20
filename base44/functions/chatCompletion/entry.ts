import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const model = body?.model || 'automatic';
    if (messages.length === 0) {
      return Response.json({ error: 'messages required' }, { status: 400 });
    }

    const conversation = messages
      .map((m) => (m.role === 'user' ? 'User' : 'Assistant') + ': ' + m.content)
      .join('\n\n');
    const prompt =
      'You are AI HUB, a helpful, capable AI assistant operating inside the AI HUB platform — a deterministic capability operating system. Respond concisely and helpfully to the latest user message in the conversation below.\n\nConversation:\n' +
      conversation +
      '\n\nAssistant:';

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model
    });

    const content =
      typeof result === 'string' ? result : (result && result.content) || JSON.stringify(result);
    return Response.json({ content });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}