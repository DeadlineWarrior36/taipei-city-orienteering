import { NextRequest, NextResponse } from 'next/server';
import type { MissionDetailResponse } from '@/types/api';
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

    const response: MissionDetailResponse = {
      mission: {
        id: mission.id,
        name: mission.name,
        locations: mission.locations.map(loc => ({
          id: loc.id,
          name: loc.name,
          lnt: loc.lnt,
          lat: loc.lat,
          point: loc.point,
        })),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching mission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
