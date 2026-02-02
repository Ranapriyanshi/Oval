/**
 * Application-wide constants
 */

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const SUPPORTED_COUNTRIES = {
  AU: {
    name: 'Australia',
    currency: 'AUD',
    timezone: 'Australia/Sydney',
    distanceUnit: 'km',
    popularSports: ['AFL', 'Cricket', 'Rugby', 'Netball', 'Tennis'],
  },
  US: {
    name: 'United States',
    currency: 'USD',
    timezone: 'America/New_York',
    distanceUnit: 'miles',
    popularSports: ['Basketball', 'Football', 'Baseball', 'Tennis', 'Soccer'],
  },
} as const;

export const SPORTS = [
  'Football',
  'Basketball',
  'Tennis',
  'Badminton',
  'Cricket',
  'AFL',
  'Rugby',
  'Netball',
  'Baseball',
  'Soccer',
  'Volleyball',
  'Swimming',
  'Running',
  'Cycling',
] as const;

export const SKILL_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Professional',
] as const;

export const GAME_STATUS = {
  UPCOMING: 'upcoming',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;
