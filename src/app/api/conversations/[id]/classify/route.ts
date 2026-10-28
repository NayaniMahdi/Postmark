import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { AIEngine } from '@/lib/ai/engine';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const conv = store.getConversationById(id);
    if (!conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const latestMessage = conv.messages[conv.messages.length - 1];
    const settings = store.getSettings();
    const engine = new AIEngine({
      primaryProvider: settings.primaryProvider,
      fallbackProvider: settings.fallbackProvider,
      classifierModel: settings.classifierModel,
      nvidiaApiKey: settings.nvidiaApiKey,
      openrouterApiKey: settings.openrouterApiKey,
    });

    const result = await engine.classify({
      senderName: conv.sender_name,
      senderEmail: conv.sender_email,
      subject: conv.subject,
      messageBody: latestMessage?.body_text || conv.snippet,
    });

    const classification = {
      id: `cls-${Date.now()}`,
      conversation_id: id,
      topic: result.topic,
      subtopic: result.subtopic,
      urgency: result.urgency,
      sentiment: result.sentiment,
      assigned_team: result.assigned_team,
      confidence: result.confidence,
      risk_flag: result.risk_flag,
      explanation: result.explanation,
      needs_human_review: result.needs_human_review,
      provider: result.meta.provider,
      model: result.meta.model,
      latency_ms: result.meta.latencyMs,
      created_at: new Date().toISOString(),
    };

    store.setClassification(id, classification);

    store.recordAuditEvent({
      conversation_id: id,
      event_type: 'classified',
      description: `Classified as ${classification.topic} (${classification.urgency} urgency, ${Math.round(classification.confidence * 100)}% confidence)`,
      actor: `AI (${result.meta.provider.toUpperCase()} / ${result.meta.model})`,
      metadata: {
        latencyMs: result.meta.latencyMs,
        fallbackUsed: result.meta.fallbackUsed,
      },
    });

    return NextResponse.json({ classification });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
