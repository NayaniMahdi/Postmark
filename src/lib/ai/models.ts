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
    id: 'meta/llama-3.1-8b-instruct',
    name: 'Meta Llama 3.1 8B Instruct',
    provider: 'nvidia',
    category: 'fast',
    badge: '⚡ Ultra Fast',
    speed: '<350ms latency',
    description: 'Lightweight, ultra-low latency model. Best for instant email classification and triage.',
    recommendedFor: 'classifier',
  },
  {
    id: 'nvidia/llama-3.1-nemotron-70b-instruct',
    name: 'NVIDIA Llama 3.1 Nemotron 70B',
    provider: 'nvidia',
    category: 'flagship',
    badge: '🏆 NVIDIA Flagship',
    speed: '~800ms latency',
    description: 'NVIDIA fine-tuned flagship model. Exceptional customer response drafting and adherence to policies.',
    recommendedFor: 'draft',
  },
  {
    id: 'meta/llama-3.1-70b-instruct',
    name: 'Meta Llama 3.1 70B Instruct',
    provider: 'nvidia',
    category: 'reasoning',
    badge: '🧠 High Reasoning',
    speed: '~900ms latency',
    description: 'Deep contextual understanding, great for complex support and refund disputes.',
    recommendedFor: 'both',
  },
  {
    id: 'deepseek-ai/deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'nvidia',
    category: 'reasoning',
    badge: '🔬 Reasoning Powerhouse',
    speed: '~1.2s latency',
    description: 'Advanced multi-step reasoning for technical support bugs and outage tickets.',
    recommendedFor: 'both',
  },
  {
    id: 'mistralai/mistral-large-2-instruct',
    name: 'Mistral Large 2',
    provider: 'nvidia',
    category: 'flagship',
    badge: '🌍 Multilingual & Enterprise',
    speed: '~850ms latency',
    description: 'Top-tier enterprise support, multilingual customer inquiries, and coding errors.',
    recommendedFor: 'draft',
  },
  {
    id: 'google/gemma-2-9b-it',
    name: 'Google Gemma 2 9B',
    provider: 'nvidia',
    category: 'fast',
    badge: '⚡ Fast & Clean',
    speed: '<400ms latency',
    description: 'Google efficient architecture, fast turnaround for short customer answers.',
    recommendedFor: 'classifier',
  },
  {
    id: 'qwen/qwen2.5-72b-instruct',
    name: 'Qwen 2.5 72B Instruct',
    provider: 'nvidia',
    category: 'flagship',
    badge: '🎯 High Precision',
    speed: '~900ms latency',
    description: 'High math, coding, and multilingual accuracy with structured JSON output.',
    recommendedFor: 'both',
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

export const DEFAULT_NVIDIA_CLASSIFIER = 'meta/llama-3.1-8b-instruct';
export const DEFAULT_NVIDIA_DRAFT = 'nvidia/llama-3.1-nemotron-70b-instruct';

export const DEFAULT_OPENROUTER_CLASSIFIER = 'meta-llama/llama-3.1-8b-instruct';
export const DEFAULT_OPENROUTER_DRAFT = 'meta-llama/llama-3.1-70b-instruct';
