import { NextResponse } from 'next/server';
import { gmailClient } from '@/lib/gmail/client';
import { store } from '@/lib/store';

export async function POST() {
  try {
    const accessToken = process.env.GOOGLE_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Gmail is not connected or access token is expired.' },
        { status: 400 }
      );
    }

    const messageIds = await gmailClient.listMessages(accessToken, 'in:inbox', 10);
    let importedCount = 0;

    for (const id of messageIds) {
      const existing = store.getConversationById(`gmail-${id}`);
      if (!existing) {
        const msg = await gmailClient.getMessage(accessToken, id);
        store.addConversation({
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
        importedCount++;
      }
    }

    store.updateWorkspace({ last_synced_at: new Date().toISOString() });

    return NextResponse.json({ success: true, importedCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
