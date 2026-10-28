import { describe, it, expect } from 'vitest';
import { verifyDraftApproval, invalidateDraftOnEdit, approveDraftVersion } from '@/lib/safety/approval';
import { Draft } from '@/types';
import { ClassificationSchema, DraftResponseSchema } from '@/lib/ai/schemas';
import { MockProvider } from '@/lib/ai/mock';
import { AIEngine } from '@/lib/ai/engine';

describe('Safety & Human Approval Rules', () => {
  const sampleDraft: Draft = {
    id: 'drf-test',
    conversation_id: 'conv-test',
    version: 1,
    content: 'Hi Rahul, we have reviewed your duplicate payment.',
    tone: 'professional',
    is_approved: false,
    provider: 'nvidia',
    model: 'meta/llama-3.3-70b-instruct',
    latency_ms: 180,
    cited_knowledge_ids: ['kb-1'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  it('RULE 1: Drafts cannot be sent without explicit approval', () => {
    const checkUnapproved = verifyDraftApproval(sampleDraft, 1);
    expect(checkUnapproved.valid).toBe(false);
    expect(checkUnapproved.reason).toContain('Draft has not received explicit human approval');
  });

  it('RULE 2: Approved draft passes verification with exact matching version', () => {
    const approved = approveDraftVersion(sampleDraft, 'Specialist User');
    expect(approved.is_approved).toBe(true);
    expect(approved.approved_at).toBeDefined();

    const verification = verifyDraftApproval(approved, 1);
    expect(verification.valid).toBe(true);
  });

  it('RULE 3: Editing invalidates previous approval and bumps draft version', () => {
    const approved = approveDraftVersion(sampleDraft, 'Specialist User');
    expect(approved.is_approved).toBe(true);

    const edited = invalidateDraftOnEdit(approved, 'Hi Rahul, updated modified sentence.');
    expect(edited.is_approved).toBe(false);
    expect(edited.version).toBe(2);
    expect(edited.approved_at).toBeUndefined();

    // Trying to send with old expected version fails
    const oldVersionCheck = verifyDraftApproval(edited, 1);
    expect(oldVersionCheck.valid).toBe(false);

    // Trying to send without re-approving version 2 fails
    const newVersionCheck = verifyDraftApproval(edited, 2);
    expect(newVersionCheck.valid).toBe(false);
    expect(newVersionCheck.reason).toContain('Draft has not received explicit human approval');
  });

  it('RULE 4: Classification schema rejects invalid model output missing required fields', () => {
    const invalidOutput = {
      topic: 'Billing',
      // missing urgency, sentiment, assigned_team, confidence, explanation
    };

    const parseResult = ClassificationSchema.safeParse(invalidOutput);
    expect(parseResult.success).toBe(false);
  });

  it('RULE 5: Classification schema accepts valid structured AI output', () => {
    const validOutput = {
      topic: 'Billing & Payments',
      urgency: 'high',
      sentiment: 'frustrated',
      assigned_team: 'Billing Team',
      confidence: 0.94,
      explanation: 'Customer reported duplicate charge and demands refund.',
      needs_human_review: true,
    };

    const parseResult = ClassificationSchema.safeParse(validOutput);
    expect(parseResult.success).toBe(true);
  });

  it('RULE 6: AI Fallback engine operates gracefully when keys are omitted', async () => {
    const engine = new AIEngine({ primaryProvider: 'mock', fallbackProvider: 'mock' });
    const classification = await engine.classify({
      senderName: 'Rahul Sharma',
      senderEmail: 'rahul.sharma@gmail.com',
      subject: 'Charged twice for my subscription',
      messageBody: 'Hello, my bank account has been charged twice for the same subscription.',
    });

    expect(classification.topic).toBe('Billing & Payments');
    expect(classification.urgency).toBe('high');
    expect(classification.confidence).toBeGreaterThan(0.9);
  });

  it('RULE 7: Draft generation correctly cites grounding knowledge articles', async () => {
    const mock = new MockProvider();
    const draft = await mock.generateDraft({
      senderName: 'Rahul Sharma',
      senderEmail: 'rahul.sharma@gmail.com',
      subject: 'Charged twice for my subscription',
      messageBody: 'Charged twice for monthly subscription',
      knowledgeArticles: [
        {
          id: 'kb-1',
          title: 'Duplicate Payment Policy',
          excerpt: 'Policy on duplicate charges',
          content: 'Refund duplicate charges within 3-5 days.',
        },
      ],
    });

    expect(draft.reply_text).toContain('Rahul');
    expect(draft.cited_knowledge_titles).toContain('Duplicate Payment Policy');
    expect(draft.cited_knowledge_ids).toContain('kb-1');
  });
});
