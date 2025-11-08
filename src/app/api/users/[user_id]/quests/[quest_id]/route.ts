import { NextRequest, NextResponse } from 'next/server';
import type { SubmitQuestRequest, SubmitQuestResponse } from '@/types/api';
import { getQuestById, updateQuestPaths, getCompletedLocationIds, PathPrefixError } from '@/lib/db/quests';
import { calculatePathDistance } from '@/lib/utils/distance';
import { getMissionById } from '@/lib/db/missions';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ user_id: string; quest_id: string }> }
) {
  try {
    const user_id = request.headers.get('x-user-id');
    if (!user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { quest_id } = await params;
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

    const completedLocationIds = await getCompletedLocationIds(quest_id, body.paths);

    const updatedQuest = await getQuestById(quest_id);

    // 計算距離（公尺）
    const distance = calculatePathDistance(body.paths);

    // 計算時間（ISO 8601 duration format）
    const createdAt = new Date(updatedQuest?.created_at || quest.created_at);
    const updatedAt = new Date(updatedQuest?.updated_at || quest.updated_at);
    const durationMs = updatedAt.getTime() - createdAt.getTime();
    const durationSeconds = Math.floor(durationMs / 1000);
    const time_spent = `PT${durationSeconds}S`;

    // 計算分數
    const mission = await getMissionById(quest.mission_id);
    let points = 0;
    if (mission) {
      for (const locationId of completedLocationIds) {
        const location = mission.locations.find(loc => loc.id === locationId);
        if (location) {
          points += location.point;
        }
      }
    }

    const response: SubmitQuestResponse = {
      points,
      time_spent,
      distance: Math.round(distance),
      completed_location_ids: completedLocationIds,
      is_finished: updatedQuest?.is_finished ?? false,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    if (error instanceof PathPrefixError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Error submitting quest paths:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
