import api from './api';

export interface UserStatsOverall {
  matches_played: number;
  wins: number;
  hours_played: number;
}

export interface SportStat {
  user_id?: string;
  sport: string;
  matches_played: number;
  wins: number;
  losses: number;
  draws: number;
  hours_played: number;
}

export interface StatsResponse {
  karma_points: number;
  overall: UserStatsOverall;
  by_sport: SportStat[];
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  name?: string;
  city?: string | null;
  country?: string | null;
  karma_points?: number;
  matches_played?: number;
  wins?: number;
  sport?: string;
  losses?: number;
  draws?: number;
  hours_played?: number;
}

export const statsApi = {
  getStats: () => api.get<StatsResponse>('/stats').then((r) => r.data),

  getStatsBySport: (sport: string) =>
    api
      .get<StatsResponse & { sport: string; matches_played: number; wins: number; losses: number; draws: number; hours_played: number }>(
        `/stats/sport/${encodeURIComponent(sport)}`
      )
      .then((r) => r.data),

  getKarma: () => api.get<{ karma_points: number }>('/stats/karma').then((r) => r.data),

  getLeaderboards: (params?: { sort?: string; sport?: string; country?: string; limit?: number; offset?: number }) =>
    api.get<{ leaderboard: LeaderboardEntry[]; total: number; sort?: string }>('/leaderboards', { params }).then((r) => r.data),

  getLeaderboardBySport: (sport: string, params?: { limit?: number; offset?: number }) =>
    api
      .get<{ leaderboard: LeaderboardEntry[]; total: number; sport: string }>(
        `/leaderboards/${encodeURIComponent(sport)}`,
        { params }
      )
      .then((r) => r.data),

  ratePlayer: (gameId: string, data: { rated_user_id: string; rating: number; sportsmanship: number }) =>
    api.post(`/stats/games/${gameId}/rate`, data).then((r) => r.data),
};
