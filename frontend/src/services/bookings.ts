import api from './api';

export interface BookingItem {
  id: string;
  venue_id: string;
  user_id: string;
  sport_name: string;
  start_time: string;
  end_time: string;
  total_cents: number;
  currency: string;
  status: string;
  created_at: string;
  Venue?: {
    id: string;
    name: string;
    address: string;
    city: string;
    country_code?: string;
    currency: string;
  };
}

export const bookingsApi = {
  list: (params?: { status?: string; upcoming?: boolean }) =>
    api.get<{ bookings: BookingItem[] }>('/bookings', { params }),

  create: (data: { venue_id: string; sport_name: string; start_time: string; end_time: string }) =>
    api.post<BookingItem>('/bookings', data),

  cancel: (id: string) => api.put(`/bookings/${id}/cancel`),
};
