import { NextRequest, NextResponse } from 'next/server';
import type { MissionPathsResponse } from '@/types/api';
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

    const response: MissionPathsResponse = {
      paths: [
        {
          id: 'path_1',
          path: [
            { lnt: 121.5654, lat: 25.0330 },
            { lnt: 121.5200, lat: 25.0478 },
            { lnt: 121.5100, lat: 25.0400 },
          ],
          time_spent: 'PT1H30M',
          distance: 5.2,
        },
        {
          id: 'path_2',
          path: [
            { lnt: 121.5654, lat: 25.0330 },
            { lnt: 121.5300, lat: 25.0500 },
          ],
          time_spent: 'PT2H',
          distance: 3.8,
        },
      ],
    };

    return withCors(NextResponse.json(response, { status: 200 }), request);
  } catch (error) {
    return withCors(
      NextResponse.json({ error: 'Invalid request' }, { status: 400 }),
      request
    );
  }
}
