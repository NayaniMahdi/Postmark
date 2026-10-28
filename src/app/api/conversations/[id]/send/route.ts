import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const expectedVersion = Number(body.expectedDraftVersion);
    const actor = body.actor || 'Aanya (Support Team)';

    if (isNaN(expectedVersion)) {
      return NextResponse.json(
        { error: 'expectedDraftVersion is required for safe sending' },
        { status: 400 }
      );
    }

    const result = await store.sendReply(id, expectedVersion, actor);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
