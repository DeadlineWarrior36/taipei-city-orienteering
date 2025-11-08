import { NextRequest, NextResponse } from 'next/server';
import type { SubmitQuestRequest, SubmitQuestResponse } from '@/types/api';
import { getQuestById, updateQuestPaths, getCompletedLocationIds, PathPrefixError, updateQuestPoints } from '@/lib/db/quests';
import { calculatePathDistance } from '@/lib/utils/distance';
import { formatDuration } from '@/lib/utils/duration';
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

    // Fetch mission first
    const mission = await getMissionById(quest.mission_id);
    if (!mission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    // Update paths (don't wait for completion status update inside)
    await updateQuestPaths(quest_id, body.paths, mission);

    // Calculate all response data (no DB calls)
    const completedLocationIds = getCompletedLocationIds(body.paths, mission);
    const distance = calculatePathDistance(body.paths);

    const createdAt = new Date(quest.created_at);
    const now = new Date();
    const durationMs = now.getTime() - createdAt.getTime();
    const durationSeconds = Math.floor(durationMs / 1000);
    const time_spent = formatDuration(durationSeconds);

    let points = 0;
    for (const locationId of completedLocationIds) {
      const location = mission.locations.find(loc => loc.id === locationId);
      if (location) {
        points += location.point;
      }
    }

    // Update points asynchronously if changed (don't wait for it)
    if (points !== quest.points) {
      updateQuestPoints(quest_id, points).catch(err =>
        console.error('Failed to update quest points:', err)
      );
    }

    // Determine if finished based on completion check
    const isFinished = completedLocationIds.length === mission.locations.length;

    const response: SubmitQuestResponse = {
      points,
      time_spent,
      distance: Math.round(distance),
      completed_location_ids: completedLocationIds,
      is_finished: isFinished,
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
