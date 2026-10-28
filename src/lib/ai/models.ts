export interface ModelOption {
  id: string;
  name: string;
  provider: 'nvidia' | 'openrouter';
  category: 'fast' | 'reasoning' | 'flagship' | 'compact';
  badge: string;
  speed: string;
  description: string;
  recommendedFor?: 'classifier' | 'draft' | 'both';
}

export const NVIDIA_MODELS: ModelOption[] = [
  {
    id: 'meta/llama-3.2-11b-vision-instruct',
    name: 'Meta Llama 3.2 11B Instruct',
    provider: 'nvidia',
    category: 'fast',
    badge: '⚡ Ultra Fast (11B)',
    speed: '~1-3s latency',
    description: 'Current active Meta Llama model on NVIDIA NIM. Best for rapid email classification and grounded drafting.',
    recommendedFor: 'both',
  },
  {
    id: 'meta/llama-3.2-90b-vision-instruct',
    name: 'Meta Llama 3.2 90B Instruct',
    provider: 'nvidia',
    category: 'flagship',
    badge: '🧠 High Reasoning (90B)',
    speed: '~4-6s latency',
    description: 'NVIDIA flagship 90B model. Exceptional multi-step customer inquiry reasoning and strict policy adherence.',
    recommendedFor: 'draft',
  },
];

export const OPENROUTER_MODELS: ModelOption[] = [
  {
    id: 'meta-llama/llama-3.1-8b-instruct',
    name: 'Llama 3.1 8B Instruct',
    provider: 'openrouter',
    category: 'fast',
    badge: '⚡ Ultra Fast',
    speed: '<350ms latency',
    description: 'Fast, budget-friendly classification and routing.',
    recommendedFor: 'classifier',
  },
  {
    id: 'meta-llama/llama-3.1-70b-instruct',
    name: 'Llama 3.1 70B Instruct',
    provider: 'openrouter',
    category: 'reasoning',
    badge: '🧠 Balanced 70B',
    speed: '~900ms latency',
    description: 'High quality reply drafts with knowledge citation.',
    recommendedFor: 'draft',
  },
  {
    id: 'google/gemini-2.0-flash-001',
    name: 'Google Gemini 2.0 Flash',
    provider: 'openrouter',
    category: 'fast',
    badge: '⚡ Next-Gen Flash',
    speed: '<300ms latency',
    description: 'Extremely fast Google multimodal / text model.',
    recommendedFor: 'both',
  },
  {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek Chat (V3)',
    provider: 'openrouter',
    category: 'flagship',
    badge: '💡 DeepSeek V3',
    speed: '~700ms latency',
    description: 'High intelligence and natural tone generation.',
    recommendedFor: 'both',
  },
];

export const DEFAULT_NVIDIA_CLASSIFIER = 'meta/llama-3.2-11b-vision-instruct';
export const DEFAULT_NVIDIA_DRAFT = 'meta/llama-3.2-11b-vision-instruct';

export const DEFAULT_OPENROUTER_CLASSIFIER = 'meta-llama/llama-3.1-8b-instruct';
export const DEFAULT_OPENROUTER_DRAFT = 'meta-llama/llama-3.1-70b-instruct';
