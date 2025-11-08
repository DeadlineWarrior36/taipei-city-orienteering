import type {
  LoginRequest,
  LoginResponse,
  MissionsListRequest,
  MissionsListResponse,
  MissionDetailRequest,
  MissionDetailResponse,
  CreateQuestRequest,
  CreateQuestResponse,
  SubmitQuestRequest,
  SubmitQuestResponse,
  QuestOverviewResponse,
  MissionPathsResponse,
} from '@/types/api';

class ApiClient {
  private token: string | null = null;
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }

  private async get<T>(endpoint: string, params?: object): Promise<T> {
    if (!params) {
      return this.request<T>(endpoint, {
        method: 'GET',
      });
    }

    // 過濾掉 undefined 的值並轉換為字串
    const filteredParams: Record<string, string> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        filteredParams[key] = String(value);
      }
    });

    const query = Object.keys(filteredParams).length > 0
      ? `?${new URLSearchParams(filteredParams).toString()}`
      : '';

    return this.request<T>(`${endpoint}${query}`, {
      method: 'GET',
    });
  }

  private async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.post<LoginResponse>('/auth/login', data);
  }

  async getMissionsList(params?: MissionsListRequest): Promise<MissionsListResponse> {
    return this.get<MissionsListResponse>('/missions/list', params);
  }

  async getMissionDetail(params: MissionDetailRequest): Promise<MissionDetailResponse> {
    return this.get<MissionDetailResponse>(`/missions/${params.id}`);
  }

  async getMissionPaths(missionId: string): Promise<MissionPathsResponse> {
    return this.get<MissionPathsResponse>(`/missions/${missionId}/paths`);
  }

  async createQuest(userId: string, data: CreateQuestRequest): Promise<CreateQuestResponse> {
    return this.post<CreateQuestResponse>(`/users/${userId}/quests`, data);
  }

  async submitQuest(userId: string, questId: string, data: SubmitQuestRequest): Promise<SubmitQuestResponse> {
    return this.post<SubmitQuestResponse>(`/users/${userId}/quests/${questId}`, data);
  }

  async getQuestOverview(userId: string, questId: string): Promise<QuestOverviewResponse> {
    return this.get<QuestOverviewResponse>(`/users/${userId}/quests/${questId}/overview`);
  }
}

export const apiClient = new ApiClient();
