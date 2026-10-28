import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const approvedBy = body.approvedBy || 'Aanya (Support Team)';

    const approvedDraft = store.approveDraft(id, approvedBy);
    return NextResponse.json({ draft: approvedDraft });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
