import { supabaseAdmin } from '@/lib/supabase';
import type { Location } from '@/types/api';

export interface LocationRecord {
  id: string;
  name: string;
  lnt: number;
  lat: number;
  point: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export async function getLocations(params?: {
  lnt?: number;
  lat?: number;
}): Promise<Location[]> {
  const supabase = supabaseAdmin();
  const query = supabase.from('locations').select('*');

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch locations: ${error.message}`);
  }

  return (data || []).map((record: LocationRecord) => ({
    id: record.id,
    name: record.name,
    lnt: record.lnt,
    lat: record.lat,
    point: record.point,
    description: record.description,
  }));
}

export async function getLocationById(id: string): Promise<Location | null> {
  const supabase = supabaseAdmin();

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch location: ${error.message}`);
  }

  return {
    id: data.id,
    name: data.name,
    lnt: data.lnt,
    lat: data.lat,
    point: data.point,
    description: data.description,
  };
}
