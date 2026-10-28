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
    const systemPrompt = `You are an expert customer support classifier for Postmark Intelligent Workspace.
Analyze the customer's email and return a JSON object strictly matching this schema:
{
  "topic": "Billing & Payments" | "Technical Support" | "Security" | "Account Access" | "Sales" | "Product Inquiry" | "General Inquiry",
  "subtopic": string,
  "urgency": "low" | "medium" | "high" | "critical",
  "sentiment": "positive" | "neutral" | "frustrated" | "angry" | "uncertain",
  "assigned_team": "Billing Team" | "Technical Support" | "Security" | "Customer Success" | "Sales",
  "confidence": number between 0.0 and 1.0,
  "risk_flag": optional string,
  "explanation": "concise 1-2 sentence explanation",
  "needs_human_review": boolean
}
Return ONLY valid JSON.`;

    const userMessage = `Sender: ${context.senderName} (${context.senderEmail})
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
      : 'No specific knowledge articles attached. Rely on standard polite support best practices and request any necessary human review.';

    const systemPrompt = `You are Postmark's intelligent support agent.
Compose a warm, helpful, accurate reply grounded ONLY in the approved knowledge base articles provided below.
DO NOT make false promises, unauthorized refunds, or fabricate policies.
The requested tone is: ${context.tone || 'professional'}.

${articlesPrompt}

Respond ONLY with a JSON object in this format:
{
  "reply_text": "Complete draft text ready for human review, signed off appropriately",
  "cited_knowledge_titles": ["exact title of any article you relied on"],
  "tone_used": "${context.tone || 'professional'}",
  "reasoning": "brief explanation of how this answers the inquiry"
}`;

    const userMessage = `Customer Name: ${context.senderName}
Customer Email: ${context.senderEmail}
Subject: ${context.subject}
Customer Inquiry:
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
    const systemPrompt = `You are Postmark's AI editor. Refine the given draft according to this instruction: "${instruction}".
Keep the facts intact.
Respond with JSON:
{
  "reply_text": "The refined draft text",
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
