import { NextRequest, NextResponse } from 'next/server';
import type { MissionPathsResponse } from '@/types/api';
import { getQuestsByMissionId } from '@/lib/db/quests';
import { getMissionById } from '@/lib/db/missions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const mission = await getMissionById(id);
    if (!mission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    const paths = await getQuestsByMissionId(id);

    const response: MissionPathsResponse = {
      paths,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching mission paths:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
