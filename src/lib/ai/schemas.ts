import { z } from 'zod';

export const ClassificationSchema = z.object({
  topic: z.string().describe('Primary support topic, e.g. Billing & Payments, Technical Support, Security, Sales, Account Access'),
  subtopic: z.string().optional().describe('Specific subtopic if applicable'),
  urgency: z.enum(['low', 'medium', 'high', 'critical']).describe('Urgency level based on customer impact and emotion'),
  sentiment: z.enum(['positive', 'neutral', 'frustrated', 'angry', 'uncertain']).describe('Customer sentiment in the message'),
  assigned_team: z.string().describe('Suggested team space, e.g. Billing Team, Technical Support, Security, Customer Success, Sales'),
  confidence: z.number().min(0).max(1).describe('Confidence score between 0.0 and 1.0 (e.g. 0.94 for 94%)'),
  risk_flag: z.string().optional().describe('Potential risk such as payment dispute, legal threat, account breach, or churn'),
  explanation: z.string().describe('Clear concise 1-2 sentence rationale for this classification'),
  needs_human_review: z.boolean().describe('True if case has high urgency, risk flags, or low confidence'),
});

export type ClassificationOutput = z.infer<typeof ClassificationSchema>;

export const DraftResponseSchema = z.object({
  reply_text: z.string().describe('Professional, empathetic, and accurate reply to the customer message grounded in provided knowledge articles'),
  cited_knowledge_titles: z.array(z.string()).describe('List of exact article titles cited or relied upon'),
  tone_used: z.enum(['professional', 'friendly', 'concise', 'empathetic']),
  reasoning: z.string().optional().describe('Brief rationale on how the draft addresses the customer inquiry'),
});

export type DraftResponseOutput = z.infer<typeof DraftResponseSchema>;
