import api from './api';

export interface AchievementItem {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  criteria_type?: string | null;
  criteria_value?: number | null;
}

export interface MyAchievementItem extends AchievementItem {
  progress: number;
  unlocked_at?: string | null;
  unlocked: boolean;
}

export const achievementsApi = {
  list: () => api.get<{ achievements: AchievementItem[] }>('/achievements').then((r) => r.data),

  my: () => api.get<{ achievements: MyAchievementItem[] }>('/achievements/my').then((r) => r.data),

  check: () => api.post<{ message: string; awarded: string[] }>('/achievements/check').then((r) => r.data),
};
