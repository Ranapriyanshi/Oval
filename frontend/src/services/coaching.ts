import api from './api';

// ── Types ──────────────────────────────────────────────────────────────────

export interface CoachUser {
  id: string;
  name: string;
  city?: string;
  bio?: string;
  karma_points?: number;
}

export interface CoachAvailability {
  id: string;
  coach_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface CoachRatingItem {
  id: string;
  rating: number;
  review?: string;
  created_at: string;
  User?: { id: string; name: string };
}

export interface CoachItem {
  id: string;
  user_id: string;
  bio: string;
  experience_years: number;
  hourly_rate: number;
  currency: string;
  specializations: string[];
  certifications: string[];
  is_verified: boolean;
  rating_avg: number;
  rating_count: number;
  total_sessions: number;
  city?: string;
  User?: CoachUser;
  Availabilities?: CoachAvailability[];
  Ratings?: CoachRatingItem[];
}

export interface CoachesResponse {
  coaches: CoachItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface CoachingSessionItem {
  id: string;
  coach_id: string;
  student_id: string;
  sport: string;
  session_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  cost: number;
  currency: string;
  location?: string;
  created_at: string;
  Coach?: CoachItem & { User?: CoachUser };
  Student?: CoachUser;
}

export interface SessionsResponse {
  sessions: CoachingSessionItem[];
}

// ── API calls ──────────────────────────────────────────────────────────────

export const coachingApi = {
  /** List coaches with optional filters */
  getCoaches: async (params?: {
    sport?: string;
    city?: string;
    min_rating?: number;
    max_rate?: number;
    verified?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<CoachesResponse> => {
    const { data } = await api.get('/coaching', { params });
    return data;
  },

  /** Get coach detail */
  getCoach: async (id: string): Promise<CoachItem> => {
    const { data } = await api.get(`/coaching/${id}`);
    return data;
  },

  /** Book a coaching session */
  bookSession: async (coachId: string, params: {
    sport: string;
    session_date: string;
    start_time: string;
    duration_minutes?: number;
    notes?: string;
    location?: string;
  }): Promise<CoachingSessionItem> => {
    const { data } = await api.post(`/coaching/${coachId}/book`, params);
    return data;
  },

  /** Get my sessions */
  getMySessions: async (params?: {
    status?: string;
    upcoming?: boolean;
  }): Promise<SessionsResponse> => {
    const { data } = await api.get('/coaching/sessions/my', { params });
    return data;
  },

  /** Cancel a session */
  cancelSession: async (sessionId: string) => {
    const { data } = await api.post(`/coaching/sessions/${sessionId}/cancel`);
    return data;
  },

  /** Rate a coach */
  rateCoach: async (coachId: string, params: {
    rating: number;
    review?: string;
    session_id?: string;
  }) => {
    const { data } = await api.post(`/coaching/${coachId}/rate`, params);
    return data;
  },
};

export default coachingApi;
