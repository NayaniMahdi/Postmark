import { Conversation, Classification, Draft, DraftTone } from '@/types';
import { store } from '@/lib/store';
import { AIEngine } from './engine';

export async function processConversationWithAI(conversation: Conversation): Promise<Conversation> {
  const settings = store.getSettings();
  const engine = new AIEngine({
    primaryProvider: settings.primaryProvider,
    fallbackProvider: settings.fallbackProvider,
    classifierModel: settings.classifierModel,
    draftModel: settings.draftModel,
    fallbackModel: settings.fallbackModel,
    nvidiaApiKey: settings.nvidiaApiKey,
    openrouterApiKey: settings.openrouterApiKey,
  });

  const latestMessage = conversation.messages[conversation.messages.length - 1];
  const messageBody = latestMessage?.body_text || conversation.snippet || conversation.subject;

  // 1. Ensure timeline has email_received
  const existingTimeline = store.getAuditEvents(conversation.id);
  if (!existingTimeline.some((e) => e.event_type === 'email_received')) {
    store.recordAuditEvent({
      conversation_id: conversation.id,
      event_type: 'email_received',
      description: `Inbound email received from ${conversation.sender_name}`,
      actor: conversation.sender_name,
      timestamp: conversation.received_at,
    });
  }

  // 2. Dynamic Classification if not already present
  if (!conversation.classification) {
    try {
      const clsResult = await engine.classify({
        senderName: conversation.sender_name,
        senderEmail: conversation.sender_email,
        subject: conversation.subject,
        messageBody,
      });

      const classification: Classification = {
        id: `cls-${Date.now()}`,
        conversation_id: conversation.id,
        topic: clsResult.topic,
        subtopic: clsResult.subtopic,
        urgency: clsResult.urgency,
        sentiment: clsResult.sentiment,
        assigned_team: clsResult.assigned_team,
        confidence: clsResult.confidence,
        risk_flag: clsResult.risk_flag,
        explanation: clsResult.explanation,
        needs_human_review: clsResult.needs_human_review,
        provider: clsResult.meta.provider,
        model: clsResult.meta.model,
        latency_ms: clsResult.meta.latencyMs,
        created_at: new Date().toISOString(),
      };

      conversation.classification = classification;
      conversation.priority = classification.urgency;
      if (classification.needs_human_review && !conversation.tags.includes('Needs Review')) {
        conversation.tags.push('Needs Review');
      }

      store.setClassification(conversation.id, classification);

      store.recordAuditEvent({
        conversation_id: conversation.id,
        event_type: 'classified',
        description: `AI classified as ${classification.topic} (${classification.urgency} urgency, ${Math.round(classification.confidence * 100)}% confidence)`,
        actor: `AI Classifier (${clsResult.meta.provider.toUpperCase()} / ${clsResult.meta.model})`,
        metadata: { latencyMs: clsResult.meta.latencyMs, fallbackUsed: clsResult.meta.fallbackUsed },
      });
    } catch (err) {
      console.warn('AI classification error on conversation:', err);
    }
  }

  // 3. Dynamic Draft Generation if not already present
  if (!conversation.draft) {
    try {
      const knowledgeArticles = store.getKnowledgeArticles().filter((k) => k.status === 'approved');
      const draftResult = await engine.generateDraft({
        senderName: conversation.sender_name,
        senderEmail: conversation.sender_email,
        subject: conversation.subject,
        messageBody,
        knowledgeArticles: knowledgeArticles.map((k) => ({
          id: k.id,
          title: k.title,
          excerpt: k.excerpt,
          content: k.content,
        })),
        tone: settings.supportTone || 'professional',
      });

      const draft: Draft = {
        id: `drf-${Date.now()}`,
        conversation_id: conversation.id,
        version: 1,
        content: draftResult.reply_text,
        tone: (draftResult.tone_used as DraftTone) || 'professional',
        is_approved: false,
        provider: draftResult.meta.provider,
        model: draftResult.meta.model,
        latency_ms: draftResult.meta.latencyMs,
        cited_knowledge_ids: draftResult.cited_knowledge_ids,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      conversation.draft = draft;
      store.updateConversation(conversation.id, { draft, priority: conversation.priority });

      store.recordAuditEvent({
        conversation_id: conversation.id,
        event_type: 'draft_generated',
        description: `Draft v1 generated (${draft.tone} tone, ${draftResult.meta.provider.toUpperCase()} ${draftResult.meta.model})`,
        actor: `AI Drafter (${draftResult.meta.provider.toUpperCase()})`,
        metadata: {
          latencyMs: draftResult.meta.latencyMs,
          citedKnowledgeCount: draftResult.cited_knowledge_ids.length,
          fallbackUsed: draftResult.meta.fallbackUsed,
        },
      });
    } catch (err) {
      console.warn('AI draft generation error on conversation:', err);
    }
  }

  return conversation;
}
