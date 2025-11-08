import { NextRequest, NextResponse } from 'next/server';
import type { LocationsListResponse } from '@/types/api';

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
        return NextResponse.json({ error: 'Invalid lnt parameter' }, { status: 400 });
      }
    }

    if (latStr) {
      lat = parseFloat(latStr);
      if (isNaN(lat)) {
        return NextResponse.json({ error: 'Invalid lat parameter' }, { status: 400 });
      }
    }

    const response: LocationsListResponse = {
      locations: [
        { id: 'loc_1', name: 'Taipei 101', lnt: 121.5654, lat: 25.0330, point: 10 },
        { id: 'loc_2', name: 'National Palace Museum', lnt: 121.5200, lat: 25.0478, point: 15 },
        { id: 'loc_3', name: 'Chiang Kai-shek Memorial Hall', lnt: 121.5436, lat: 25.0375, point: 20 },
      ],
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
