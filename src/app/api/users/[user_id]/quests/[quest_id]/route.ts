import { NextRequest, NextResponse } from 'next/server';
import type { SubmitQuestRequest, SubmitQuestResponse } from '@/types/api';
import { withCors, handleCorsOptions } from '@/lib/cors';

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions(request);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ user_id: string; quest_id: string }> }
) {
  try {
    const { user_id, quest_id } = await params;
    const body: SubmitQuestRequest = await request.json();

    if (!body.paths || body.paths.length === 0) {
      return withCors(
        NextResponse.json({ error: 'paths is required' }, { status: 400 }),
        request
      );
    }

    const response: SubmitQuestResponse = {
      points: 45,
      time_spent: 'PT1H30M',
      distance: 5.2,
    };

    return withCors(NextResponse.json(response, { status: 200 }), request);
  } catch (error) {
    return withCors(
      NextResponse.json({ error: 'Invalid request' }, { status: 400 }),
      request
    );
  }
}
