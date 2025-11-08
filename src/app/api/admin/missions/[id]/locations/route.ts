import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const supabase = supabaseAdmin();
    const { data, error } = await supabase
      .from('mission_locations')
      .select(`
        id,
        location_id,
        sequence_order,
        locations:location_id (
          id,
          name,
          lnt,
          lat,
          point,
          description
        )
      `)
      .eq('mission_id', id)
      .order('sequence_order');

    if (error) {
      throw error;
    }

    return NextResponse.json({ locations: data || [] });
  } catch (error) {
    console.error('Failed to fetch mission locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mission locations' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: missionId } = await context.params;
    const body = await request.json();
    const { location_id } = body;

    if (!location_id) {
      return NextResponse.json(
        { error: 'Missing required field: location_id' },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin();

    // Get the current max sequence_order
    const { data: maxSeq } = await supabase
      .from('mission_locations')
      .select('sequence_order')
      .eq('mission_id', missionId)
      .order('sequence_order', { ascending: false })
      .limit(1)
      .single();

    const nextSequence = (maxSeq?.sequence_order ?? -1) + 1;

    const { data, error } = await supabase
      .from('mission_locations')
      .insert({
        mission_id: missionId,
        location_id,
        sequence_order: nextSequence,
      })
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (error) {
    console.error('Failed to add location to mission:', error);
    return NextResponse.json(
      { error: 'Failed to add location to mission' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: missionId } = await context.params;
    const searchParams = request.nextUrl.searchParams;
    const locationId = searchParams.get('location_id');

    if (!locationId) {
      return NextResponse.json(
        { error: 'Missing required parameter: location_id' },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin();
    const { error } = await supabase
      .from('mission_locations')
      .delete()
      .eq('mission_id', missionId)
      .eq('location_id', locationId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to remove location from mission:', error);
    return NextResponse.json(
      { error: 'Failed to remove location from mission' },
      { status: 500 }
    );
  }
}
