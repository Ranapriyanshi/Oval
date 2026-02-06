<img src="https://www.nytimes.com/2020/10/06/learning/what-ideas-do-you-have-to-improve-your-favorite-sport.html" alt="" align="right" width="370">

# Oval - Community Sports App

A comprehensive community-driven sports technology app for discovering, booking, and engaging in sports activities.

## Features

- **Venue Booking**: Browse and book sports venues in real-time
- **Find Playpals**: Connect with local players (Tinder-style matching)
- **Gametime Activities**: Pre-organized curated game sessions
- **Coaching & Training**: Find verified coaches and academies
- **Skill Tracking**: Rate players, earn karma points, track fitness journey
- **Chat & Messaging**: Real-time messaging with Socket.io
- **Events & Tournaments**: Create and join events and tournaments
- **Achievements & Badges**: Unlock achievements and collect badges
- **Stats & Analytics**: Personal performance metrics and analytics
- **Weather Integration**: Weather-based game recommendations

## Tech Stack

### Frontend
- React Native (Expo)
- TypeScript
- React Navigation
- react-i18next (Internationalization)
- Expo GL (3D assets)

### Backend
- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Socket.io
- JWT Authentication

## Project Structure

```
Oval/
├── frontend/          # React Native Expo app
├── backend/           # Node.js Express API
└── assets/            # 3D assets and images
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Expo CLI

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run migrate
npm run dev
```

## Multi-Country Support

The app supports multiple countries with:
- Country-specific sports (AFL, Cricket for Australia)
- Multi-currency support (AUD, USD)
- Localized date/time formats
- Region-aware features

## Design System

The app uses a 3D illustration-driven visual system with:
- Minimal, neutral UI as canvas
- Expressive 3D visuals
- Modular, reusable 3D assets
- Playful, friendly brand personality

## License

MIT
