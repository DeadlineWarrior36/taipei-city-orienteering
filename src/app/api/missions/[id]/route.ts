import { NextRequest, NextResponse } from 'next/server';
import type { MissionDetailResponse } from '@/types/api';
import { withCors, handleCorsOptions } from '@/lib/cors';

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions(request);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const response: MissionDetailResponse = {
      mission: {
        id,
        name: 'Taipei City Tour',
        locations: [
          { id: 'loc_1', lnt: 121.5654, lat: 25.0330, point: 10 },
          { id: 'loc_2', lnt: 121.5200, lat: 25.0478, point: 15 },
          { id: 'loc_3', lnt: 121.5100, lat: 25.0400, point: 20 },
        ],
      },
    };

    return withCors(NextResponse.json(response, { status: 200 }), request);
  } catch (error) {
    return withCors(
      NextResponse.json({ error: 'Invalid request' }, { status: 400 }),
      request
    );
  }
}
