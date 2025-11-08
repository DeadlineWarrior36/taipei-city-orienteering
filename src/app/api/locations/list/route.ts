import { NextRequest, NextResponse } from 'next/server';
import type { LocationsListResponse } from '@/types/api';
import { getLocations } from '@/lib/db/locations';

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

    const locations = await getLocations({ lnt, lat });

    const response: LocationsListResponse = {
      locations,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
