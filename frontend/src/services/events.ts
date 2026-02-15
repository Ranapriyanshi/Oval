import api from './api';

export interface EventItem {
  id: string;
  organizer_id: string;
  title: string;
  sport_name: string;
  event_type: 'tournament' | 'meetup' | 'league';
  description?: string | null;
  venue_id?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  start_time: string;
  end_time: string;
  max_participants: number;
  registration_deadline?: string | null;
  status: string;
  bracket_type?: string | null;
  Organizer?: { id: string; name: string; city?: string };
  registered_count?: number;
  is_registered?: boolean;
  Registrations?: any[];
}

export const eventsApi = {
  list: (params?: { sport?: string; event_type?: string; status?: string; limit?: number; offset?: number }) =>
    api.get<{ events: EventItem[]; total: number }>('/events', { params }).then((r) => r.data),

  myEvents: () => api.get<{ events: EventItem[] }>('/events/my/events').then((r) => r.data),

  getById: (id: string) => api.get<EventItem>(`/events/${id}`).then((r) => r.data),

  create: (data: {
    title: string;
    sport_name: string;
    event_type: 'tournament' | 'meetup' | 'league';
    description?: string;
    venue_id?: string;
    address?: string;
    city?: string;
    country?: string;
    start_time: string;
    end_time: string;
    max_participants?: number;
    registration_deadline?: string;
  }) => api.post<EventItem>('/events', data).then((r) => r.data),

  register: (id: string) => api.post(`/events/${id}/register`).then((r) => r.data),

  unregister: (id: string) => api.post(`/events/${id}/unregister`).then((r) => r.data),
};
