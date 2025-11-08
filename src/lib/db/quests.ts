import { supabaseAdmin } from '@/lib/supabase';
import type { Coordinate, Location } from '@/types/api';
import { getMissionById } from './missions';
import { isWithinDistance } from '@/lib/utils/distance';
import { QUEST_CONFIG } from '@/config/quest';

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
): Promise<string | null> {
  const supabase = supabaseAdmin();

  const { data: mission, error: missionError } = await supabase
    .from('missions')
    .select('id')
    .eq('id', missionId)
    .single();

  if (missionError || !mission) {
    return null;
  }

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

  return (data || []).map((p: Pick<QuestPathRecord, 'lnt' | 'lat' | 'sequence_order'>) => ({
    lnt: p.lnt,
    lat: p.lat,
  }));
}

/**
 * 計算已完成的 location IDs
 */
export async function getCompletedLocationIds(
  questId: string,
  paths: Coordinate[]
): Promise<string[]> {
  const quest = await getQuestById(questId);
  if (!quest) return [];

  const mission = await getMissionById(quest.mission_id);
  if (!mission || !mission.locations || mission.locations.length === 0) {
    return [];
  }

  const completedIds: string[] = [];

  for (const location of mission.locations) {
    const hasVisited = paths.some((path) =>
      isWithinDistance(
        path,
        { lnt: location.lnt, lat: location.lat },
        QUEST_CONFIG.COMPLETION_DISTANCE_METERS
      )
    );

    if (hasVisited) {
      completedIds.push(location.id);
    }
  }

  return completedIds;
}

async function checkMissionCompletion(
  questId: string,
  paths: Coordinate[]
): Promise<boolean> {
  const quest = await getQuestById(questId);
  if (!quest) return false;

  const mission = await getMissionById(quest.mission_id);
  if (!mission || !mission.locations || mission.locations.length === 0) {
    return false;
  }

  for (const location of mission.locations) {
    const hasVisited = paths.some((path) =>
      isWithinDistance(
        path,
        { lnt: location.lnt, lat: location.lat },
        QUEST_CONFIG.COMPLETION_DISTANCE_METERS
      )
    );

    if (!hasVisited) {
      return false;
    }
  }

  return true;
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

  const isCompleted = await checkMissionCompletion(questId, paths);

  if (isCompleted) {
    const { error: updateError } = await supabase
      .from('quests')
      .update({ is_finished: true })
      .eq('id', questId);

    if (updateError) {
      throw new Error(`Failed to update quest completion: ${updateError.message}`);
    }
  }
}

export interface QuestWithPaths {
  id: string;
  path: Coordinate[];
  time_spent: string;
  distance: number;
}

export async function getQuestsByMissionId(
  missionId: string
): Promise<QuestWithPaths[]> {
  const supabase = supabaseAdmin();

  const { data: quests, error: questsError } = await supabase
    .from('quests')
    .select('id, created_at')
    .eq('mission_id', missionId)
    .eq('is_finished', true);

  if (questsError) {
    throw new Error(`Failed to fetch quests: ${questsError.message}`);
  }

  if (!quests || quests.length === 0) {
    return [];
  }

  const questIds = quests.map(q => q.id);

  const { data: paths, error: pathsError } = await supabase
    .from('quest_paths')
    .select('quest_id, lnt, lat, sequence_order')
    .in('quest_id', questIds)
    .order('quest_id')
    .order('sequence_order');

  if (pathsError) {
    throw new Error(`Failed to fetch quest paths: ${pathsError.message}`);
  }

  return quests.map(quest => ({
    id: quest.id,
    path: (paths || [])
      .filter((p: Pick<QuestPathRecord, 'quest_id' | 'lnt' | 'lat' | 'sequence_order'>) => p.quest_id === quest.id)
      .map((p: Pick<QuestPathRecord, 'quest_id' | 'lnt' | 'lat' | 'sequence_order'>) => ({
        lnt: p.lnt,
        lat: p.lat,
      })),
    time_spent: 'PT0S',
    distance: 0,
  }));
}
