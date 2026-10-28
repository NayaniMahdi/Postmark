import { AIProvider, AIProviderContext, AIClassificationResult, AIDraftResult } from './types';
import { NvidiaProvider } from './nvidia';
import { OpenRouterProvider } from './openrouter';
import { MockProvider } from './mock';

export interface AIEngineConfig {
  primaryProvider: 'nvidia' | 'openrouter' | 'mock';
  fallbackProvider: 'nvidia' | 'openrouter' | 'mock';
  classifierModel?: string;
  draftModel?: string;
  fallbackModel?: string;
  nvidiaApiKey?: string;
  openrouterApiKey?: string;
}

export class AIEngine {
  private primary: AIProvider;
  private fallback: AIProvider;
  private mock: MockProvider;
  private config: AIEngineConfig;

  constructor(customConfig?: Partial<AIEngineConfig>) {
    const nvidiaKey = customConfig?.nvidiaApiKey || process.env.NVIDIA_API_KEY || '';
    const openrouterKey = customConfig?.openrouterApiKey || process.env.OPENROUTER_API_KEY || '';

    // Determine default primary based on key availability
    let defaultPrimary: 'nvidia' | 'openrouter' | 'mock' = 'mock';
    if (nvidiaKey) {
      defaultPrimary = 'nvidia';
    } else if (openrouterKey) {
      defaultPrimary = 'openrouter';
    }

    let defaultFallback: 'nvidia' | 'openrouter' | 'mock' = 'mock';
    if (defaultPrimary === 'nvidia' && openrouterKey) {
      defaultFallback = 'openrouter';
    } else if (defaultPrimary === 'openrouter' && nvidiaKey) {
      defaultFallback = 'nvidia';
    }

    this.config = {
      primaryProvider: customConfig?.primaryProvider || (process.env.AI_PRIMARY_PROVIDER as 'nvidia' | 'openrouter') || defaultPrimary,
      fallbackProvider: customConfig?.fallbackProvider || (process.env.AI_FALLBACK_PROVIDER as 'nvidia' | 'openrouter') || defaultFallback,
      classifierModel: customConfig?.classifierModel || process.env.AI_CLASSIFIER_MODEL,
      draftModel: customConfig?.draftModel || process.env.AI_DRAFT_MODEL,
      fallbackModel: customConfig?.fallbackModel || process.env.AI_FALLBACK_MODEL,
      nvidiaApiKey: nvidiaKey,
      openrouterApiKey: openrouterKey,
    };

    this.mock = new MockProvider();
    this.primary = this.instantiateProvider(this.config.primaryProvider);
    this.fallback = this.instantiateProvider(this.config.fallbackProvider);
  }

  private instantiateProvider(name: 'nvidia' | 'openrouter' | 'mock'): AIProvider {
    switch (name) {
      case 'nvidia':
        return this.config.nvidiaApiKey || process.env.NVIDIA_API_KEY
          ? new NvidiaProvider(this.config.nvidiaApiKey)
          : this.mock;
      case 'openrouter':
        return this.config.openrouterApiKey || process.env.OPENROUTER_API_KEY
          ? new OpenRouterProvider(this.config.openrouterApiKey)
          : this.mock;
      case 'mock':
      default:
        return this.mock;
    }
  }

  async classify(context: AIProviderContext): Promise<AIClassificationResult> {
    try {
      const res = await this.primary.classify(context, this.config.classifierModel);
      return res;
    } catch (primaryError) {
      console.warn(`[AI Engine] Primary provider (${this.primary.name}) failed, attempting fallback:`, primaryError);
      try {
        const fallbackRes = await this.fallback.classify(context, this.config.fallbackModel);
        fallbackRes.meta.fallbackUsed = true;
        return fallbackRes;
      } catch (fallbackError) {
        console.warn(`[AI Engine] Fallback provider (${this.fallback.name}) failed, using simulated mock:`, fallbackError);
        const mockRes = await this.mock.classify(context);
        mockRes.meta.fallbackUsed = true;
        return mockRes;
      }
    }
  }

  async generateDraft(context: AIProviderContext): Promise<AIDraftResult> {
    try {
      const res = await this.primary.generateDraft(context, this.config.draftModel);
      return res;
    } catch (primaryError) {
      console.warn(`[AI Engine] Primary provider (${this.primary.name}) draft generation failed, attempting fallback:`, primaryError);
      try {
        const fallbackRes = await this.fallback.generateDraft(context, this.config.fallbackModel);
        fallbackRes.meta.fallbackUsed = true;
        return fallbackRes;
      } catch (fallbackError) {
        console.warn(`[AI Engine] Fallback provider draft failed, using simulated mock:`, fallbackError);
        const mockRes = await this.mock.generateDraft(context);
        mockRes.meta.fallbackUsed = true;
        return mockRes;
      }
    }
  }

  async refineDraft(
    currentDraft: string,
    instruction: 'shorter' | 'details' | 'friendly' | 'professional' | 'concise' | 'empathetic',
    context: AIProviderContext
  ): Promise<AIDraftResult> {
    try {
      return await this.primary.refineDraft(currentDraft, instruction, context, this.config.draftModel);
    } catch {
      return await this.fallback.refineDraft(currentDraft, instruction, context, this.config.fallbackModel);
    }
  }

  async getStatus(): Promise<{
    primary: { name: string; configured: boolean };
    fallback: { name: string; configured: boolean };
  }> {
    return {
      primary: {
        name: this.config.primaryProvider,
        configured:
          this.config.primaryProvider === 'nvidia'
            ? !!this.config.nvidiaApiKey
            : this.config.primaryProvider === 'openrouter'
            ? !!this.config.openrouterApiKey
            : true,
      },
      fallback: {
        name: this.config.fallbackProvider,
        configured:
          this.config.fallbackProvider === 'nvidia'
            ? !!this.config.nvidiaApiKey
            : this.config.fallbackProvider === 'openrouter'
            ? !!this.config.openrouterApiKey
            : true,
      },
    };
  }
}
