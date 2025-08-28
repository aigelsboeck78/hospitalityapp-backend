# ChaletMoments Hospitality Backend

API backend for the ChaletMoments Hospitality system, serving both the web admin interface and tvOS app.

## Features

- RESTful API for property management
- Guest management with check-in/check-out
- Activity and dining recommendations
- Streaming service management
- MDM (Mobile Device Management) for Apple TV
- WebSocket support for real-time updates
- PostgreSQL database with migrations
- Image upload and processing

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Socket.IO
- JWT Authentication
- Sharp for image processing

## Environment Variables

Create a `.env` file:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname
# Or individual variables
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vacation_rental_hospitality
DB_USER=postgres
DB_PASSWORD=password

# Server
NODE_ENV=production
PORT=3001

# Authentication
JWT_SECRET=your-secret-key
REFRESH_TOKEN_SECRET=your-refresh-secret

# CORS
CORS_ORIGIN=https://hospitalityapp.chaletmoments.com
ALLOWED_ORIGINS=https://hospitalityapp.chaletmoments.com,https://chaletmoments.com

# Optional Services
OPENAI_API_KEY=your-openai-key
```

## Development

```bash
npm install
npm run dev
```

## Production

```bash
npm start
```

## Database Setup

```bash
# Initialize database
npm run db:init

# Run migrations
npm run db:migrate

# Seed data (optional)
npm run db:seed
```

## Deployment

Deployed on Vercel with serverless functions.