import { NextRequest, NextResponse } from 'next/server';
import type { MissionsListResponse } from '@/types/api';
import { getMissions } from '@/lib/db/missions';

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

    const missions = await getMissions();

    const response: MissionsListResponse = {
      missions,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching missions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
