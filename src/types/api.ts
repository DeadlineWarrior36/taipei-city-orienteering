export interface Location {
  id: string;
  name: string;
  lnt: number;
  lat: number;
  point: number;
  description?: string;
}

export interface Coordinate {
  lnt: number;
  lat: number;
}

export interface Mission {
  id: string;
  name: string;
  locations: Location[];
}

export interface LoginRequest {
  id: string;
}

export interface LoginResponse {
  token: string;
}

export interface MissionsListRequest {
  lnt?: number;
  lat?: number;
}

export interface MissionsListResponse {
  missions: Mission[];
}

export interface MissionDetailRequest {
  id: string;
}

export interface MissionDetailResponse {
  mission: Mission;
}

export interface CreateQuestRequest {
  mission_id: string;
}

export interface CreateQuestResponse {
  id: string;
}

export interface SubmitQuestRequest {
  paths: Coordinate[];
}

export interface SubmitQuestResponse {
  points: number;
  time_spent: string;
  distance: number;
  completed_location_ids: string[];
  is_finished: boolean;
}

export interface QuestOverviewResponse {
  mission_id: string;
  path: Coordinate[];
  points: number;
  time_spent: string;
  distance: number;
  completed_location_ids: string[];
}

export interface PathData {
  id: string;
  path: Coordinate[];
  time_spent: string;
  distance: number;
}

export interface MissionPathsResponse {
  paths: PathData[];
}

export interface LocationsListRequest {
  lnt?: number;
  lat?: number;
}

export interface LocationsListResponse {
  locations: Location[];
}

export interface UserResponse {
  id: string;
  total_points: number;
}
