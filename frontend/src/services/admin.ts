import api from './api';

export interface AdminStats {
  users: number;
  venues: number;
  events: number;
  bookings: number;
  gametimes: number;
}

export const adminApi = {
  stats: () => api.get<AdminStats>('/admin/stats').then((r) => r.data),
  users: (params?: { limit?: number; offset?: number }) =>
    api.get<{ users: any[]; total: number }>('/admin/users', { params }).then((r) => r.data),
};
