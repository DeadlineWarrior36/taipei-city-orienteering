import { NextRequest, NextResponse } from 'next/server';
import type { CreateQuestRequest, CreateQuestResponse } from '@/types/api';
import { createQuest } from '@/lib/db/quests';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
) {
  try {
    const { user_id } = await params;
    const body: CreateQuestRequest = await request.json();

    if (!body.mission_id) {
      return NextResponse.json({ error: 'mission_id is required' }, { status: 400 });
    }

    const questId = await createQuest(user_id, body.mission_id);

    const response: CreateQuestResponse = {
      id: questId,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error creating quest:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
