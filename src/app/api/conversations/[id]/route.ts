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

    const { searchParams } = new URL(_req.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    // If conversation doesn't have AI analysis or has stale mock classifications / drafts, attempt dynamic processing
    const needsAI =
      forceRefresh ||
      !conversation.classification ||
      !conversation.draft ||
      conversation.classification.provider === 'mock' ||
      conversation.classification.explanation.includes('unable to use the product') ||
      conversation.classification.explanation.includes('mentions being charged') ||
      conversation.draft.content.includes('Postmark Support Team') ||
      conversation.draft.content.includes('duplicate subscription charge');

    if (needsAI) {
      try {
        const aiPromise = processConversationWithAI(conversation, true);
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 14000));
        const result = await Promise.race([aiPromise, timeoutPromise]);
        if (result) {
          conversation = result;
        }
      } catch (aiErr) {
        console.warn('[Conversation View] AI processing warning:', aiErr);
      }
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
