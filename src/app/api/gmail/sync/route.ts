import { NextRequest, NextResponse } from 'next/server';
import { gmailClient } from '@/lib/gmail/client';
import { getValidAccessToken } from '@/lib/gmail/tokens';
import { store } from '@/lib/store';
import { processConversationWithAI } from '@/lib/ai/pipeline';
import { Conversation } from '@/types';

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body is optional
    }

    const { searchParams } = new URL(req.url);
    const limit = Number(body.limit || searchParams.get('limit') || 25);
    const pageToken = (body.pageToken || searchParams.get('pageToken') || undefined) as string | undefined;

    const accessToken = await getValidAccessToken();
    if (!accessToken) {
      return NextResponse.json(
        {
          error: 'Gmail is not connected or token expired. Please connect Gmail in Settings.',
          needsReconnect: true,
        },
        { status: 400 }
      );
    }

    // 1. Fetch message IDs quickly with pagination
    const { messageIds, nextPageToken } = await gmailClient.listMessages(
      accessToken,
      'in:inbox',
      limit,
      pageToken
    );

    // 2. Identify messages that are not yet stored
    const missingIds = messageIds.filter((id) => !store.getConversationById(`gmail-${id}`));

    // 3. Fetch missing messages in parallel batches
    const fetchedMessages = await Promise.all(
      missingIds.map(async (id) => {
        try {
          return await gmailClient.getMessage(accessToken, id);
        } catch (err) {
          console.warn(`[Gmail Sync] Failed to fetch message details for ${id}:`, err);
          return null;
        }
      })
    );

    // 4. Save new conversations to store
    const newConversations: Conversation[] = [];
    for (const msg of fetchedMessages) {
      if (!msg) continue;
      const conv = store.addConversation({
        id: `gmail-${msg.id}`,
        workspace_id: 'ws-default',
        gmail_thread_id: msg.threadId,
        gmail_message_id: msg.id,
        subject: msg.subject,
        snippet: msg.snippet,
        sender_name: msg.fromName,
        sender_email: msg.fromEmail,
        sender_initials: msg.fromName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2) || 'GM',
        received_at: 'Just now',
        status: 'inbox',
        priority: 'medium',
        unread: true,
        starred: false,
        is_demo: false,
        tags: ['Gmail Sync'],
        messages: [
          {
            id: `msg-${msg.id}`,
            conversation_id: `gmail-${msg.id}`,
            sender_name: msg.fromName,
            sender_email: msg.fromEmail,
            sender_type: 'customer',
            body_text: msg.bodyText,
            body_html: msg.bodyHtml,
            received_at: msg.date,
          },
        ],
      });
      newConversations.push(conv);
    }

    const lastSynced = new Date().toISOString();
    store.updateWorkspace({ last_synced_at: lastSynced });

    // 5. Trigger AI processing asynchronously in the background so sync API responds in <1.5s
    if (newConversations.length > 0) {
      (async () => {
        for (const c of newConversations) {
          try {
            await processConversationWithAI(c);
          } catch (aiErr) {
            console.warn('[Gmail Sync] Background AI processing skipped for:', c.id);
          }
        }
      })();
    }

    return NextResponse.json({
      success: true,
      importedCount: newConversations.length,
      totalListed: messageIds.length,
      nextPageToken: nextPageToken || null,
      lastSyncedAt: lastSynced,
      message:
        newConversations.length > 0
          ? `Synced ${newConversations.length} new email${newConversations.length > 1 ? 's' : ''}`
          : 'Inbox is up to date',
    });
  } catch (error: any) {
    console.error('[Gmail Sync Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
