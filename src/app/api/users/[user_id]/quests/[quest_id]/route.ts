import { NextRequest, NextResponse } from 'next/server';
import type { SubmitQuestRequest, SubmitQuestResponse } from '@/types/api';
import { getQuestById, updateQuestPaths } from '@/lib/db/quests';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ user_id: string; quest_id: string }> }
) {
  try {
    const { user_id, quest_id } = await params;
    const body: SubmitQuestRequest = await request.json();

    if (!body.paths || body.paths.length === 0) {
      return NextResponse.json({ error: 'paths is required' }, { status: 400 });
    }

    const quest = await getQuestById(quest_id);
    if (!quest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 });
    }

    if (quest.user_id !== user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await updateQuestPaths(quest_id, body.paths);

    const response: SubmitQuestResponse = {
      points: 0,
      time_spent: 'PT0S',
      distance: 0,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error submitting quest paths:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
