import { supabaseAdmin } from '@/lib/supabase';
import type { Mission } from '@/types/api';

export interface MissionRecord {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface MissionLocationRecord {
  id: string;
  mission_id: string;
  location_id: string;
  sequence_order: number;
  created_at: string;
  locations: {
    id: string;
    name: string;
    lnt: number;
    lat: number;
    point: number;
  };
}

export async function getMissions(): Promise<Mission[]> {
  const supabase = supabaseAdmin();

  const { data: missions, error: missionsError } = await supabase
    .from('missions')
    .select('*')
    .order('name');

  if (missionsError) {
    throw new Error(`Failed to fetch missions: ${missionsError.message}`);
  }

  const missionIds = missions.map(m => m.id);

  const { data: missionLocations, error: locationsError } = await supabase
    .from('mission_locations')
    .select(`
      id,
      mission_id,
      location_id,
      sequence_order,
      locations:location_id (
        id,
        name,
        lnt,
        lat,
        point
      )
    `)
    .in('mission_id', missionIds)
    .order('sequence_order');

  if (locationsError) {
    throw new Error(`Failed to fetch mission locations: ${locationsError.message}`);
  }

  return missions.map((mission: MissionRecord) => ({
    id: mission.id,
    name: mission.name,
    locations: (missionLocations || [])
      .filter((ml: any) => ml.mission_id === mission.id)
      .map((ml: any) => ({
        id: ml.locations.id,
        name: ml.locations.name,
        lnt: ml.locations.lnt,
        lat: ml.locations.lat,
        point: ml.locations.point,
      })),
  }));
}

export async function getMissionById(id: string): Promise<Mission | null> {
  const supabase = supabaseAdmin();

  const { data: mission, error: missionError } = await supabase
    .from('missions')
    .select('*')
    .eq('id', id)
    .single();

  if (missionError) {
    if (missionError.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch mission: ${missionError.message}`);
  }

  const { data: missionLocations, error: locationsError } = await supabase
    .from('mission_locations')
    .select(`
      id,
      mission_id,
      location_id,
      sequence_order,
      locations:location_id (
        id,
        name,
        lnt,
        lat,
        point
      )
    `)
    .eq('mission_id', id)
    .order('sequence_order');

  if (locationsError) {
    throw new Error(`Failed to fetch mission locations: ${locationsError.message}`);
  }

  return {
    id: mission.id,
    name: mission.name,
    locations: (missionLocations || []).map((ml: any) => ({
      id: ml.locations.id,
      name: ml.locations.name,
      lnt: ml.locations.lnt,
      lat: ml.locations.lat,
      point: ml.locations.point,
    })),
  };
}
