import { ClassificationOutput, DraftResponseOutput } from './schemas';
import { DraftTone } from '@/types';

export interface AIProviderContext {
  senderName: string;
  senderEmail: string;
  subject: string;
  messageBody: string;
  conversationHistory?: { sender: string; body: string; timestamp: string }[];
  knowledgeArticles?: { id: string; title: string; excerpt: string; content: string }[];
  tone?: DraftTone;
  extraInstructions?: string;
}

export interface AIInferenceMeta {
  provider: 'nvidia' | 'openrouter' | 'mock';
  model: string;
  latencyMs: number;
  tokensUsed?: number;
  fallbackUsed?: boolean;
  rawResponse?: string;
}

export interface AIClassificationResult extends ClassificationOutput {
  meta: AIInferenceMeta;
}

export interface AIDraftResult extends DraftResponseOutput {
  cited_knowledge_ids: string[];
  meta: AIInferenceMeta;
}

export interface AIProvider {
  name: 'nvidia' | 'openrouter' | 'mock';
  classify(context: AIProviderContext, model?: string): Promise<AIClassificationResult>;
  generateDraft(context: AIProviderContext, model?: string): Promise<AIDraftResult>;
  refineDraft(
    currentDraft: string,
    instruction: 'shorter' | 'details' | 'friendly' | 'professional' | 'concise' | 'empathetic',
    context: AIProviderContext,
    model?: string
  ): Promise<AIDraftResult>;
  checkHealth(): Promise<{ ok: boolean; message: string }>;
}
