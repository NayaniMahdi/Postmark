import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { NvidiaProvider } from '@/lib/ai/nvidia';
import { OpenRouterProvider } from '@/lib/ai/openrouter';

export async function GET() {
  try {
    const settings = store.getSettings();
    const workspace = store.getWorkspace();

    // Mask API keys for security in client response
    const maskedNvidia = settings.nvidiaApiKey
      ? `${settings.nvidiaApiKey.slice(0, 4)}••••••••${settings.nvidiaApiKey.slice(-4)}`
      : '';
    const maskedOpenRouter = settings.openrouterApiKey
      ? `${settings.openrouterApiKey.slice(0, 4)}••••••••${settings.openrouterApiKey.slice(-4)}`
      : '';

    return NextResponse.json({
      settings: {
        ...settings,
        nvidiaApiKey: maskedNvidia,
        openrouterApiKey: maskedOpenRouter,
        hasNvidiaKey: !!settings.nvidiaApiKey,
        hasOpenRouterKey: !!settings.openrouterApiKey,
      },
      workspace,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const current = store.getSettings();

    const cleanKey = (k?: string) =>
      (k || '')
        .trim()
        .replace(/^bearer\s+/i, '')
        .replace(/^["']|["']$/g, '')
        .trim();

    // Preserve existing key if masked or empty
    const rawNvidia = body.nvidiaApiKey && !body.nvidiaApiKey.includes('••••')
      ? cleanKey(body.nvidiaApiKey)
      : current.nvidiaApiKey;
    const rawOpenRouter = body.openrouterApiKey && !body.openrouterApiKey.includes('••••')
      ? cleanKey(body.openrouterApiKey)
      : current.openrouterApiKey;

    const updated = store.updateSettings({
      ...body,
      nvidiaApiKey: rawNvidia,
      openrouterApiKey: rawOpenRouter,
    });

    if (body.workspaceMode) {
      store.setWorkspaceMode(body.workspaceMode);
    }

    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// Health check endpoint for testing AI credentials
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const provider = body.provider; // 'nvidia' | 'openrouter'
    const cleanKey = (k?: string) =>
      (k || '')
        .trim()
        .replace(/^bearer\s+/i, '')
        .replace(/^["']|["']$/g, '')
        .trim();

    const apiKey = cleanKey(body.apiKey);

    if (provider === 'nvidia') {
      const p = new NvidiaProvider(apiKey);
      const health = await p.checkHealth();
      return NextResponse.json(health);
    } else if (provider === 'openrouter') {
      const p = new OpenRouterProvider(apiKey);
      const health = await p.checkHealth();
      return NextResponse.json(health);
    }

    return NextResponse.json({ ok: false, message: 'Invalid provider' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
}
