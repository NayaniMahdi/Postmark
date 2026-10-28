import { AIProvider, AIProviderContext, AIClassificationResult, AIDraftResult } from './types';
import { ClassificationSchema, DraftResponseSchema } from './schemas';
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
    const systemPrompt = `You are Postmark's intelligent email triage and classification engine.
Analyze the inbound email and categorize it accurately.

TOPIC CATEGORIES:
- "Marketing & Promotions": Commercial offers, sales promotions, webinar invitations, course discounts, university announcements, newsletters.
- "Automated Notification": System alerts, order updates, receipts, password resets, no-reply transactional confirmations.
- "Billing & Payments": Charges, refunds, invoices, subscription renewals, payment failures.
- "Technical Support": Software bugs, system issues, API integration, downtime, service troubles.
- "Account Access": Login issues, 2FA, password recovery, profile credentials, permissions.
- "General Inquiry": Customer questions, partnership proposals, general correspondence.

CRITICAL RULES:
- If the email is an automated newsletter, marketing campaign, or educational/university announcement (e.g., NMIMS, Udemy, Coursera, Retail), classify topic as "Marketing & Promotions" or "Automated Notification", urgency as "low", sentiment as "neutral" or "positive", needs_human_review as false, and risk_flag as null.
- Explanation: 1-2 concise sentences summarizing the nature of the message.

Return ONLY valid JSON:
{
  "topic": "Marketing & Promotions" | "Automated Notification" | "Billing & Payments" | "Technical Support" | "Account Access" | "General Inquiry",
  "subtopic": string,
  "urgency": "low" | "medium" | "high" | "critical",
  "sentiment": "positive" | "neutral" | "frustrated" | "angry" | "uncertain",
  "assigned_team": "Marketing & Growth" | "Customer Success" | "Billing Team" | "Technical Support" | "Security" | "Operations",
  "confidence": number between 0.0 and 1.0,
  "risk_flag": string or null,
  "explanation": "concise 1-2 sentence explanation",
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

    const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
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

    const systemPrompt = `You are an expert executive communication and customer support writer for Postmark Intelligent Workspace.
Your task is to write the EXACT, production-ready email reply to be sent directly to the sender.

STRICT WRITING RULES:
1. WRITE DIRECTLY TO THE SENDER:
   - Address the sender by name (e.g., "Dear ${context.senderName}," or "Hi ${context.senderName.split(' ')[0]},") or team.
   - Speak directly in the professional voice of the support / workspace team.
   - NEVER break character. NEVER say "I am an AI", "As a support agent for Postmark", "The email you provided discusses...", "You shared an email about...", or talk ABOUT the email.
   - The output must be the literal email text that can be dispatched immediately.

2. PROMOTIONAL, ANNOUNCEMENT, OR AUTOMATED EMAILS:
   - If the inbound email is an automated promotional campaign, university announcement, webinar invite, newsletter, or marketing update:
     Write a courteous, concise acknowledgment or decline note:
     "Hi ${context.senderName || 'Team'},
     
     Thank you for sharing this update regarding ${context.subject}. We have received and noted the details.
     
     Best regards,
     Postmark Support Team"
   - Do NOT invent fake disputes or apologize for unrelated services.

3. CUSTOMER INQUIRIES & SUPPORT:
   - Answer the customer's questions directly, accurately, and empathetically.
   - Ground facts and resolutions in the approved company knowledge articles provided below.
   - Tone requested: ${context.tone || 'professional'}.
   - Conclude with a clean professional sign-off (e.g., "Best regards,\nPostmark Support Team").

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

    const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
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
