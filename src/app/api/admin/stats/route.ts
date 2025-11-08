import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { AdminStats } from '@/types/api';

export async function GET() {
  try {
    const supabase = supabaseAdmin();

    const [
      usersResult,
      missionsResult,
      locationsResult,
      productsResult,
      questsResult,
      completedQuestsResult,
      earnedPointsResult,
      usedPointsResult,
    ] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('missions').select('id', { count: 'exact', head: true }),
      supabase.from('locations').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('quests').select('id', { count: 'exact', head: true }),
      supabase.from('quests').select('id', { count: 'exact', head: true }).eq('is_finished', true),
      supabase.from('points_transactions').select('points').eq('transaction_type', 'earned'),
      supabase.from('points_transactions').select('points').eq('transaction_type', 'used'),
    ]);

    const stats: AdminStats = {
      totalUsers: usersResult.count || 0,
      totalMissions: missionsResult.count || 0,
      totalLocations: locationsResult.count || 0,
      totalProducts: productsResult.count || 0,
      totalQuests: questsResult.count || 0,
      completedQuests: completedQuestsResult.count || 0,
      totalPointsEarned: earnedPointsResult.data?.reduce((sum, t) => sum + t.points, 0) || 0,
      totalPointsUsed: usedPointsResult.data?.reduce((sum, t) => sum + t.points, 0) || 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to fetch admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
