import { NextRequest, NextResponse } from 'next/server';
import type { QuestOverviewResponse } from '@/types/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ user_id: string; quest_id: string }> }
) {
  try {
    const { user_id, quest_id } = await params;

    const response: QuestOverviewResponse = {
      mission_id: 'mission_1',
      path: [
        { lnt: 121.5654, lat: 25.0330 },
        { lnt: 121.5200, lat: 25.0478 },
        { lnt: 121.5100, lat: 25.0400 },
      ],
      points: 45,
      time_spent: 'PT1H30M',
      distance: 5.2,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
