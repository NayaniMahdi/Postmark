import { AIProvider, AIProviderContext, AIClassificationResult, AIDraftResult } from './types';
import { ClassificationSchema, DraftResponseSchema } from './schemas';

const DEFAULT_CLASSIFIER_MODEL = 'meta-llama/llama-3.3-70b-instruct';
const DEFAULT_DRAFT_MODEL = 'meta-llama/llama-3.3-70b-instruct';

export class OpenRouterProvider implements AIProvider {
  name = 'openrouter' as const;
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || '';
  }

  private async callChat(model: string, messages: { role: string; content: string }[], temperature = 0.2) {
    if (!this.apiKey) {
      throw new Error('OpenRouter API Key is missing. Please provide OPENROUTER_API_KEY.');
    }

    const startTime = Date.now();
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Postmark Intelligent Workspace',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: 1024,
        response_format: { type: 'json_object' },
      }),
    });

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const tokensUsed = data.usage?.total_tokens;

    return { content, latencyMs, tokensUsed };
  }

  async classify(context: AIProviderContext, model = DEFAULT_CLASSIFIER_MODEL): Promise<AIClassificationResult> {
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

    const { content, latencyMs, tokensUsed } = await this.callChat(model, [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ]);

    const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    const validated = ClassificationSchema.parse(parsed);

    return {
      ...validated,
      meta: {
        provider: 'openrouter',
        model,
        latencyMs,
        tokensUsed,
        rawResponse: content,
      },
    };
  }

  async generateDraft(context: AIProviderContext, model = DEFAULT_DRAFT_MODEL): Promise<AIDraftResult> {
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

    const systemPrompt = `You are Postmark's intelligent support agent.
Compose a warm, helpful, accurate reply grounded ONLY in the approved knowledge base articles provided below.
DO NOT make false promises or invent company policies.
Requested tone: ${context.tone || 'professional'}.

${articlesPrompt}

Respond ONLY with a JSON object:
{
  "reply_text": "Complete draft text ready for human review",
  "cited_knowledge_titles": ["exact title of any article you relied on"],
  "tone_used": "${context.tone || 'professional'}",
  "reasoning": "brief explanation"
}`;

    const userMessage = `Customer Name: ${context.senderName}
Customer Email: ${context.senderEmail}
Subject: ${context.subject}
Customer Inquiry:
"""
${context.messageBody}
"""`;

    const { content, latencyMs, tokensUsed } = await this.callChat(model, [
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
        provider: 'openrouter',
        model,
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
    model = DEFAULT_DRAFT_MODEL
  ): Promise<AIDraftResult> {
    const systemPrompt = `You are Postmark's AI editor. Refine the given draft according to this instruction: "${instruction}".
Respond with JSON:
{
  "reply_text": "The refined draft text",
  "cited_knowledge_titles": [],
  "tone_used": "${instruction.includes('friendly') ? 'friendly' : instruction.includes('concise') || instruction.includes('shorter') ? 'concise' : instruction.includes('empathetic') ? 'empathetic' : 'professional'}",
  "reasoning": "How the draft was adjusted"
}`;

    const { content, latencyMs, tokensUsed } = await this.callChat(model, [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Current draft:\n${currentDraft}\n\nSubject: ${context.subject}\nCustomer message: ${context.messageBody}` },
    ]);

    const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    const validated = DraftResponseSchema.parse(parsed);

    return {
      ...validated,
      cited_knowledge_ids: context.knowledgeArticles?.map((a) => a.id) || [],
      meta: {
        provider: 'openrouter',
        model,
        latencyMs,
        tokensUsed,
      },
    };
  }

  async checkHealth(): Promise<{ ok: boolean; message: string }> {
    if (!this.apiKey) {
      return { ok: false, message: 'OpenRouter API key not configured' };
    }
    try {
      const res = await this.callChat(DEFAULT_CLASSIFIER_MODEL, [{ role: 'user', content: '{"ping": true}' }], 0.1);
      return { ok: true, message: `Connected (latency: ${res.latencyMs}ms)` };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { ok: false, message: msg };
    }
  }
}
