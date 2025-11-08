import { NextRequest, NextResponse } from 'next/server';
import type { CreateQuestRequest, CreateQuestResponse } from '@/types/api';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
) {
  try {
    const { user_id } = await params;
    const body: CreateQuestRequest = await request.json();

    if (!body.mission_id) {
      return NextResponse.json(
        { error: 'mission_id is required' },
        { status: 400 }
      );
    }

    const quest_id = crypto.randomUUID();

    const response: CreateQuestResponse = {
      id: quest_id,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
