import { NextRequest, NextResponse } from 'next/server';
import type { CreateQuestRequest, CreateQuestResponse } from '@/types/api';
import { withCors, handleCorsOptions } from '@/lib/cors';

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions(request);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
) {
  try {
    const { user_id } = await params;
    const body: CreateQuestRequest = await request.json();

    if (!body.mission_id) {
      return withCors(
        NextResponse.json({ error: 'mission_id is required' }, { status: 400 }),
        request
      );
    }

    const quest_id = crypto.randomUUID();

    const response: CreateQuestResponse = {
      id: quest_id,
    };

    return withCors(NextResponse.json(response, { status: 200 }), request);
  } catch (error) {
    return withCors(
      NextResponse.json({ error: 'Invalid request' }, { status: 400 }),
      request
    );
  }
}
