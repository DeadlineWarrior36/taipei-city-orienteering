import { NextRequest, NextResponse } from 'next/server';
import type { QuestOverviewResponse } from '@/types/api';
import { getQuestById, getQuestPaths, getCompletedLocationIds } from '@/lib/db/quests';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ user_id: string; quest_id: string }> }
) {
  try {
    const user_id = request.headers.get('x-user-id');
    if (!user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { quest_id } = await params;

    const quest = await getQuestById(quest_id);
    if (!quest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 });
    }

    if (quest.user_id !== user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const paths = await getQuestPaths(quest_id);
    const completedLocationIds = await getCompletedLocationIds(quest_id, paths);

    const response: QuestOverviewResponse = {
      mission_id: quest.mission_id,
      path: paths,
      points: 0,
      time_spent: 'PT0S',
      distance: 0,
      completed_location_ids: completedLocationIds,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching quest overview:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
