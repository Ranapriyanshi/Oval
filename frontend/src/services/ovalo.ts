import api from './api';

export type OvaloTier =
  | 'rookie_nest'
  | 'community_flyer'
  | 'court_commander'
  | 'elite_wing'
  | 'legend_of_the_oval';

export const TIER_LABELS: Record<OvaloTier, string> = {
  rookie_nest: 'Rookie Nest',
  community_flyer: 'Community Flyer',
  court_commander: 'Court Commander',
  elite_wing: 'Elite Wing',
  legend_of_the_oval: 'Legend of the Oval',
};

export interface OvaloProfileResponse {
  id: string;
  user_id: string;
  total_xp: number;
  tier: OvaloTier;
  tier_label: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  feather_level: number;
  unlocked_embellishments: string[];
  next_tier: OvaloTier | null;
  xp_needed: number;
  progress_pct: number;
  user_name?: string;
  avatar_choice?: string;
}

export type XPSource =
  | 'booking_completed'
  | 'gametime_attended'
  | 'gametime_hosted'
  | 'streak_bonus'
  | 'new_sport'
  | 'friend_invited'
  | 'tournament_won'
  | 'training_session'
  | 'player_rated'
  | 'match_won'
  | 'event_joined'
  | 'coaching_completed';

export const XP_SOURCE_LABELS: Record<XPSource, string> = {
  booking_completed: 'Court Booked',
  gametime_attended: 'Game Attended',
  gametime_hosted: 'Game Hosted',
  streak_bonus: 'Streak Bonus',
  new_sport: 'New Sport Tried',
  friend_invited: 'Friend Invited',
  tournament_won: 'Tournament Won',
  training_session: 'Training Session',
  player_rated: 'Player Rated',
  match_won: 'Match Won',
  event_joined: 'Event Joined',
  coaching_completed: 'Coaching Session',
};

export const XP_SOURCE_ICONS: Record<XPSource, string> = {
  booking_completed: '🏟️',
  gametime_attended: '🏃',
  gametime_hosted: '👑',
  streak_bonus: '🔥',
  new_sport: '🌟',
  friend_invited: '🤝',
  tournament_won: '🏆',
  training_session: '💪',
  player_rated: '⭐',
  match_won: '🥇',
  event_joined: '🎪',
  coaching_completed: '🎯',
};

export interface XPTransactionItem {
  id: string;
  user_id: string;
  amount: number;
  source: XPSource;
  reference_id: string | null;
  created_at: string;
}

export interface XPHistoryResponse {
  transactions: XPTransactionItem[];
  total: number;
}

export interface OvaloLeaderboardEntry {
  rank: number;
  user_id: string;
  name: string;
  city: string | null;
  country: string | null;
  avatar_choice: string | null;
  total_xp: number;
  tier: OvaloTier;
  tier_label: string;
  feather_level: number;
  streak: number;
}

export interface XPAwardResult {
  xp_awarded: number;
  total_xp: number;
  tier: OvaloTier;
  feather_level: number;
  tier_changed: boolean;
  previous_tier: OvaloTier;
  streak: number;
}

export const ovaloApi = {
  getProfile: () =>
    api.get<OvaloProfileResponse>('/ovalo/profile').then((r) => r.data),

  getHistory: (params?: { limit?: number; offset?: number }) =>
    api.get<XPHistoryResponse>('/ovalo/history', { params }).then((r) => r.data),

  getLeaderboard: (params?: { limit?: number; offset?: number }) =>
    api.get<{ leaderboard: OvaloLeaderboardEntry[]; total: number }>('/ovalo/leaderboard', { params }).then((r) => r.data),
};
