import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeHidden = searchParams.get('include_hidden') === 'true';

    const supabase = supabaseAdmin();
    let query = supabase.from('missions').select('*').order('name');

    if (!includeHidden) {
      query = query.eq('is_hidden', false);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ missions: data || [] });
  } catch (error) {
    console.error('Failed to fetch missions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch missions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, is_hidden } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin();
    const { data, error } = await supabase
      .from('missions')
      .insert({
        name,
        is_hidden: is_hidden ?? false,
      })
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (error) {
    console.error('Failed to create mission:', error);
    return NextResponse.json(
      { error: 'Failed to create mission' },
      { status: 500 }
    );
  }
}
