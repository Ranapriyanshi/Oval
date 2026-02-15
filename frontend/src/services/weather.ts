import api from './api';

export interface WeatherResponse {
  temp: number;
  condition: string;
  description: string;
  city: string;
  recommendation: string;
}

export const weatherApi = {
  get: (params?: { city?: string; lat?: number; lon?: number }) =>
    api.get<WeatherResponse>('/weather', { params }).then((r) => r.data),
};
