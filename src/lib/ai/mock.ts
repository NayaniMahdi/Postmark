import { AIProvider, AIProviderContext, AIClassificationResult, AIDraftResult } from './types';
import { Urgency, Sentiment } from '@/types';

export class MockProvider implements AIProvider {
  name = 'mock' as const;

  async classify(context: AIProviderContext): Promise<AIClassificationResult> {
    const text = `${context.subject} ${context.messageBody}`.toLowerCase();
    const email = context.senderEmail.toLowerCase();
    const sender = context.senderName.toLowerCase();

    let topic = 'General Inquiry';
    let subtopic = 'Correspondence';
    let assigned_team = 'Customer Success';
    let urgency: Urgency = 'low';
    let sentiment: Sentiment = 'neutral';
    let risk_flag: string | undefined = undefined;
    let explanation = `Email received from ${context.senderName} regarding ${context.subject}.`;
    let needs_human_review = false;
    let confidence = 0.94;

    // 1. Academic & University
    const isAcademic =
      email.includes('.edu') ||
      email.includes('.ac.in') ||
      email.includes('university') ||
      email.includes('college') ||
      sender.includes('university') ||
      sender.includes('librarian') ||
      sender.includes('professor') ||
      sender.includes('faculty') ||
      sender.includes('registrar') ||
      text.includes('semester') ||
      text.includes('exam') ||
      text.includes('syllabus') ||
      text.includes('lecture') ||
      text.includes('coursework');

    // 2. Career & Placement
    const isPlacement =
      sender.includes('placement') ||
      email.includes('placement') ||
      text.includes('placement') ||
      text.includes('recruitment') ||
      text.includes('training session') ||
      text.includes('campus drive') ||
      text.includes('interview schedule') ||
      text.includes('job opening') ||
      text.includes('internship');

    // 3. Events & Conferences
    const isEvent =
      text.includes('keynote') ||
      text.includes('gtc') ||
      text.includes('summit') ||
      text.includes('conference') ||
      text.includes('festival') ||
      text.includes('webinar') ||
      text.includes('livestream') ||
      text.includes('workshop');

    // 4. Marketing & Newsletter
    const isMarketing =
      email.includes('newsletter') ||
      email.includes('news@') ||
      email.includes('promo') ||
      email.includes('apollo.io') ||
      text.includes('unsubscribe') ||
      text.includes('prospects') ||
      text.includes('discount') ||
      text.includes('limited time offer') ||
      text.includes('weekly digest');

    if (isPlacement) {
      topic = 'Career & Placement';
      subtopic = text.includes('training') ? 'Placement Training' : 'Campus Recruitment';
      assigned_team = 'Career & Placement Cell';
      urgency = text.includes('mandatory') || text.includes('tomorrow') || text.includes('schedule') ? 'high' : 'medium';
      sentiment = 'positive';
      risk_flag = text.includes('mandatory') ? 'Mandatory Session Attendance' : undefined;
      explanation = `Placement circular from ${context.senderName} announcing ${context.subject}.`;
      needs_human_review = urgency === 'high';
      confidence = 0.95;
    } else if (isAcademic) {
      topic = 'Academic & University';
      subtopic = text.includes('library') ? 'Library & Campus Resources' : 'University Notice';
      assigned_team = 'Academic & Student Affairs';
      urgency = text.includes('exam') || text.includes('deadline') ? 'high' : 'medium';
      sentiment = 'neutral';
      explanation = `Academic communication from ${context.senderName} regarding ${context.subject}.`;
      needs_human_review = false;
      confidence = 0.96;
    } else if (isEvent) {
      topic = 'Events & Conferences';
      subtopic = 'Event Invitation';
      assigned_team = 'Events & Community';
      urgency = 'low';
      sentiment = 'positive';
      explanation = `Event announcement and invitation for ${context.subject}.`;
      needs_human_review = false;
      confidence = 0.93;
    } else if (isMarketing) {
      topic = 'Marketing & Newsletters';
      subtopic = 'Newsletter / Sales Outreach';
      assigned_team = 'Marketing & Growth';
      urgency = 'low';
      sentiment = 'neutral';
      explanation = `Promotional campaign or industry newsletter from ${context.senderName}.`;
      needs_human_review = false;
      confidence = 0.92;
    } else if (text.includes('charge') || text.includes('refund') || text.includes('billing') || text.includes('invoice') || text.includes('subscription')) {
      topic = 'Billing & Payments';
      subtopic = 'Payment Inquiry';
      assigned_team = 'Billing Team';
      urgency = text.includes('twice') || text.includes('unauthorized') || text.includes('refund') ? 'high' : 'medium';
      sentiment = 'frustrated';
      risk_flag = text.includes('twice') ? 'Potential payment dispute' : 'Refund review requested';
      explanation = 'Customer inquiry regarding account billing or payment adjustment.';
      needs_human_review = true;
      confidence = 0.94;
    } else if (text.includes('crash') || text.includes('bug report') || text.includes('api failure') || text.includes('server error')) {
      topic = 'Customer Support';
      subtopic = 'Technical Issue';
      assigned_team = 'Technical Support';
      urgency = 'high';
      sentiment = 'frustrated';
      risk_flag = 'Service disruption reported';
      explanation = 'Technical support request regarding product issue or error.';
      needs_human_review = true;
      confidence = 0.93;
    } else if (text.includes('security alert') || text.includes('suspicious login') || text.includes('2fa reset')) {
      topic = 'Automated Notification & Security';
      subtopic = 'Account Security';
      assigned_team = 'Security';
      urgency = 'critical';
      sentiment = 'neutral';
      risk_flag = 'Account Security Alert';
      explanation = 'Security alert indicating authentication or access verification.';
      needs_human_review = true;
      confidence = 0.97;
    }

    return {
      topic,
      subtopic,
      urgency,
      sentiment,
      assigned_team,
      confidence,
      risk_flag,
      explanation,
      needs_human_review,
      meta: {
        provider: 'mock',
        model: 'simulated-engine-v2',
        latencyMs: 120,
        tokensUsed: 190,
        rawResponse: '{"simulated": true}',
      },
    };
  }

  async generateDraft(context: AIProviderContext): Promise<AIDraftResult> {
    const text = `${context.subject} ${context.messageBody}`.toLowerCase();
    const email = context.senderEmail.toLowerCase();
    const sender = context.senderName.toLowerCase();
    const name = context.senderName.split(' ')[0] || 'Team';

    let reply_text = '';
    const cited_knowledge_titles: string[] = [];
    const cited_knowledge_ids: string[] = [];

    const isAcademicOrPlacement =
      email.includes('.edu') ||
      email.includes('.ac.in') ||
      email.includes('university') ||
      sender.includes('university') ||
      sender.includes('placement') ||
      sender.includes('librarian') ||
      sender.includes('professor');

    const isEventOrNewsletter =
      email.includes('news@') ||
      email.includes('apollo.io') ||
      text.includes('keynote') ||
      text.includes('webinar') ||
      text.includes('gtc') ||
      text.includes('festival') ||
      text.includes('unsubscribe');

    if (isAcademicOrPlacement) {
      if (text.includes('training') || text.includes('placement') || text.includes('session')) {
        reply_text = `Dear ${context.senderName},

Thank you for sharing the schedule and details regarding the ${context.subject}.

I have noted the date, time, and instructions and will ensure my active attendance and participation as requested.

Thank you & Best regards,
Student / Candidate`;
      } else if (text.includes('book') || text.includes('invitation') || text.includes('library')) {
        reply_text = `Dear ${context.senderName},

Thank you very much for sharing the invitation regarding the ${context.subject}.

I appreciate you keeping us informed about this campus opportunity and have noted the dates and location.

Warm regards,`;
      } else {
        reply_text = `Dear ${context.senderName},

Thank you for the update regarding ${context.subject}.

I have received and carefully reviewed the circular. Please let me know if any further action or documentation is required from my end.

Best regards,`;
      }
    } else if (isEventOrNewsletter) {
      reply_text = `Hi ${name},

Thank you for sharing this update regarding "${context.subject}".

I have noted the details and schedule.

Best regards,`;
    } else if (text.includes('charge') || text.includes('refund') || text.includes('invoice')) {
      reply_text = `Hi ${name},

Thank you for contacting our support team regarding your billing inquiry for "${context.subject}".

Our finance team is currently reviewing your account records and will ensure any necessary adjustments or clarifications are provided promptly.

Thank you for your patience.

Best regards,
Customer Support Team`;
      cited_knowledge_titles.push('Duplicate Payment Policy', 'Refund Eligibility Guidelines');
      cited_knowledge_ids.push('kb-1', 'kb-2');
    } else {
      reply_text = `Hi ${name},

Thank you for reaching out regarding "${context.subject}".

We have received your message and are currently reviewing your request. We will follow up with complete details shortly.

Best regards,
Customer Support Team`;
    }

    return {
      reply_text,
      cited_knowledge_titles,
      cited_knowledge_ids,
      tone_used: context.tone || 'professional',
      reasoning: 'Context-aware draft generated based on sender category and message content.',
      meta: {
        provider: 'mock',
        model: 'simulated-engine-v2',
        latencyMs: 150,
        tokensUsed: 220,
      },
    };
  }

  async refineDraft(
    currentDraft: string,
    instruction: 'shorter' | 'details' | 'friendly' | 'professional' | 'concise' | 'empathetic',
    context: AIProviderContext
  ): Promise<AIDraftResult> {
    let modified = currentDraft;
    if (instruction === 'shorter' || instruction === 'concise') {
      const lines = currentDraft.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length > 2) {
        modified = `${lines[0]}\n\n${lines[1]}\n\nBest regards,`;
      }
    } else if (instruction === 'friendly') {
      modified = currentDraft.replace('Best regards,', 'Warm regards & have a wonderful week,');
    }

    return {
      reply_text: modified,
      cited_knowledge_titles: [],
      cited_knowledge_ids: [],
      tone_used: 'professional',
      reasoning: `Refined draft to be ${instruction}`,
      meta: {
        provider: 'mock',
        model: 'simulated-engine-v2',
        latencyMs: 80,
        tokensUsed: 120,
      },
    };
  }

  async checkHealth(): Promise<{ ok: boolean; message: string }> {
    return { ok: true, message: 'Simulated mock provider is operational.' };
  }
}

