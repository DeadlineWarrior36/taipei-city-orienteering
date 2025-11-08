import { supabaseAdmin } from '@/lib/supabase';

export interface UserRecord {
  id: string;
  total_points: number;
  created_at: string;
  updated_at: string;
}

export async function getUserById(userId: string): Promise<UserRecord | null> {
  const supabase = supabaseAdmin();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch user: ${error.message}`);
  }

  return data;
}

export async function getUserTotalPoints(userId: string): Promise<number> {
  const user = await getUserById(userId);
  return user?.total_points ?? 0;
}
