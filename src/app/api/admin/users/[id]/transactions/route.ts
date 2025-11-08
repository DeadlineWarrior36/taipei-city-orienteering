import { NextRequest, NextResponse } from 'next/server';
import { getUserPointsTransactions } from '@/lib/db/points-transactions';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: userId } = await context.params;

    const transactions = await getUserPointsTransactions(userId);

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Failed to fetch user transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user transactions' },
      { status: 500 }
    );
  }
}
