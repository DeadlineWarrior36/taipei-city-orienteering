import { NextRequest, NextResponse } from 'next/server';
import type { QuestOverviewResponse } from '@/types/api';
import { getQuestById, getQuestPaths, getCompletedLocationIds } from '@/lib/db/quests';
import { calculatePathDistance } from '@/lib/utils/distance';
import { formatDuration } from '@/lib/utils/duration';
import { getMissionById } from '@/lib/db/missions';

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

    // Fetch paths and mission in parallel
    const [paths, mission] = await Promise.all([
      getQuestPaths(quest_id),
      getMissionById(quest.mission_id)
    ]);

    if (!mission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    // Calculate completed locations (no DB query)
    const completedLocationIds = getCompletedLocationIds(paths, mission);

    // Calculate distance
    const distance = calculatePathDistance(paths);

    // Calculate time
    const createdAt = new Date(quest.created_at);
    const updatedAt = new Date(quest.updated_at);
    const durationMs = updatedAt.getTime() - createdAt.getTime();
    const durationSeconds = Math.floor(durationMs / 1000);
    const time_spent = formatDuration(durationSeconds);

    // Calculate points
    let points = 0;
    for (const locationId of completedLocationIds) {
      const location = mission.locations.find(loc => loc.id === locationId);
      if (location) {
        points += location.point;
      }
    }

    const response: QuestOverviewResponse = {
      mission_id: quest.mission_id,
      path: paths,
      points,
      time_spent,
      distance: Math.round(distance),
      completed_location_ids: completedLocationIds,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching quest overview:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
