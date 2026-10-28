import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function POST() {
  try {
    delete process.env.GOOGLE_ACCESS_TOKEN;
    delete process.env.GOOGLE_REFRESH_TOKEN;

    store.updateWorkspace({
      gmail_connected: false,
      gmail_email: undefined,
      mode: 'demo',
    });

    return NextResponse.json({ success: true, message: 'Gmail disconnected. Switched to demo mode.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
