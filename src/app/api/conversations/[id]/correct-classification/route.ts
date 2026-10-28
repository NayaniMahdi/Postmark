import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { topic, urgency, assigned_team } = body;

    if (!topic || !urgency || !assigned_team) {
      return NextResponse.json(
        { error: 'topic, urgency, and assigned_team are required' },
        { status: 400 }
      );
    }

    store.correctClassification(id, { topic, urgency, assigned_team });
    const conv = store.getConversationById(id);
    return NextResponse.json({ success: true, classification: conv?.classification });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
