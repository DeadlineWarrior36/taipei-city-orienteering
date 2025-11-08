import { supabaseAdmin } from '@/lib/supabase';

export interface PointsTransactionRecord {
  id: string;
  user_id: string;
  quest_id: string | null;
  transaction_type: 'earned' | 'used';
  points: number;
  description: string | null;
  created_at: string;
}

export interface CreateTransactionParams {
  userId: string;
  questId?: string;
  transactionType: 'earned' | 'used';
  points: number;
  description?: string;
}

export async function createPointsTransaction(
  params: CreateTransactionParams
): Promise<string> {
  const supabase = supabaseAdmin();

  const { data, error } = await supabase
    .from('points_transactions')
    .insert({
      user_id: params.userId,
      quest_id: params.questId || null,
      transaction_type: params.transactionType,
      points: params.points,
      description: params.description || null,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to create points transaction: ${error.message}`);
  }

  return data.id;
}

export async function getUserPointsTransactions(
  userId: string,
  transactionType?: 'earned' | 'used',
  limit = 50
): Promise<PointsTransactionRecord[]> {
  const supabase = supabaseAdmin();

  let query = supabase
    .from('points_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (transactionType) {
    query = query.eq('transaction_type', transactionType);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch points transactions: ${error.message}`);
  }

  return data || [];
}

export async function getUserEarnedTransactions(
  userId: string,
  limit = 50
): Promise<PointsTransactionRecord[]> {
  return getUserPointsTransactions(userId, 'earned', limit);
}

export async function getUserUsedTransactions(
  userId: string,
  limit = 50
): Promise<PointsTransactionRecord[]> {
  return getUserPointsTransactions(userId, 'used', limit);
}
