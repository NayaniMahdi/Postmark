import fs from 'fs';
import path from 'path';
import { gmailClient, GmailTokens } from './client';

export interface StoredTokens {
  access_token: string;
  refresh_token?: string;
  expires_at: number; // Unix timestamp in ms
  email?: string;
}

const isVercel = !!process.env.VERCEL;
const TOKENS_PATH = isVercel
  ? path.join('/tmp', '.data', 'tokens.json')
  : path.join(process.cwd(), '.data', 'tokens.json');

export function saveTokens(tokens: GmailTokens, email?: string): StoredTokens {
  try {
    const dir = path.dirname(TOKENS_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch {
    // ignore
  }

  // If new tokens don't include refresh_token, preserve previous refresh_token
  let existingRefreshToken: string | undefined;
  if (fs.existsSync(TOKENS_PATH)) {
    try {
      const prev = JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf-8'));
      existingRefreshToken = prev.refresh_token;
    } catch {
      // ignore
    }
  }

  const stored: StoredTokens = {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token || existingRefreshToken || process.env.GOOGLE_REFRESH_TOKEN,
    expires_at: Date.now() + (tokens.expires_in || 3600) * 1000,
    email: email || process.env.GMAIL_USER_EMAIL,
  };

  try {
    fs.writeFileSync(TOKENS_PATH, JSON.stringify(stored, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Gmail Tokens] Could not write tokens to disk:', err);
  }

  // Also sync with process.env for convenience
  process.env.GOOGLE_ACCESS_TOKEN = stored.access_token;
  if (stored.refresh_token) {
    process.env.GOOGLE_REFRESH_TOKEN = stored.refresh_token;
  }
  if (stored.email) {
    process.env.GMAIL_USER_EMAIL = stored.email;
  }

  return stored;
}

export function clearTokens(): void {
  try {
    if (fs.existsSync(TOKENS_PATH)) {
      fs.unlinkSync(TOKENS_PATH);
    }
  } catch {
    // ignore
  }
  delete process.env.GOOGLE_ACCESS_TOKEN;
  delete process.env.GOOGLE_REFRESH_TOKEN;
  delete process.env.GMAIL_USER_EMAIL;
}

export async function getValidAccessToken(): Promise<string | null> {
  let stored: StoredTokens | null = null;

  if (fs.existsSync(TOKENS_PATH)) {
    try {
      stored = JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf-8'));
    } catch {
      stored = null;
    }
  }

  // Fallback to process.env if file is empty
  if (!stored && process.env.GOOGLE_ACCESS_TOKEN) {
    stored = {
      access_token: process.env.GOOGLE_ACCESS_TOKEN,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      expires_at: Date.now() + 3600 * 1000,
      email: process.env.GMAIL_USER_EMAIL,
    };
  }

  if (!stored) {
    return null;
  }

  // If token is still valid (more than 90 seconds remaining), return it
  if (stored.access_token && stored.expires_at > Date.now() + 90 * 1000) {
    process.env.GOOGLE_ACCESS_TOKEN = stored.access_token;
    return stored.access_token;
  }

  // Token is expired or expiring soon; refresh if we have a refresh_token
  if (stored.refresh_token) {
    try {
      console.log('[Gmail Tokens] Access token expired, refreshing with refresh_token...');
      const refreshed = await gmailClient.refreshToken(stored.refresh_token);
      const updated = saveTokens(
        {
          ...refreshed,
          refresh_token: refreshed.refresh_token || stored.refresh_token,
        },
        stored.email
      );
      return updated.access_token;
    } catch (err) {
      console.error('[Gmail Tokens] Failed to refresh access token:', err);
      return null;
    }
  }

  return stored.access_token || null;
}
