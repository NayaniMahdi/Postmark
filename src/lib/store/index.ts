import fs from 'fs';
import path from 'path';
import {
  Conversation,
  KnowledgeArticle,
  ResponseTemplate,
  Team,
  AuditEvent,
  AISettings,
  AnalyticsSummary,
  Draft,
  Classification,
  Workspace,
} from '@/types';
import {
  SEED_CONVERSATIONS,
  SEED_KNOWLEDGE_ARTICLES,
  SEED_TEMPLATES,
  SEED_TEAMS,
} from './seedData';
import { verifyDraftApproval, invalidateDraftOnEdit, approveDraftVersion } from '../safety/approval';
import { gmailClient } from '../gmail/client';

export interface PostmarkState {
  workspace: Workspace;
  conversations: Conversation[];
  knowledge: KnowledgeArticle[];
  templates: ResponseTemplate[];
  teams: Team[];
  auditEvents: AuditEvent[];
  settings: AISettings;
}

class Store {
  private state: PostmarkState;
  private filePath: string;
  private isServer: boolean;

  constructor() {
    this.isServer = typeof window === 'undefined';
    this.filePath = path.join(process.cwd(), '.data', 'store.json');

    // Default initial state
    this.state = {
      workspace: {
        id: 'ws-default',
        name: 'Scalezix Support Workspace',
        mode: 'demo',
        gmail_connected: false,
        created_at: '2026-10-01T00:00:00Z',
      },
      conversations: JSON.parse(JSON.stringify(SEED_CONVERSATIONS)),
      knowledge: JSON.parse(JSON.stringify(SEED_KNOWLEDGE_ARTICLES)),
      templates: JSON.parse(JSON.stringify(SEED_TEMPLATES)),
      teams: JSON.parse(JSON.stringify(SEED_TEAMS)),
      auditEvents: [
        {
          id: 'aud-1',
          conversation_id: 'conv-1',
          event_type: 'email_received',
          description: 'Inbound customer inquiry received via email',
          actor: 'Rahul Sharma',
          timestamp: 'Today, 10:24 AM',
        },
        {
          id: 'aud-2',
          conversation_id: 'conv-1',
          event_type: 'classified',
          description: 'AI classified as Billing & Payments (High Urgency, 94% confidence)',
          actor: 'AI Classifier (NVIDIA Llama 3.3)',
          timestamp: 'Today, 10:24 AM',
        },
        {
          id: 'aud-3',
          conversation_id: 'conv-1',
          event_type: 'knowledge_retrieved',
          description: 'Retrieved Duplicate Payment Policy and Refund Eligibility Guidelines',
          actor: 'Knowledge Retriever',
          timestamp: 'Today, 10:24 AM',
        },
        {
          id: 'aud-4',
          conversation_id: 'conv-1',
          event_type: 'draft_generated',
          description: 'AI generated draft response version 1',
          actor: 'AI Drafter (NVIDIA Llama 3.3)',
          timestamp: 'Today, 10:25 AM',
        },
      ],
      settings: {
        primaryProvider: (process.env.AI_PRIMARY_PROVIDER as 'nvidia' | 'openrouter') || 'nvidia',
        fallbackProvider: (process.env.AI_FALLBACK_PROVIDER as 'nvidia' | 'openrouter') || 'openrouter',
        classifierModel: process.env.AI_CLASSIFIER_MODEL || 'meta/llama-3.2-11b-vision-instruct',
        draftModel: process.env.AI_DRAFT_MODEL || 'meta/llama-3.2-11b-vision-instruct',
        fallbackModel: process.env.AI_FALLBACK_MODEL || 'meta-llama/llama-3.1-8b-instruct',
        nvidiaApiKey: process.env.NVIDIA_API_KEY || '',
        openrouterApiKey: process.env.OPENROUTER_API_KEY || '',
        confidenceThreshold: 0.85,
        autoDraft: true,
        supportTone: 'professional',
      },
    };

    this.loadFromFile();
  }

  private loadFromFile() {
    if (!this.isServer) return;
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.conversations && parsed.conversations.length > 0) {
          this.state = parsed;
          // Auto-upgrade deprecated or 404 models from previous runs
          const isLegacy = (m?: string) =>
            !m ||
            m.includes('llama-3.3') ||
            m.includes('llama-3.1') ||
            m.includes('gemma') ||
            m.includes('nemotron') ||
            m.includes('mistral');

          if (isLegacy(this.state.settings?.classifierModel)) {
            this.state.settings.classifierModel = 'meta/llama-3.2-11b-vision-instruct';
          }
          if (isLegacy(this.state.settings?.draftModel)) {
            this.state.settings.draftModel = 'meta/llama-3.2-11b-vision-instruct';
          }
          if (this.state.settings?.fallbackModel?.includes('llama-3.3-70b-instruct')) {
            this.state.settings.fallbackModel = 'meta-llama/llama-3.1-8b-instruct';
          }
        }
      }
    } catch {
      // Use defaults if reading fails
    }
  }

  private saveToFile() {
    if (!this.isServer) return;
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch {
      // Non-blocking in serverless/read-only environments
    }
  }

  // Workspace
  getWorkspace(): Workspace {
    return this.state.workspace;
  }

  setWorkspaceMode(mode: 'demo' | 'real'): Workspace {
    this.state.workspace.mode = mode;
    this.saveToFile();
    return this.state.workspace;
  }

  updateWorkspace(updates: Partial<Workspace>): Workspace {
    this.state.workspace = { ...this.state.workspace, ...updates };
    this.saveToFile();
    return this.state.workspace;
  }

  // Conversations
  getConversations(filter?: {
    status?: string;
    priority?: string;
    search?: string;
    teamId?: string;
  }): Conversation[] {
    let list = [...this.state.conversations];

    if (filter?.status && filter.status !== 'inbox') {
      if (filter.status === 'starred') {
        list = list.filter((c) => c.starred);
      } else if (filter.status === 'needs_review') {
        list = list.filter((c) => c.status === 'needs_review' || c.tags.includes('Needs Review'));
      } else if (filter.status === 'assigned') {
        list = list.filter((c) => c.status === 'assigned');
      } else if (filter.status === 'drafts') {
        list = list.filter((c) => c.status === 'drafts' || (c.draft && !c.draft.is_approved));
      } else if (filter.status === 'sent') {
        list = list.filter((c) => c.status === 'sent');
      } else if (filter.status === 'resolved') {
        list = list.filter((c) => c.status === 'resolved');
      }
    }

    if (filter?.priority && filter.priority !== 'all') {
      list = list.filter((c) => c.priority.toLowerCase() === filter.priority?.toLowerCase());
    }

    if (filter?.teamId) {
      list = list.filter((c) => c.team_id === filter.teamId);
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.subject.toLowerCase().includes(q) ||
          c.sender_name.toLowerCase().includes(q) ||
          c.sender_email.toLowerCase().includes(q) ||
          c.snippet.toLowerCase().includes(q)
      );
    }

    return list;
  }

  getConversationById(id: string): Conversation | undefined {
    return this.state.conversations.find((c) => c.id === id);
  }

  updateConversation(id: string, updates: Partial<Conversation>): Conversation {
    const idx = this.state.conversations.findIndex((c) => c.id === id);
    if (idx === -1) {
      throw new Error(`Conversation ${id} not found`);
    }
    this.state.conversations[idx] = { ...this.state.conversations[idx], ...updates };
    this.saveToFile();
    return this.state.conversations[idx];
  }

  addConversation(conv: Conversation): Conversation {
    this.state.conversations.unshift(conv);
    this.saveToFile();
    return conv;
  }

  // Draft Management
  updateDraft(conversationId: string, newContent: string, tone?: Draft['tone']): Draft {
    const conv = this.getConversationById(conversationId);
    if (!conv) throw new Error(`Conversation ${conversationId} not found`);

    if (!conv.draft) {
      const newDraft: Draft = {
        id: `drf-${Date.now()}`,
        conversation_id: conversationId,
        version: 1,
        content: newContent,
        tone: tone || 'professional',
        is_approved: false,
        provider: 'manual',
        model: 'manual-edit',
        latency_ms: 0,
        cited_knowledge_ids: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      conv.draft = newDraft;
      this.saveToFile();
      return newDraft;
    }

    // Invalidate approval upon edit
    const updatedDraft = invalidateDraftOnEdit(conv.draft, newContent);
    if (tone) updatedDraft.tone = tone;
    conv.draft = updatedDraft;

    this.recordAuditEvent({
      conversation_id: conversationId,
      event_type: 'draft_edited',
      description: `Draft updated to version ${updatedDraft.version}. Prior approval reset.`,
      actor: 'Support Specialist',
    });

    this.saveToFile();
    return updatedDraft;
  }

  approveDraft(conversationId: string, approvedBy = 'Support Specialist'): Draft {
    const conv = this.getConversationById(conversationId);
    if (!conv || !conv.draft) throw new Error('No draft found to approve');

    const approvedDraft = approveDraftVersion(conv.draft, approvedBy);
    conv.draft = approvedDraft;

    this.recordAuditEvent({
      conversation_id: conversationId,
      event_type: 'draft_approved',
      description: `Draft v${approvedDraft.version} explicitly approved for sending`,
      actor: approvedBy,
    });

    this.saveToFile();
    return approvedDraft;
  }

  async sendReply(
    conversationId: string,
    expectedDraftVersion: number,
    actor = 'Support Specialist'
  ): Promise<{ success: boolean; mode: 'demo' | 'real'; messageId?: string }> {
    const conv = this.getConversationById(conversationId);
    if (!conv || !conv.draft) throw new Error('Conversation or draft not found');

    // Server-enforced safety check
    const verification = verifyDraftApproval(conv.draft, expectedDraftVersion);
    if (!verification.valid) {
      throw new Error(`Security Check Failed: ${verification.reason}`);
    }

    const mode = this.state.workspace.mode;

    if (mode === 'demo') {
      // Demo simulated send
      conv.status = 'sent';
      conv.unread = false;
      this.recordAuditEvent({
        conversation_id: conversationId,
        event_type: 'simulated_send',
        description: `Simulated Send (Demo Mode): Email queued to ${conv.sender_email}`,
        actor,
        metadata: { simulated: true, recipient: conv.sender_email },
      });
      this.saveToFile();
      return { success: true, mode: 'demo', messageId: `demo-msg-${Date.now()}` };
    } else {
      // Real Gmail Send
      const accessToken = process.env.GOOGLE_ACCESS_TOKEN;
      if (!accessToken) {
        throw new Error('Real mode active but Google OAuth access token is not configured.');
      }

      const res = await gmailClient.sendEmail(accessToken, {
        to: conv.sender_email,
        subject: conv.subject,
        bodyText: conv.draft.content,
        threadId: conv.gmail_thread_id,
        inReplyToMessageId: conv.gmail_message_id,
      });

      conv.status = 'sent';
      conv.unread = false;

      this.recordAuditEvent({
        conversation_id: conversationId,
        event_type: 'email_sent',
        description: `Email sent via Gmail API to ${conv.sender_email} (Msg ID: ${res.id})`,
        actor,
        metadata: { messageId: res.id, threadId: res.threadId },
      });

      this.saveToFile();
      return { success: true, mode: 'real', messageId: res.id };
    }
  }

  // Classification & Correction
  setClassification(conversationId: string, classification: Classification): void {
    const conv = this.getConversationById(conversationId);
    if (conv) {
      conv.classification = classification;
      conv.priority = classification.urgency;
      if (classification.needs_human_review) {
        if (!conv.tags.includes('Needs Review')) conv.tags.push('Needs Review');
      }
      this.saveToFile();
    }
  }

  correctClassification(
    conversationId: string,
    correction: { topic: string; urgency: Classification['urgency']; assigned_team: string }
  ): void {
    const conv = this.getConversationById(conversationId);
    if (!conv) throw new Error('Conversation not found');

    if (conv.classification) {
      conv.classification.topic = correction.topic;
      conv.classification.urgency = correction.urgency;
      conv.classification.assigned_team = correction.assigned_team;
    }
    conv.priority = correction.urgency;

    this.recordAuditEvent({
      conversation_id: conversationId,
      event_type: 'classification_corrected',
      description: `Classification manually corrected to ${correction.topic} (${correction.urgency})`,
      actor: 'Human Reviewer',
      metadata: correction,
    });

    this.saveToFile();
  }

  // Audit Events
  recordAuditEvent(event: Omit<AuditEvent, 'id' | 'timestamp'> & { timestamp?: string }): AuditEvent {
    const created: AuditEvent = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: event.timestamp || 'Just now',
      ...event,
    };
    this.state.auditEvents.push(created);
    this.saveToFile();
    return created;
  }

  getAuditEvents(conversationId: string): AuditEvent[] {
    return this.state.auditEvents.filter((a) => a.conversation_id === conversationId);
  }

  // Knowledge Base
  getKnowledgeArticles(): KnowledgeArticle[] {
    return this.state.knowledge;
  }

  getKnowledgeArticleById(id: string): KnowledgeArticle | undefined {
    return this.state.knowledge.find((k) => k.id === id);
  }

  addKnowledgeArticle(article: Omit<KnowledgeArticle, 'id' | 'updated_at'>): KnowledgeArticle {
    const newArt: KnowledgeArticle = {
      id: `kb-${Date.now()}`,
      updated_at: new Date().toISOString(),
      ...article,
    };
    this.state.knowledge.unshift(newArt);
    this.saveToFile();
    return newArt;
  }

  updateKnowledgeArticle(id: string, updates: Partial<KnowledgeArticle>): KnowledgeArticle {
    const idx = this.state.knowledge.findIndex((k) => k.id === id);
    if (idx === -1) throw new Error('Article not found');
    this.state.knowledge[idx] = {
      ...this.state.knowledge[idx],
      ...updates,
      version: this.state.knowledge[idx].version + 1,
      updated_at: new Date().toISOString(),
    };
    this.saveToFile();
    return this.state.knowledge[idx];
  }

  // Templates
  getTemplates(): ResponseTemplate[] {
    return this.state.templates;
  }

  addTemplate(tpl: Omit<ResponseTemplate, 'id'>): ResponseTemplate {
    const created = { id: `tpl-${Date.now()}`, ...tpl };
    this.state.templates.unshift(created);
    this.saveToFile();
    return created;
  }

  // Teams
  getTeams(): Team[] {
    return this.state.teams;
  }

  // Settings
  getSettings(): AISettings {
    return this.state.settings;
  }

  updateSettings(updates: Partial<AISettings>): AISettings {
    this.state.settings = { ...this.state.settings, ...updates };
    this.saveToFile();
    return this.state.settings;
  }

  // Analytics
  getAnalyticsSummary(): AnalyticsSummary {
    const convs = this.state.conversations;
    const total = convs.length;
    const unread = convs.filter((c) => c.unread).length;
    const needsReview = convs.filter((c) => c.status === 'needs_review' || c.tags.includes('Needs Review')).length;
    const resolved = convs.filter((c) => c.status === 'resolved' || c.status === 'sent').length;

    // Categories
    const categoryMap: Record<string, number> = {};
    convs.forEach((c) => {
      const topic = c.classification?.topic || 'General';
      categoryMap[topic] = (categoryMap[topic] || 0) + 1;
    });
    const category_breakdown = Object.entries(categoryMap).map(([name, count]) => ({ name, count }));

    // Urgency
    const urgencyMap: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    convs.forEach((c) => {
      urgencyMap[c.priority] = (urgencyMap[c.priority] || 0) + 1;
    });
    const urgency_breakdown = [
      { name: 'Low', count: urgencyMap.low },
      { name: 'Medium', count: urgencyMap.medium },
      { name: 'High', count: urgencyMap.high },
      { name: 'Critical', count: urgencyMap.critical },
    ];

    return {
      total_conversations: total,
      unread_count: unread,
      needs_review_count: needsReview,
      resolved_count: resolved,
      avg_confidence: 0.94,
      avg_latency_ms: 240,
      category_breakdown,
      urgency_breakdown,
      daily_volume: [
        { date: 'Mon', incoming: 14, resolved: 12 },
        { date: 'Tue', incoming: 19, resolved: 17 },
        { date: 'Wed', incoming: 22, resolved: 20 },
        { date: 'Thu', incoming: 18, resolved: 16 },
        { date: 'Fri', incoming: 25, resolved: 22 },
        { date: 'Sat', incoming: 8, resolved: 8 },
        { date: 'Sun', incoming: 6, resolved: 6 },
      ],
      provider_usage: [
        { provider: 'NVIDIA (Llama 3.3)', count: 42, avg_latency: 185 },
        { provider: 'OpenRouter (Claude 3.5 / Llama)', count: 18, avg_latency: 290 },
      ],
    };
  }
}

export const store = new Store();
