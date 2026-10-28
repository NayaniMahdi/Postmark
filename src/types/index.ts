export type WorkspaceMode = 'demo' | 'real';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type Urgency = 'low' | 'medium' | 'high' | 'critical';

export type Sentiment = 'positive' | 'neutral' | 'frustrated' | 'angry' | 'uncertain';

export type ConversationStatus =
  | 'inbox'
  | 'needs_review'
  | 'assigned'
  | 'starred'
  | 'drafts'
  | 'sent'
  | 'resolved';

export type DraftTone = 'professional' | 'friendly' | 'concise' | 'empathetic';

export interface Workspace {
  id: string;
  name: string;
  mode: WorkspaceMode;
  gmail_connected: boolean;
  gmail_email?: string;
  last_synced_at?: string;
  created_at: string;
}

export interface Attachment {
  id: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_name: string;
  sender_email: string;
  sender_avatar?: string;
  sender_type: 'customer' | 'agent' | 'ai';
  body_text: string;
  body_html?: string;
  received_at: string;
  attachments?: Attachment[];
}

export interface Classification {
  id: string;
  conversation_id: string;
  topic: string;
  subtopic?: string;
  urgency: Urgency;
  sentiment: Sentiment;
  assigned_team: string;
  confidence: number; // 0.0 - 1.0 (e.g. 0.94 for 94%)
  risk_flag?: string;
  explanation: string;
  needs_human_review: boolean;
  provider: string; // 'nvidia' | 'openrouter' | 'mock'
  model: string;
  latency_ms: number;
  created_at: string;
}

export interface Draft {
  id: string;
  conversation_id: string;
  version: number;
  content: string;
  tone: DraftTone;
  is_approved: boolean;
  approved_at?: string;
  approved_by?: string;
  provider: string;
  model: string;
  latency_ms: number;
  cited_knowledge_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: 'Billing' | 'Technical' | 'Security' | 'General' | 'Sales';
  content: string;
  excerpt: string;
  status: 'approved' | 'draft' | 'archived';
  version: number;
  updated_at: string;
}

export interface ResponseTemplate {
  id: string;
  title: string;
  category: string;
  content: string;
  shortcut: string;
}

export interface Conversation {
  id: string;
  workspace_id: string;
  gmail_thread_id?: string;
  gmail_message_id?: string;
  subject: string;
  snippet: string;
  sender_name: string;
  sender_email: string;
  sender_initials: string;
  avatar_color?: string;
  received_at: string;
  status: ConversationStatus;
  team_id?: string;
  priority: Priority;
  unread: boolean;
  starred: boolean;
  is_demo: boolean;
  tags: string[];
  messages: Message[];
  classification?: Classification;
  draft?: Draft;
}

export interface AuditEvent {
  id: string;
  conversation_id: string;
  event_type:
    | 'email_received'
    | 'classified'
    | 'knowledge_retrieved'
    | 'draft_generated'
    | 'draft_edited'
    | 'draft_approved'
    | 'email_sent'
    | 'simulated_send'
    | 'classification_corrected';
  description: string;
  actor: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  member_count: number;
  description: string;
}

export interface AISettings {
  primaryProvider: 'nvidia' | 'openrouter' | 'mock';
  fallbackProvider: 'nvidia' | 'openrouter' | 'mock';
  classifierModel: string;
  draftModel: string;
  fallbackModel: string;
  nvidiaApiKey?: string;
  openrouterApiKey?: string;
  confidenceThreshold: number;
  autoDraft: boolean;
  supportTone: DraftTone;
}

export interface AnalyticsSummary {
  total_conversations: number;
  unread_count: number;
  needs_review_count: number;
  resolved_count: number;
  avg_confidence: number;
  avg_latency_ms: number;
  category_breakdown: { name: string; count: number }[];
  urgency_breakdown: { name: string; count: number }[];
  daily_volume: { date: string; incoming: number; resolved: number }[];
  provider_usage: { provider: string; count: number; avg_latency: number }[];
}
