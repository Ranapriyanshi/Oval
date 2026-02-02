# Backend Setup Guide

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=oval_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key
```

3. **Create database:**
```bash
createdb oval_db
```

Or using psql:
```sql
CREATE DATABASE oval_db;
```

4. **Run migrations:**
```bash
npm run migrate
```

5. **Start development server:**
```bash
npm run dev
```

## Database Migrations with Sequelize

### Create a new migration:
```bash
npm run migrate:generate -- --name <migration-name>
```

Example:
```bash
npm run migrate:generate -- --name add-venues-table
```

This creates a migration file in `src/migrations/` with timestamp prefix.

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

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.js  # Sequelize CLI config
│   │   ├── sequelize.ts # Sequelize instance
│   │   └── config.ts    # App config
│   ├── models/          # Sequelize models
│   │   ├── User.ts
│   │   └── index.ts
│   ├── migrations/      # Sequelize migrations
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   └── server.ts        # Server entry point
└── scripts/             # (reserved for future utility scripts)
```

## Using Sequelize Models

```typescript
import User from './models/User';

// Create user
const user = await User.create({
  email: 'user@example.com',
  password: 'password123', // Will be hashed automatically
  name: 'John Doe',
  country: 'AU',
});

// Find user
const user = await User.findOne({ where: { email: 'user@example.com' } });

// Update user
await user.update({ name: 'Jane Doe' });

// Verify password
const isValid = await user.verifyPassword('password123');
```

## Troubleshooting

### Migration errors
- Ensure database exists and credentials are correct
- Check `.env` file has correct values
- Verify PostgreSQL is running

### Sequelize connection errors
- Check database credentials in `.env`
- Ensure PostgreSQL is running: `pg_isready`
- Verify database exists: `psql -l | grep oval_db`
