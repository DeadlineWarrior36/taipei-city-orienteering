import { NextRequest, NextResponse } from 'next/server';
import { getUserPointsTransactions } from '@/lib/db/points-transactions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
) {
  try {
    const requestUserId = request.headers.get('x-user-id');
    if (!requestUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_id } = await params;

    if (requestUserId !== user_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'earned' | 'used' | null;
    const limit = parseInt(searchParams.get('limit') || '50');

    const transactions = await getUserPointsTransactions(
      user_id,
      type || undefined,
      limit
    );

    return NextResponse.json({ transactions }, { status: 200 });
  } catch (error) {
    console.error('Error fetching points transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
