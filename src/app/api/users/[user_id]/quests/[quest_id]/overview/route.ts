import { NextRequest, NextResponse } from 'next/server';
import type { QuestOverviewResponse } from '@/types/api';
import { withCors, handleCorsOptions } from '@/lib/cors';

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions(request);
}

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

    return withCors(NextResponse.json(response, { status: 200 }), request);
  } catch (error) {
    return withCors(
      NextResponse.json({ error: 'Invalid request' }, { status: 400 }),
      request
    );
  }
}
