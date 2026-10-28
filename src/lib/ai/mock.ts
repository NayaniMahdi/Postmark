import { AIProvider, AIProviderContext, AIClassificationResult, AIDraftResult } from './types';
import { Urgency, Sentiment } from '@/types';

export class MockProvider implements AIProvider {
  name = 'mock' as const;

  async classify(context: AIProviderContext): Promise<AIClassificationResult> {
    const text = `${context.subject} ${context.messageBody}`.toLowerCase();

    let topic = 'General Inquiry';
    let assigned_team = 'Customer Success';
    let urgency: Urgency = 'low';
    let sentiment: Sentiment = 'neutral';
    let risk_flag: string | undefined = undefined;
    let explanation = 'Routine customer question regarding workspace features.';
    let needs_human_review = false;
    let confidence = 0.94;

    if (text.includes('charge') || text.includes('refund') || text.includes('billing') || text.includes('invoice') || text.includes('subscription')) {
      topic = 'Billing & Payments';
      assigned_team = 'Billing Team';
      urgency = text.includes('twice') || text.includes('unauthorized') || text.includes('refund') ? 'high' : 'medium';
      sentiment = text.includes('angry') || text.includes('dispute') ? 'angry' : 'frustrated';
      risk_flag = text.includes('twice') ? 'Potential payment dispute' : 'Refund review requested';
      explanation = 'The customer mentions being charged and requests resolution, which clearly indicates a billing issue.';
      needs_human_review = urgency === 'high';
      confidence = 0.94;
    } else if (text.includes('crash') || text.includes('error') || text.includes('bug') || text.includes('fail') || text.includes('login') || text.includes('cannot access')) {
      topic = 'Technical Support';
      assigned_team = 'Technical Support';
      urgency = 'high';
      sentiment = 'frustrated';
      risk_flag = 'Service disruption reported';
      explanation = 'Customer is unable to use the product or login, requiring immediate technical troubleshooting.';
      needs_human_review = true;
      confidence = 0.92;
    } else if (text.includes('security') || text.includes('breach') || text.includes('password') || text.includes('unknown device') || text.includes('2fa')) {
      topic = 'Security';
      assigned_team = 'Security';
      urgency = 'critical';
      sentiment = 'frustrated';
      risk_flag = 'Potential unauthorized account access';
      explanation = 'Security alert indicating unexpected login or credential concern. High risk priority.';
      needs_human_review = true;
      confidence = 0.96;
    } else if (text.includes('pricing') || text.includes('enterprise') || text.includes('demo') || text.includes('quote')) {
      topic = 'Sales';
      assigned_team = 'Sales';
      urgency = 'medium';
      sentiment = 'positive';
      explanation = 'Inquiry regarding product tiers, pricing, or enterprise procurement.';
      needs_human_review = false;
      confidence = 0.91;
    } else if (text.includes('feature') || text.includes('suggestion') || text.includes('would be great if')) {
      topic = 'Product Inquiry';
      assigned_team = 'Customer Success';
      urgency = 'low';
      sentiment = 'positive';
      explanation = 'Customer feedback and feature suggestion.';
      needs_human_review = false;
      confidence = 0.89;
    }

    return {
      topic,
      subtopic: 'Customer Inquiry',
      urgency,
      sentiment,
      assigned_team,
      confidence,
      risk_flag,
      explanation,
      needs_human_review,
      meta: {
        provider: 'mock',
        model: 'simulated-engine-v1',
        latencyMs: 140,
        tokensUsed: 210,
        rawResponse: '{"simulated": true}',
      },
    };
  }

  async generateDraft(context: AIProviderContext): Promise<AIDraftResult> {
    const text = `${context.subject} ${context.messageBody}`.toLowerCase();
    const name = context.senderName.split(' ')[0] || 'there';

    let reply_text = '';
    const cited_knowledge_titles: string[] = [];
    const cited_knowledge_ids: string[] = [];

    if (text.includes('charge') || text.includes('twice') || text.includes('subscription')) {
      reply_text = `Hi ${name},

Thank you for bringing this to our attention. I'm sorry for the inconvenience caused by the duplicate subscription charge.

Our billing team will review the transactions associated with your account to determine whether a duplicate charge occurred. Once verified, we will initiate a prompt refund in accordance with our billing policy.

Thank you for your patience.

Best regards,
The Support Team`;
      cited_knowledge_titles.push('Duplicate Payment Policy', 'Refund Eligibility Guidelines');
      cited_knowledge_ids.push('kb-1', 'kb-2');
    } else if (text.includes('crash') || text.includes('login') || text.includes('error')) {
      reply_text = `Hi ${name},

Thanks for reaching out. We apologize for the trouble logging into your account.

Could you let us know what browser version or device you are currently using, and whether you see a specific error code? In the meantime, clearing your browser cache or trying an incognito window often resolves cached session conflicts.

We're standing by to get this sorted out for you right away.

Best regards,
The Technical Support Team`;
      cited_knowledge_titles.push('Login Troubleshooting Guide');
      cited_knowledge_ids.push('kb-3');
    } else if (text.includes('security') || text.includes('unknown device')) {
      reply_text = `Hi ${name},

Thank you for reporting this immediately. We take account security very seriously.

We have temporarily flagged your session and recommend resetting your password through our secure portal immediately. Please also verify that Two-Factor Authentication (2FA) is enabled under your Account Settings. Our security engineering team is auditing the recent login IP addresses.

Best regards,
Security Operations`;
      cited_knowledge_titles.push('Account Takeover Prevention', '2FA Recovery Guide');
      cited_knowledge_ids.push('kb-4', 'kb-5');
    } else {
      reply_text = `Hi ${name},

Thank you for contacting Postmark Support!

We have received your message regarding "${context.subject}". Our team is reviewing the details and will follow up with specific information shortly.

If you have any additional notes to add, please feel free to reply directly to this thread.

Best regards,
The Support Team`;
      cited_knowledge_titles.push('General Support SLA & Response Times');
      cited_knowledge_ids.push('kb-6');
    }

    return {
      reply_text,
      cited_knowledge_titles,
      cited_knowledge_ids,
      tone_used: context.tone || 'professional',
      reasoning: 'Generated grounded template based on customer inquiry keywords.',
      meta: {
        provider: 'mock',
        model: 'simulated-engine-v1',
        latencyMs: 180,
        tokensUsed: 320,
      },
    };
  }

  async refineDraft(
    currentDraft: string,
    instruction: 'shorter' | 'details' | 'friendly' | 'professional' | 'concise' | 'empathetic',
    context: AIProviderContext
  ): Promise<AIDraftResult> {
    const name = context.senderName.split(' ')[0] || 'there';
    let refined = currentDraft;

    if (instruction === 'shorter' || instruction === 'concise') {
      refined = `Hi ${name},

We are investigating this issue for you right away. We will verify the transaction details and update you as soon as the review is complete.

Thank you for your patience!

Best regards,
The Support Team`;
    } else if (instruction === 'empathetic') {
      refined = `Hi ${name},

I completely understand how frustrating this must be, and I am truly sorry for the stress this has caused. 

Please be assured that I am personally reviewing your inquiry with our senior team. We will ensure this is resolved smoothly and that your account is updated properly.

Warmly,
The Support Team`;
    } else if (instruction === 'details') {
      refined = currentDraft + `\n\nReference ID: REF-${Math.floor(100000 + Math.random() * 900000)}\nEstimated turnaround: Under 2 business hours.`;
    }

    return {
      reply_text: refined,
      cited_knowledge_titles: [],
      cited_knowledge_ids: [],
      tone_used: instruction === 'empathetic' ? 'empathetic' : instruction === 'shorter' || instruction === 'concise' ? 'concise' : 'professional',
      reasoning: `Adjusted text according to instruction: ${instruction}`,
      meta: {
        provider: 'mock',
        model: 'simulated-engine-v1',
        latencyMs: 90,
      },
    };
  }

  async checkHealth(): Promise<{ ok: boolean; message: string }> {
    return { ok: true, message: 'Mock provider active (simulated inference)' };
  }
}
