import api from './api';

// --- Types ---

export interface PlaypalSportsSkill {
  id: string;
  sport_name: string;
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'professional';
}

export interface PlaypalAvailability {
  id: string;
  day_of_week: number; // 0=Sunday .. 6=Saturday
  start_time: string;  // "HH:mm"
  end_time: string;
}

export interface PlaypalPhoto {
  id: string;
  url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface PlaypalUser {
  id: string;
  name: string;
  email: string;
  city?: string | null;
  bio?: string | null;
  country: string;
  karma_points?: number;
  match_score?: number;
  match_reasons?: string[];
  UserSportsSkills?: PlaypalSportsSkill[];
  UserAvailabilities?: PlaypalAvailability[];
  UserProfilePhotos?: PlaypalPhoto[];
}

export interface DiscoverResponse {
  matches: PlaypalUser[];
}

export interface SwipeResponse {
  swipe: any;
  match: any | null;
  is_match: boolean;
}

export interface MatchItem {
  match_id: string;
  matched_at: string;
  user: PlaypalUser;
}

export interface MatchesResponse {
  matches: MatchItem[];
}

export interface PlaypalProfile extends PlaypalUser {
  is_matched: boolean;
}

// --- API calls ---

export const playpalsApi = {
  /** Discover potential playpals with optional filters */
  discover: (params?: { sport?: string; max_distance?: number; limit?: number }) =>
    api.get<DiscoverResponse>('/playpals/discover', { params }),

  /** Swipe left (pass) or right (like) on a user */
  swipe: (userId: string, direction: 'left' | 'right') =>
    api.post<SwipeResponse>(`/playpals/${userId}/swipe`, { direction }),

  /** Get list of matched playpals */
  getMatches: () =>
    api.get<MatchesResponse>('/playpals/matches'),

  /** Unmatch a user */
  unmatch: (userId: string) =>
    api.post(`/playpals/${userId}/unmatch`),

  /** Get full playpal profile */
  getProfile: (userId: string) =>
    api.get<PlaypalProfile>(`/playpals/${userId}/profile`),
};
