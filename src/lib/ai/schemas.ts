import { z } from 'zod';

export const ClassificationSchema = z.object({
  topic: z.string().describe('Primary support topic, e.g. Billing & Payments, Technical Support, Security, Sales, Account Access'),
  subtopic: z.string().nullable().optional().describe('Specific subtopic if applicable'),
  urgency: z.enum(['low', 'medium', 'high', 'critical']).or(z.string().transform((v) => {
    const lower = v.toLowerCase();
    if (lower.includes('crit')) return 'critical' as const;
    if (lower.includes('high')) return 'high' as const;
    if (lower.includes('med')) return 'medium' as const;
    return 'low' as const;
  })),
  sentiment: z.enum(['positive', 'neutral', 'frustrated', 'angry', 'uncertain']).or(z.string().transform((v) => {
    const lower = v.toLowerCase();
    if (lower.includes('ang')) return 'angry' as const;
    if (lower.includes('frust')) return 'frustrated' as const;
    if (lower.includes('pos')) return 'positive' as const;
    if (lower.includes('uncert')) return 'uncertain' as const;
    return 'neutral' as const;
  })),
  assigned_team: z.string().describe('Suggested team space, e.g. Billing Team, Technical Support, Security, Customer Success, Sales'),
  confidence: z.number().min(0).max(1).or(z.number().transform((n) => Math.min(1, Math.max(0, n > 1 ? n / 100 : n)))),
  risk_flag: z.string().nullable().optional().describe('Potential risk such as payment dispute, legal threat, account breach, or churn'),
  explanation: z.string().describe('Clear concise 1-2 sentence rationale for this classification'),
  needs_human_review: z.boolean().or(z.string().transform((v) => v === 'true')),
});

export type ClassificationOutput = z.infer<typeof ClassificationSchema>;

export const DraftResponseSchema = z.object({
  reply_text: z.string().describe('Professional, empathetic, and accurate reply to the customer message grounded in provided knowledge articles'),
  cited_knowledge_titles: z.array(z.string()).optional().default([]),
  tone_used: z.enum(['professional', 'friendly', 'concise', 'empathetic']).or(z.string().transform(() => 'professional' as const)),
  reasoning: z.string().nullable().optional(),
});

export type DraftResponseOutput = z.infer<typeof DraftResponseSchema>;
