import { sanitizeHtml, htmlToPlainText } from './sanitizer';

export interface GmailTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface GmailParsedMessage {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  fromName: string;
  fromEmail: string;
  to: string;
  date: string;
  bodyText: string;
  bodyHtml: string;
}

export class GmailClient {
  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID || '';
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  }

  getAuthUrl(redirectUri: string, state: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
    ];

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async exchangeCode(code: string, redirectUri: string): Promise<GmailTokens> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Failed to exchange code for tokens: ${err}`);
    }

    return await response.json();
  }

  async refreshToken(refreshToken: string): Promise<GmailTokens> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
      }).toString(),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Failed to refresh token: ${err}`);
    }

    return await response.json();
  }

  async getUserEmail(accessToken: string): Promise<string> {
    const profile = await this.getUserProfile(accessToken);
    return profile.email;
  }

  async getUserProfile(accessToken: string): Promise<{ email: string; name?: string }> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    const data = await response.json();
    return { email: data.email, name: data.name };
  }

  async listMessages(
    accessToken: string,
    query = 'in:inbox',
    maxResults = 25,
    pageToken?: string
  ): Promise<{ messageIds: string[]; nextPageToken?: string; resultSizeEstimate?: number }> {
    const url = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages');
    url.searchParams.set('q', query);
    url.searchParams.set('maxResults', maxResults.toString());
    if (pageToken) {
      url.searchParams.set('pageToken', pageToken);
    }

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gmail API list messages error: ${err}`);
    }

    const data = await response.json();
    return {
      messageIds: (data.messages || []).map((m: { id: string }) => m.id),
      nextPageToken: data.nextPageToken,
      resultSizeEstimate: data.resultSizeEstimate,
    };
  }

  async getMessage(accessToken: string, messageId: string): Promise<GmailParsedMessage> {
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch Gmail message ${messageId}`);
    }

    const data = await response.json();
    const headers: Record<string, string> = {};
    for (const h of data.payload.headers || []) {
      headers[h.name.toLowerCase()] = h.value;
    }

    const fromHeader = headers['from'] || '';
    let fromName = fromHeader;
    let fromEmail = fromHeader;
    const match = fromHeader.match(/^(.*?)\s*<(.+)>$/);
    if (match) {
      fromName = match[1].replace(/["']/g, '').trim();
      fromEmail = match[2].trim();
    }

    let bodyText = '';
    let bodyHtml = '';

    const extractPart = (part: any) => {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        bodyText += Buffer.from(part.body.data, 'base64url').toString('utf-8');
      } else if (part.mimeType === 'text/html' && part.body?.data) {
        bodyHtml += Buffer.from(part.body.data, 'base64url').toString('utf-8');
      }
      if (part.parts && Array.isArray(part.parts)) {
        part.parts.forEach(extractPart);
      }
    };

    extractPart(data.payload);

    if (!bodyText && bodyHtml) {
      bodyText = htmlToPlainText(bodyHtml);
    }
    if (bodyHtml) {
      bodyHtml = sanitizeHtml(bodyHtml);
    }

    return {
      id: data.id,
      threadId: data.threadId,
      snippet: data.snippet || '',
      subject: headers['subject'] || '(No Subject)',
      from: fromHeader,
      fromName: fromName || fromEmail,
      fromEmail,
      to: headers['to'] || '',
      date: headers['date'] || new Date().toISOString(),
      bodyText: bodyText || data.snippet || '',
      bodyHtml,
    };
  }

  /**
   * Builds an RFC 2822 compliant email and sends it via Gmail API
   */
  async sendEmail(
    accessToken: string,
    params: {
      to: string;
      subject: string;
      bodyText: string;
      threadId?: string;
      inReplyToMessageId?: string;
    }
  ): Promise<{ id: string; threadId: string }> {
    const subjectLine = params.subject.startsWith('Re:') ? params.subject : `Re: ${params.subject}`;

    const headers = [
      `To: ${params.to}`,
      `Subject: ${subjectLine}`,
      'Content-Type: text/plain; charset=UTF-8',
      'MIME-Version: 1.0',
    ];

    if (params.inReplyToMessageId) {
      headers.push(`In-Reply-To: ${params.inReplyToMessageId}`);
      headers.push(`References: ${params.inReplyToMessageId}`);
    }

    const emailRaw = `${headers.join('\r\n')}\r\n\r\n${params.bodyText}`;
    const base64UrlEmail = Buffer.from(emailRaw).toString('base64url');

    const body: Record<string, any> = { raw: base64UrlEmail };
    if (params.threadId) {
      body.threadId = params.threadId;
    }

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gmail API send failed (${response.status}): ${err}`);
    }

    return await response.json();
  }
}

export const gmailClient = new GmailClient();
