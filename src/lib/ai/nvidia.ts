import { AIProvider, AIProviderContext, AIClassificationResult, AIDraftResult } from './types';
import { ClassificationSchema, DraftResponseSchema, parseJsonFromLlm } from './schemas';
import { DEFAULT_NVIDIA_CLASSIFIER, DEFAULT_NVIDIA_DRAFT } from './models';

export class NvidiaProvider implements AIProvider {
  name = 'nvidia' as const;
  private apiKey: string;
  private baseUrl = 'https://integrate.api.nvidia.com/v1';

  constructor(apiKey?: string) {
    const raw = apiKey || process.env.NVIDIA_API_KEY || '';
    this.apiKey = raw
      .trim()
      .replace(/^bearer\s+/i, '')
      .replace(/^["']|["']$/g, '')
      .trim();
  }

  private async callChat(model: string, messages: { role: string; content: string }[], temperature = 0.2) {
    if (!this.apiKey) {
      throw new Error('NVIDIA API Key is missing. Please provide NVIDIA_API_KEY.');
    }

    // Remap deprecated, discontinued, or account-inaccessible model endpoints automatically
    let requestedModel = model;
    if (
      !requestedModel ||
      requestedModel.includes('llama-3.3') ||
      requestedModel.includes('llama-3.1') ||
      requestedModel.includes('gemma') ||
      requestedModel.includes('mistral') ||
      requestedModel.includes('nemotron')
    ) {
      requestedModel = DEFAULT_NVIDIA_CLASSIFIER;
    }

    const candidateModels = Array.from(new Set([requestedModel, DEFAULT_NVIDIA_CLASSIFIER]));

    let lastError: Error | null = null;

    for (const activeModel of candidateModels) {
      try {
        const startTime = Date.now();
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: activeModel,
            messages,
            temperature,
            max_tokens: 1024,
            response_format: { type: 'json_object' },
          }),
          signal: AbortSignal.timeout(15000),
        });

        const latencyMs = Date.now() - startTime;

        if (!response.ok) {
          const errText = await response.text();
          // If model is discontinued (410) or not found (404), try next verified candidate
          if (
            response.status === 410 ||
            response.status === 404 ||
            errText.includes('Not found') ||
            errText.includes('end of life') ||
            errText.includes('no longer available')
          ) {
            console.warn(`[NVIDIA NIM] Model ${activeModel} is unavailable (${response.status}), falling back to next model...`);
            lastError = new Error(`NVIDIA Model ${activeModel} unavailable: ${errText}`);
            continue;
          }
          throw new Error(`NVIDIA API error (${response.status}): ${errText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        const tokensUsed = data.usage?.total_tokens;

        return { content, latencyMs, tokensUsed, resolvedModel: activeModel };
      } catch (err: any) {
        lastError = err;
        if (
          err.message?.includes('410') ||
          err.message?.includes('404') ||
          err.message?.includes('end of life') ||
          err.message?.includes('no longer available')
        ) {
          continue;
        }
        throw err;
      }
    }

    throw lastError || new Error('NVIDIA NIM API failed with all candidate models.');
  }

  async classify(context: AIProviderContext, model = DEFAULT_NVIDIA_CLASSIFIER): Promise<AIClassificationResult> {
    const systemPrompt = `You are an elite, contextual email intelligence triage engine.
Analyze the inbound email and provide an extraordinarily accurate, context-aware classification.

CATEGORIES & ROUTING:
1. "Academic & University":
   - Emails from universities, colleges, departments, professors, academic registrars, exam controllers, campus libraries, student affairs (e.g. universities, colleges, .edu, .ac.in, .edu.in).
   - Assigned Team: "Academic & Student Affairs"
   - Topics: Coursework, semester schedules, assignment deadlines, exam notifications, circulars, library announcements, grading.

2. "Career & Placement":
   - Campus recruitment, training sessions, placement cell circulars (e.g. Elsner, TCS, aptitude tests), job openings, internship offers, recruiter outreaches, interview schedules.
   - Assigned Team: "Career & Placement Cell"
   - Urgency: "high" if mandatory session or upcoming deadline/interview; otherwise "medium".

3. "Customer Support":
   - Inbound customer/client tickets, bug reports, feature requests, system troubleshooting, user feedback, service assistance.
   - Assigned Team: "Technical Support" or "Customer Success"
   - Urgency: matches severity (critical/high/medium/low).

4. "Billing & Financial":
   - Direct invoices, subscription renewals, charge disputes, payment receipts, refund requests, bank/Stripe notices.
   - Assigned Team: "Billing Team"

5. "Events & Conferences":
   - Tech summits, keynotes (e.g., NVIDIA GTC), hackathons, book fairs, webinar registrations, workshop invites.
   - Assigned Team: "Events & Community"
   - Urgency: "low" or "medium".

6. "Marketing & Newsletters":
   - Cold sales outreach, SaaS marketing newsletters (e.g. Apollo, Substack, Medium), promotional discounts, retail offers.
   - Assigned Team: "Marketing & Growth"
   - Urgency: "low", risk_flag: null, needs_human_review: false.

7. "Automated Notification & Security":
   - System transactional alerts, OTPs, 2FA verification, password resets, GitHub alerts, delivery tracking, security warnings.
   - Assigned Team: "Operations & Systems" or "Security"

8. "Direct Professional & Personal":
   - 1-on-1 direct correspondence from colleagues, collaborators, contacts, or networking.
   - Assigned Team: "Direct Inquiries"

ACCURACY RULES:
- Never classify a university training session, placement circular, or academic notice as generic "Technical Support" or "Billing".
- If a session is mandatory or has an approaching deadline, flag urgency as "high" and specify risk_flag (e.g., "Mandatory Attendance" or "Upcoming Deadline").
- Explanation: 1-2 concise, highly specific sentences summarizing the exact purpose and key details of the email.

Return ONLY valid JSON matching this schema:
{
  "topic": string (one of the primary categories above),
  "subtopic": string (concise specific subtopic, e.g. "Placement Training", "Campus Circular", "Newsletter", "Invoice Query", "System Bug"),
  "urgency": "low" | "medium" | "high" | "critical",
  "sentiment": "positive" | "neutral" | "frustrated" | "angry" | "uncertain",
  "assigned_team": string (as indicated above),
  "confidence": number between 0.85 and 0.99,
  "risk_flag": string or null,
  "explanation": "specific 1-2 sentence explanation",
  "needs_human_review": boolean
}`;

    const userMessage = `Sender Name: ${context.senderName}
Sender Email: ${context.senderEmail}
Subject: ${context.subject}
Message Body:
"""
${context.messageBody}
"""`;

    const { content, latencyMs, tokensUsed, resolvedModel } = await this.callChat(model, [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ]);

    const parsed = parseJsonFromLlm(content);
    const validated = ClassificationSchema.parse(parsed);

    return {
      ...validated,
      meta: {
        provider: 'nvidia',
        model: resolvedModel,
        latencyMs,
        tokensUsed,
        rawResponse: content,
      },
    };
  }

  async generateDraft(context: AIProviderContext, model = DEFAULT_NVIDIA_DRAFT): Promise<AIDraftResult> {
    const articlesPrompt = context.knowledgeArticles && context.knowledgeArticles.length > 0
      ? `APPROVED COMPANY KNOWLEDGE BASE ARTICLES:
${context.knowledgeArticles
  .map(
    (a) => `[Article: "${a.title}" (ID: ${a.id})]
Category: ${a.excerpt}
Content: ${a.content}`
  )
  .join('\n\n')}`
      : 'No specific knowledge articles attached. Rely on standard polite support best practices.';

    const systemPrompt = `You are an elite executive communications assistant and context-aware email drafter.
Compose the EXACT, production-ready email reply to be sent directly to the sender.

CONTEXT-AWARE WRITING RULES:
1. DETERMINE THE PROPER RELATIONSHIP & PERSONA:
   - ACADEMIC & UNIVERSITY (Placement Cell, Professor, University Admin, Library):
     Write as a respectful, dedicated student / candidate:
     - For placement/training sessions: Acknowledge the notification, confirm attendance/participation, thank the placement team, and ask any relevant logistical question if applicable.
     - For library/campus events: Courteously thank them for the invitation.
     - For professor/coursework: Respectfully acknowledge instructions or confirm deadline.
     - Sign-off: "Thank you & Best regards," (NEVER say "Postmark Support Team").

   - RECRUITERS & HIRING MANAGERS:
     Write as a polished, enthusiastic job applicant or professional confirming availability or providing requested information.

   - CUSTOMER SUPPORT / CLIENT INQUIRIES:
     Write as an empathetic, authoritative customer support specialist directly answering their questions and citing knowledge base articles if relevant.
     - Sign-off: "Best regards,\nCustomer Support Team"

   - MARKETING NEWSLETTERS & ADVERTISEMENTS:
     Write a brief acknowledgment or decline note:
     "Hi ${context.senderName || 'Team'},
     
     Thank you for sharing this update regarding ${context.subject}. We have noted the details.
     
     Best regards,"

   - PERSONAL / DIRECT CORRESPONDENCE:
     Write a warm, authentic, natural peer response directly answering their points.

2. WRITING QUALITY:
   - Address the sender respectfully by name: "Dear ${context.senderName}," or "Hi ${context.senderName.split(' ')[0]},".
   - Be concise, professional, and directly address the email's core message.
   - NEVER break character. NEVER mention you are an AI. Write the exact final email ready to send.

${articlesPrompt}

Respond ONLY with a JSON object strictly matching this schema:
{
  "reply_text": "The full, ready-to-send email body with greeting and sign-off",
  "cited_knowledge_titles": ["exact article title if relied upon"],
  "tone_used": "${context.tone || 'professional'}",
  "reasoning": "1-sentence explanation of response strategy"
}`;

    const userMessage = `Sender Name: ${context.senderName}
Sender Email: ${context.senderEmail}
Subject: ${context.subject}
Inbound Email Content:
"""
${context.messageBody}
"""`;

    const { content, latencyMs, tokensUsed, resolvedModel } = await this.callChat(model, [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ]);

    const parsed = parseJsonFromLlm(content);
    const validated = DraftResponseSchema.parse(parsed);

    const matchedIds = (context.knowledgeArticles || [])
      .filter((a) => validated.cited_knowledge_titles.some((t) => t.toLowerCase().includes(a.title.toLowerCase()) || a.title.toLowerCase().includes(t.toLowerCase())))
      .map((a) => a.id);

    return {
      ...validated,
      cited_knowledge_ids: matchedIds.length > 0 ? matchedIds : (context.knowledgeArticles?.slice(0, 2).map((a) => a.id) || []),
      meta: {
        provider: 'nvidia',
        model: resolvedModel,
        latencyMs,
        tokensUsed,
        rawResponse: content,
      },
    };
  }

  async refineDraft(
    currentDraft: string,
    instruction: 'shorter' | 'details' | 'friendly' | 'professional' | 'concise' | 'empathetic',
    context: AIProviderContext,
    model = DEFAULT_NVIDIA_DRAFT
  ): Promise<AIDraftResult> {
    const systemPrompt = `You are Postmark's expert email editor.
Refine the provided email draft according to this specific instruction: "${instruction}".

RULES:
1. The output must be the EXACT email body ready to send to ${context.senderName}.
2. Keep the greeting (e.g., "Dear ${context.senderName},") and professional sign-off intact.
3. NEVER add commentary like "Here is the revised draft:".
4. Adjust the tone, length, or clarity strictly as requested.

Respond with JSON:
{
  "reply_text": "The refined, ready-to-send email text",
  "cited_knowledge_titles": [],
  "tone_used": "${instruction.includes('friendly') ? 'friendly' : instruction.includes('concise') || instruction.includes('shorter') ? 'concise' : instruction.includes('empathetic') ? 'empathetic' : 'professional'}",
  "reasoning": "How the draft was adjusted"
}`;

    const { content, latencyMs, tokensUsed, resolvedModel } = await this.callChat(model, [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Current draft:\n${currentDraft}\n\nOriginal Subject: ${context.subject}\nCustomer message: ${context.messageBody}` },
    ]);

    const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    const validated = DraftResponseSchema.parse(parsed);

    return {
      ...validated,
      cited_knowledge_ids: context.knowledgeArticles?.map((a) => a.id) || [],
      meta: {
        provider: 'nvidia',
        model: resolvedModel,
        latencyMs,
        tokensUsed,
      },
    };
  }

  async checkHealth(): Promise<{ ok: boolean; message: string }> {
    if (!this.apiKey) {
      return { ok: false, message: 'NVIDIA API key not configured' };
    }
    if (!this.apiKey.startsWith('nvapi-')) {
      return {
        ok: false,
        message: "Invalid format: NVIDIA NIM keys must start with 'nvapi-'. Please copy your key from build.nvidia.com (not an OpenAI sk-... key).",
      };
    }
    try {
      const res = await this.callChat(DEFAULT_NVIDIA_CLASSIFIER, [{ role: 'user', content: 'Say hello in 3 words' }], 0.1);
      return { ok: true, message: `Connected via ${res.resolvedModel} (latency: ${res.latencyMs}ms)` };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('401') || msg.includes('JWS/JWE') || msg.includes('Unauthorized')) {
        return {
          ok: false,
          message: "Unauthorized (401): The key was rejected by NVIDIA. Please verify your 'nvapi-...' key is copied accurately from build.nvidia.com.",
        };
      }
      return { ok: false, message: msg };
    }
  }
}
