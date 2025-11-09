import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getMissionById } from '@/lib/db/missions';
import type { MissionDetailResponse } from '@/types/api';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

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

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const supabase = supabaseAdmin();
    const { error } = await supabase
      .from('missions')
      .update(body)
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update mission:', error);
    return NextResponse.json(
      { error: 'Failed to update mission' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const supabase = supabaseAdmin();
    const { error } = await supabase
      .from('missions')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete mission:', error);
    return NextResponse.json(
      { error: 'Failed to delete mission' },
      { status: 500 }
    );
  }
}
