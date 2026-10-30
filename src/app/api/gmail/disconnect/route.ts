import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { clearTokens } from '@/lib/gmail/tokens';

export async function POST() {
  try {
    clearTokens();
    store.clearGmailData();

    return NextResponse.json({ success: true, message: 'Gmail disconnected. Switched to demo mode.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
