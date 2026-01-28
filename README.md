# Pastebin-Lite

A lightweight pastebin service with Redis persistence. Create, share, and manage text snippets with optional expiration and view limits.

![React](https://img.shields.io/badge/React-19-blue)
![Express](https://img.shields.io/badge/Express-4.x-green)
![Redis](https://img.shields.io/badge/Redis-Cloud-red)

## Features

- 📝 **Create Pastes** - Share text content instantly
- ⏰ **Auto-Expiration** - Set TTL from 5 minutes to 30 days
- 👁️ **View Limits** - Burn after reading or limit views
- 🚀 **Fast** - Redis-powered for speed
- 🎨 **Modern UI** - Clean, responsive React frontend

## Tech Stack

| Frontend | Backend |
|----------|---------|
| React 19 | Express.js |
| Vite | Redis (ioredis) |
| Vanilla CSS | Node.js 18+ |

## Quick Start

### Prerequisites
- Node.js 18+
- Redis instance (local or [Redis Cloud](https://redis.com/cloud/))

### Backend
```bash
cd backend
npm install
cp .env.example .env  # Edit with your Redis URL
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/healthz` | Health check |
| POST | `/api/pastes` | Create paste |
| GET | `/api/pastes/:id` | Get paste |

### Create Paste
```bash
curl -X POST http://localhost:3000/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello World!", "ttl_seconds": 3600, "max_views": 10}'
```

## Deployment

- **Frontend**: [Vercel](https://vercel.com) - Set `VITE_API_URL` to backend URL
- **Backend**: [Render](https://render.com) - Set `REDIS_URL` to Redis Cloud URL

## Environment Variables

### Backend (`.env`)
```
REDIS_URL=redis://your-redis-url
PORT=3000
```

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend.onrender.com
```

## License

MIT
