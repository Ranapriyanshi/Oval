# Oval Backend

Backend API for the Oval Community Sports App.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up PostgreSQL database and create `.env` file (see `.env.example`)

3. Run migrations:
```bash
npm run migrate
```

4. Start development server:
```bash
npm run dev
```

## Database Migrations

### Create a new migration:
```bash
npm run migrate:create <migration-name>
```

Example:
```bash
npm run migrate:create add-venues-table
```

### Run migrations:
```bash
npm run migrate
```

### Rollback last migration:
```bash
npm run migrate:undo
```

### Rollback all migrations:
```bash
npm run migrate:undo:all
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## Database Schema

The database includes:
- `users` - User accounts with country, timezone, currency
- `countries` - Supported countries configuration
- `sports_by_region` - Region-specific sports availability

## Tech Stack

- **Framework**: Express.js
- **ORM**: Sequelize
- **Database**: PostgreSQL
- **Language**: TypeScript
- **Authentication**: JWT
