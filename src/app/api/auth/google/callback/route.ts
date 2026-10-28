import { NextRequest, NextResponse } from 'next/server';
import { gmailClient } from '@/lib/gmail/client';
import { store } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(new URL('/?oauth_error=' + encodeURIComponent(error), req.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/?oauth_error=no_code_provided', req.url));
    }

    const origin = req.nextUrl.origin;
    const redirectUri = `${origin}/api/auth/google/callback`;

    const tokens = await gmailClient.exchangeCode(code, redirectUri);
    const userEmail = await gmailClient.getUserEmail(tokens.access_token);

    // Save Gmail connection state
    store.updateWorkspace({
      gmail_connected: true,
      gmail_email: userEmail,
      mode: 'real',
      last_synced_at: new Date().toISOString(),
    });

    // Store access token in environment variable or store for server operations
    process.env.GOOGLE_ACCESS_TOKEN = tokens.access_token;
    if (tokens.refresh_token) {
      process.env.GOOGLE_REFRESH_TOKEN = tokens.refresh_token;
    }

    // Trigger initial inbox sync
    try {
      const messageIds = await gmailClient.listMessages(tokens.access_token, 'in:inbox', 5);
      for (const id of messageIds) {
        const msg = await gmailClient.getMessage(tokens.access_token, id);
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
      }
    } catch (syncErr) {
      console.warn('Initial Gmail sync encountered an issue:', syncErr);
    }

    return NextResponse.redirect(new URL('/?gmail_connected=true', req.url));
  } catch (err: any) {
    return NextResponse.redirect(
      new URL('/?oauth_error=' + encodeURIComponent(err.message || 'unknown_error'), req.url)
    );
  }
}
