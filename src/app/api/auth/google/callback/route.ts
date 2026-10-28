import { NextRequest, NextResponse } from 'next/server';
import { gmailClient } from '@/lib/gmail/client';
import { saveTokens } from '@/lib/gmail/tokens';
import { store } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
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
    const userProfile = await gmailClient.getUserProfile(tokens.access_token);
    const userEmail = userProfile.email;

    // Save Gmail connection state
    store.updateWorkspace({
      gmail_connected: true,
      gmail_email: userEmail,
      gmail_name: userProfile.name,
      mode: 'real',
      last_synced_at: new Date().toISOString(),
    });

    // Save persistent tokens for continuous syncing & automatic refresh
    saveTokens(tokens, userEmail);

    // Redirect immediately back to the application (<400ms)
    // The client will initiate initial inbox sync in the background
    return NextResponse.redirect(new URL('/?gmail_connected=true', req.url));
  } catch (err: any) {
    if (err?.digest?.includes('PRERENDER')) {
      throw err;
    }
    console.error('[Google OAuth Callback Error]', err);
    return NextResponse.redirect(
      new URL('/?oauth_error=' + encodeURIComponent(err.message || 'unknown_error'), req.url)
    );
  }
}
