import api from './api';

export interface VenueListItem {
  id: string;
  name: string;
  address: string;
  city: string;
  country_code: string;
  description?: string;
  amenities?: string[];
  currency: string;
  VenueSports?: { sport_name: string; hourly_rate_cents: number }[];
  VenueImages?: { url: string; sort_order: number }[];
  rating?: { avg: string; count: number };
}

export interface VenueDetail extends VenueListItem {
  state_region?: string;
  latitude?: string | null;
  longitude?: string | null;
  VenueSchedules?: { day_of_week: number; open_time: string; close_time: string }[];
}

export interface AvailabilitySlot {
  start: string;
  end: string;
  available: boolean;
}

export interface AvailabilityResponse {
  slots: AvailabilitySlot[];
  hourly_rate_cents: number;
  currency: string;
}

export const venuesApi = {
  list: (params?: { country?: string; city?: string; sport?: string; limit?: number; offset?: number }) =>
    api.get<{ venues: VenueListItem[]; total: number }>('/venues', { params }),

  getById: (id: string) => api.get<VenueDetail>(`/venues/${id}`),

  getAvailability: (id: string, date: string, sport: string) =>
    api.get<AvailabilityResponse>(`/venues/${id}/availability`, { params: { date, sport } }),

  rate: (id: string, rating: number, comment?: string) =>
    api.post(`/venues/${id}/rate`, { rating, comment }),
};
