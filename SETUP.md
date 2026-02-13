# Oval App - Setup Guide

## Phase 1: Foundation Setup Complete ✅

This guide will help you set up and run the Oval Community Sports App.

## Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **Expo CLI** (install globally: `npm install -g expo-cli`)
- **Git** ([Download](https://git-scm.com/))

## Step 1: Database Setup

1. **Create PostgreSQL database:**
```bash
createdb oval_db
```

Or using psql:
```sql
CREATE DATABASE oval_db;
```

2. **Update backend environment variables:**
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your database credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=oval_db
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
JWT_SECRET=your-super-secret-jwt-key-change-this
```

3. **Run database migrations:**
```bash
cd backend
npm install
npm run build
npm run migrate
```

## Step 2: Backend Setup

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Start development server:**
```bash
npm run dev
```

The backend will run on `http://localhost:3000`

## Step 3: Frontend Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
```

Edit `.env` if your backend URL is different:
```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

3. **Start Expo development server:**
```bash
npm start
```

This will open Expo DevTools. You can:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

## Step 4: Verify Installation

1. **Backend Health Check:**
```bash
curl http://localhost:3000/health
```

Should return: `{"status":"ok","timestamp":"..."}`

2. **Test Registration:**
Use the app to create an account or test with:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "country": "AU"
  }'
```

## Project Structure

```
Oval/
├── frontend/              # React Native Expo app
│   ├── src/
│   │   ├── screens/      # App screens
│   │   ├── components/   # Reusable components
│   │   ├── context/      # React contexts (Auth, Locale)
│   │   ├── navigation/   # Navigation setup
│   │   ├── services/     # API services
│   │   ├── i18n/         # Internationalization
│   │   └── utils/        # Utility functions
│   └── App.tsx           # App entry point
├── backend/               # Node.js Express API
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   └── migrations/   # Database migrations
│   └── server.ts          # Server entry point
└── assets/                 # 3D assets and images
    └── 3d/                # 3D illustration assets
```

## Features Implemented (Phase 1)

✅ **Project Setup**
- React Native Expo frontend with TypeScript
- Node.js/Express backend with TypeScript
- PostgreSQL database with migrations

✅ **Internationalization**
- Multi-language support (en-AU, en-US)
- react-i18next integration
- Locale detection and switching

✅ **Authentication**
- User registration with country/region capture
- JWT-based authentication
- Protected routes

✅ **Multi-Country Support**
- Country-specific configurations
- Currency formatting (AUD, USD)
- Timezone handling
- Distance unit conversion (km/miles)

✅ **Navigation**
- React Navigation setup
- Auth flow (Login/Register)
- Main app navigation

✅ **User Profile**
- Profile management
- Country selection
- Locale preferences

✅ **3D Assets Structure**
- Directory structure for 3D assets
- ThreeDScene component setup
- Integration with Expo GL

## Phase 2: Venue & Booking System ✅

- **Backend**: Venues, venue_sports, venue_images, venue_schedules, bookings, venue_ratings (migrations + models)
- **API**: `GET/POST /api/venues`, `GET /api/venues/:id`, `GET /api/venues/:id/availability`, `POST /api/venues/:id/rate`, `GET/POST /api/bookings`, `PUT /api/bookings/:id/cancel`
- **Frontend**: Venues tab (list, filters), Venue detail (availability, book slot), My Bookings tab
- **Demo data**: Run `npm run seed` in backend to add sample venues

## Next Steps (Phase 3+)

- Playpal discovery and matching
- Game creation and joining
- Basic chat functionality
- Rating system

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running: `pg_isready`
- Check database credentials in `.env`
- Ensure database exists: `psql -l | grep oval_db`

### Port Already in Use
- Backend: Change `PORT` in `backend/.env`
- Frontend: Expo will prompt to use a different port

### Module Not Found Errors
- Run `npm install` in both frontend and backend directories
- Clear cache: `npm cache clean --force`

### Expo Issues
- Clear Expo cache: `expo start -c`
- Reset Metro bundler: `npx react-native start --reset-cache`

## Support

For issues or questions, check the main README.md or create an issue in the repository.
