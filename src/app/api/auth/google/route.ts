import { NextRequest, NextResponse } from 'next/server';
import { gmailClient } from '@/lib/gmail/client';

export async function GET(req: NextRequest) {
  try {
    const origin = req.nextUrl.origin;
    const redirectUri = `${origin}/api/auth/google/callback`;
    const state = Buffer.from(JSON.stringify({ timestamp: Date.now() })).toString('base64url');

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return NextResponse.json(
        {
          error:
            'Google OAuth credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local to connect real Gmail.',
        },
        { status: 400 }
      );
    }

    const authUrl = gmailClient.getAuthUrl(redirectUri, state);
    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
