import api from './api';

// --- Types ---

export interface GametimeParticipant {
  id: string;
  gametime_id: string;
  user_id: string;
  status: 'joined' | 'left' | 'removed';
  joined_at: string;
  User?: { id: string; name: string; city?: string };
}

export interface GametimeEvent {
  id: string;
  creator_id: string;
  title: string;
  sport_name: string;
  description?: string | null;
  event_type: 'casual' | 'competitive' | 'training';
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'any';
  venue_name?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  start_time: string;
  end_time: string;
  max_players: number;
  current_players: number;
  cost_per_person_cents: number;
  currency: string;
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string | null;
  created_at: string;
  // Associations
  Creator?: { id: string; name: string; city?: string; country?: string };
  GametimeParticipants?: GametimeParticipant[];
  // Computed fields from detail endpoint
  is_joined?: boolean;
  is_creator?: boolean;
}

export interface GametimeListResponse {
  events: GametimeEvent[];
  total: number;
}

export interface MyGametimeResponse {
  created: GametimeEvent[];
  joined: GametimeEvent[];
}

export interface CreateGametimePayload {
  title: string;
  sport_name: string;
  description?: string;
  event_type: 'casual' | 'competitive' | 'training';
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'any';
  venue_name?: string;
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  start_time: string;
  end_time: string;
  max_players: number;
  cost_per_person_cents?: number;
  currency?: string;
  notes?: string;
}

// --- API calls ---

export const gametimeApi = {
  /** List upcoming gametime events */
  list: (params?: {
    sport?: string;
    city?: string;
    event_type?: string;
    skill_level?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) => api.get<GametimeListResponse>('/gametime', { params }),

  /** Get gametime event detail */
  getById: (id: string) => api.get<GametimeEvent>(`/gametime/${id}`),

  /** Create a gametime event */
  create: (data: CreateGametimePayload) => api.post<GametimeEvent>('/gametime', data),

  /** Join a gametime event */
  join: (id: string) => api.post<{ message: string; current_players: number }>(`/gametime/${id}/join`),

  /** Leave a gametime event */
  leave: (id: string) => api.post<{ message: string; current_players: number }>(`/gametime/${id}/leave`),

  /** Cancel a gametime event (creator only) */
  cancel: (id: string) => api.post(`/gametime/${id}/cancel`),

  /** Get my gametime events (created + joined) */
  myEvents: () => api.get<MyGametimeResponse>('/gametime/my/events'),
};
