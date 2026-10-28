import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { processConversationWithAI } from '@/lib/ai/pipeline';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let conversation = store.getConversationById(id);
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // If conversation is from real Gmail and doesn't have AI analysis yet, process it dynamically
    if (!conversation.classification || !conversation.draft) {
      conversation = await processConversationWithAI(conversation);
    }

    const timeline = store.getAuditEvents(id);
    return NextResponse.json({ conversation, timeline });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = store.updateConversation(id, body);
    return NextResponse.json({ conversation: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
