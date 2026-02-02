/**
 * TypeScript type definitions
 */

export interface User {
  id: string;
  email: string;
  name: string;
  country: string;
  timezone: string;
  currency: string;
  sportsPreferences?: string[];
  karmaPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  sportTypes: string[];
  amenities: string[];
  pricePerHour: number;
  currency: string;
  rating: number;
  totalReviews: number;
  images?: string[];
}

export interface Booking {
  id: string;
  userId: string;
  venueId: string;
  sportType: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

export interface Game {
  id: string;
  creatorId: string;
  sportType: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  dateTime: string;
  skillLevel: string;
  maxPlayers: number;
  currentPlayers: number;
  players: string[];
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  createdAt: string;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}
