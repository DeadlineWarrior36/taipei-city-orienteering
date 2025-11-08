import { supabaseAdmin } from '@/lib/supabase';
import type { Coordinate } from '@/types/api';

export interface QuestRecord {
  id: string;
  user_id: string;
  mission_id: string;
  is_finished: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuestPathRecord {
  id: string;
  quest_id: string;
  lnt: number;
  lat: number;
  sequence_order: number;
  created_at: string;
}

export async function createQuest(
  userId: string,
  missionId: string
): Promise<string> {
  const supabase = supabaseAdmin();

  const { data, error } = await supabase
    .from('quests')
    .insert({
      user_id: userId,
      mission_id: missionId,
      is_finished: false,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to create quest: ${error.message}`);
  }

  return data.id;
}

export async function getQuestById(questId: string): Promise<QuestRecord | null> {
  const supabase = supabaseAdmin();

  const { data, error } = await supabase
    .from('quests')
    .select('*')
    .eq('id', questId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch quest: ${error.message}`);
  }

  return data;
}

export async function getQuestPaths(questId: string): Promise<Coordinate[]> {
  const supabase = supabaseAdmin();

  const { data, error } = await supabase
    .from('quest_paths')
    .select('lnt, lat, sequence_order')
    .eq('quest_id', questId)
    .order('sequence_order');

  if (error) {
    throw new Error(`Failed to fetch quest paths: ${error.message}`);
  }

  return (data || []).map((p: any) => ({
    lnt: p.lnt,
    lat: p.lat,
  }));
}

export async function updateQuestPaths(
  questId: string,
  paths: Coordinate[]
): Promise<void> {
  const supabase = supabaseAdmin();

  const { data: existingPaths, error: fetchError } = await supabase
    .from('quest_paths')
    .select('sequence_order')
    .eq('quest_id', questId)
    .order('sequence_order', { ascending: false })
    .limit(1);

  if (fetchError) {
    throw new Error(`Failed to fetch existing paths: ${fetchError.message}`);
  }

  const lastSequence = existingPaths?.[0]?.sequence_order ?? -1;

  if (paths.length > lastSequence + 1) {
    const newPaths = paths.slice(lastSequence + 1).map((coord, index) => ({
      quest_id: questId,
      lnt: coord.lnt,
      lat: coord.lat,
      sequence_order: lastSequence + 1 + index,
    }));

    const { error: insertError } = await supabase
      .from('quest_paths')
      .insert(newPaths);

    if (insertError) {
      throw new Error(`Failed to insert quest paths: ${insertError.message}`);
    }
  }
}
