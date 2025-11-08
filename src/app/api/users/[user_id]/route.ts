import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from '@/lib/db/users';

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

    const user = await getUserById(user_id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      total_points: user.total_points,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
