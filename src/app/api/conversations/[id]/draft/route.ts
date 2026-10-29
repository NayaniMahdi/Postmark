import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { AIEngine } from '@/lib/ai/engine';
import { DraftTone } from '@/types';

export const maxDuration = 60;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const tone: DraftTone = body.tone || 'professional';
    const instruction: string | undefined = body.instruction; // 'shorter' | 'details' | 'friendly' | 'professional' | 'concise' | 'empathetic'

    const conv = store.getConversationById(id);
    if (!conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const latestMessage = conv.messages[conv.messages.length - 1];
    const settings = store.getSettings();
    const knowledgeArticles = store.getKnowledgeArticles().filter((k) => k.status === 'approved');

    const engine = new AIEngine({
      primaryProvider: settings.primaryProvider,
      fallbackProvider: settings.fallbackProvider,
      draftModel: settings.draftModel,
      fallbackModel: settings.fallbackModel,
      nvidiaApiKey: settings.nvidiaApiKey,
      openrouterApiKey: settings.openrouterApiKey,
    });

    const context = {
      senderName: conv.sender_name,
      senderEmail: conv.sender_email,
      subject: conv.subject,
      messageBody: latestMessage?.body_text || conv.snippet,
      knowledgeArticles: knowledgeArticles.map((k) => ({
        id: k.id,
        title: k.title,
        excerpt: k.excerpt,
        content: k.content,
      })),
      tone,
    };

    let result;
    if (instruction && conv.draft?.content) {
      // Refining existing draft
      result = await engine.refineDraft(conv.draft.content, instruction as any, context);
    } else {
      // Generating new draft
      result = await engine.generateDraft(context);
    }

    // Creating or updating draft in store (invalidates prior approval)
    const currentVersion = conv.draft ? conv.draft.version + 1 : 1;
    const updatedDraft = {
      id: conv.draft?.id || `drf-${Date.now()}`,
      conversation_id: id,
      version: currentVersion,
      content: result.reply_text,
      tone: result.tone_used as DraftTone,
      is_approved: false,
      provider: result.meta.provider,
      model: result.meta.model,
      latency_ms: result.meta.latencyMs,
      cited_knowledge_ids: result.cited_knowledge_ids,
      created_at: conv.draft?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    conv.draft = updatedDraft;

    store.recordAuditEvent({
      conversation_id: id,
      event_type: 'draft_generated',
      description: `Draft v${updatedDraft.version} generated (${updatedDraft.tone} tone, ${result.meta.provider.toUpperCase()} ${result.meta.model})`,
      actor: `AI Drafter (${result.meta.provider.toUpperCase()})`,
      metadata: {
        latencyMs: result.meta.latencyMs,
        citedKnowledgeCount: result.cited_knowledge_ids.length,
        fallbackUsed: result.meta.fallbackUsed,
      },
    });

    return NextResponse.json({ draft: updatedDraft });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
