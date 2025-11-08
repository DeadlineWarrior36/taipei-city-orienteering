import { NextRequest, NextResponse } from 'next/server';
import type { SubmitQuestRequest, SubmitQuestResponse } from '@/types/api';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ user_id: string; quest_id: string }> }
) {
  try {
    const { user_id, quest_id } = await params;
    const body: SubmitQuestRequest = await request.json();

    if (!body.paths || body.paths.length === 0) {
      return NextResponse.json({ error: 'paths is required' }, { status: 400 });
    }

    const response: SubmitQuestResponse = {
      points: 45,
      time_spent: 'PT1H30M',
      distance: 5.2,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
