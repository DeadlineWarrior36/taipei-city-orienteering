import { NextRequest, NextResponse } from 'next/server';
import type { MissionsListResponse } from '@/types/api';
import { withCors, handleCorsOptions } from '@/lib/cors';

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions(request);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lntStr = searchParams.get('lnt');
    const latStr = searchParams.get('lat');

    let lnt: number | undefined;
    let lat: number | undefined;

    if (lntStr) {
      lnt = parseFloat(lntStr);
      if (isNaN(lnt)) {
        return withCors(
          NextResponse.json({ error: 'Invalid lnt parameter' }, { status: 400 }),
          request
        );
      }
    }

    if (latStr) {
      lat = parseFloat(latStr);
      if (isNaN(lat)) {
        return withCors(
          NextResponse.json({ error: 'Invalid lat parameter' }, { status: 400 }),
          request
        );
      }
    }

    const response: MissionsListResponse = {
      missions: [
        {
          id: 'mission_1',
          name: 'Taipei City Tour',
          locations: [
            { id: 'loc_1', lnt: 121.5654, lat: 25.0330, point: 10 },
            { id: 'loc_2', lnt: 121.5200, lat: 25.0478, point: 15 },
          ],
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
