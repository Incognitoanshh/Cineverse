# 🎬 CineVerse — IMDb-style Movie & TV Database Platform

A full-stack, production-ready movie discovery platform built with React, TypeScript, Node.js, Express, and Prisma.

---

## 🗂️ Project Structure

```
cineverse/
├── frontend/               # React 18 + TypeScript + Tailwind CSS
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── auth/       # ProtectedRoute, AdminRoute
│       │   ├── layout/     # Navbar, Footer, Layout
│       │   └── ui/         # MovieCard, StarRating, Badge, Skeleton...
│       ├── lib/            # Axios API client
│       ├── pages/          # All page components
│       ├── store/          # Zustand auth store
│       ├── styles/         # Global CSS + Tailwind
│       └── types/          # TypeScript interfaces
│
├── backend/                # Node.js + Express + TypeScript
│   ├── prisma/
│   │   ├── schema.prisma   # Full database schema
│   │   └── seed.ts         # Sample data seeder
│   └── src/
│       ├── config/         # DB + Redis config
│       ├── controllers/    # Business logic
│       ├── middleware/     # Auth, validate, error, rate-limit
│       ├── routes/         # All API routes
│       ├── services/       # Email, Socket.io
│       └── utils/          # Logger, AppError
│
├── nginx/                  # Reverse proxy config
├── docker-compose.yml      # Full stack with Docker
└── .github/workflows/      # CI/CD pipeline
```

---

## ⚡ Tech Stack

| Layer       | Technology                              |
|-------------|-----------------------------------------|
| Frontend    | React 18, TypeScript, Tailwind CSS      |
| State       | Zustand, TanStack Query                 |
| Animations  | Framer Motion                           |
| Backend     | Node.js, Express.js, TypeScript         |
| Database    | PostgreSQL + Prisma ORM                 |
| Cache       | Redis (ioredis)                         |
| Real-time   | Socket.io                               |
| Auth        | JWT, Refresh tokens, OAuth (Google/GitHub) |
| AI          | OpenAI GPT (recommendations)           |
| DevOps      | Docker, Nginx, GitHub Actions CI/CD     |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Redis 7+

### 1. Clone & install

```bash
git clone https://github.com/yourname/cineverse.git
cd cineverse

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### 2. Configure environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your DB/Redis credentials

# Frontend
cp frontend/.env.example frontend/.env
```

### 3. Setup database

```bash
cd backend

# Run migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Seed sample data
npm run prisma:seed
```

### 4. Start development servers

```bash
# Backend (port 5000)
cd backend && npm run dev

# Frontend (port 3000)
cd frontend && npm start
```

Open **http://localhost:3000**

---

## 🐳 Docker Compose (One command)

```bash
# Copy env file
cp backend/.env.example backend/.env

# Start everything
docker-compose up -d

# Run migrations + seed
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run prisma:seed
```

---

## 🔑 Default Credentials (after seeding)

| Role  | Email                  | Password      |
|-------|------------------------|---------------|
| Admin | admin@cineverse.com    | Admin@123456  |
| User  | demo@cineverse.com     | Demo@123456   |

---

## 📡 API Reference

All endpoints are prefixed with `/api/v1`

### Auth
| Method | Endpoint                    | Description            |
|--------|-----------------------------|------------------------|
| POST   | `/auth/register`            | Register new user      |
| POST   | `/auth/login`               | Login                  |
| POST   | `/auth/logout`              | Logout                 |
| POST   | `/auth/refresh-token`       | Refresh access token   |
| POST   | `/auth/forgot-password`     | Send reset email       |
| POST   | `/auth/reset-password`      | Reset password         |
| GET    | `/auth/me`                  | Get current user       |
| GET    | `/auth/google`              | Google OAuth           |
| GET    | `/auth/github`              | GitHub OAuth           |

### Movies
| Method | Endpoint                    | Description             |
|--------|-----------------------------|-------------------------|
| GET    | `/movies`                   | List movies (paginated) |
| GET    | `/movies/trending`          | Trending movies         |
| GET    | `/movies/top-rated`         | Top rated               |
| GET    | `/movies/upcoming`          | Upcoming releases       |
| GET    | `/movies/:slug`             | Movie details           |
| GET    | `/movies/:slug/reviews`     | Movie reviews           |
| GET    | `/movies/:slug/similar`     | Similar movies          |
| POST   | `/movies/:slug/rate`        | Rate movie (auth)       |
| POST   | `/movies/:slug/watchlist`   | Add to watchlist (auth) |
| POST   | `/movies/:slug/favorite`    | Toggle favorite (auth)  |

### TV Shows
| Method | Endpoint     | Description      |
|--------|--------------|------------------|
| GET    | `/tv`        | List TV shows    |
| GET    | `/tv/:slug`  | TV show details  |

### Celebrities
| Method | Endpoint               | Description         |
|--------|------------------------|---------------------|
| GET    | `/celebrities`         | List celebrities    |
| GET    | `/celebrities/:slug`   | Celebrity details   |

### Search
| Method | Endpoint               | Description         |
|--------|------------------------|---------------------|
| GET    | `/search?q=`           | Full search         |
| GET    | `/search/suggestions`  | Live suggestions    |

### Admin (requires ADMIN role)
| Method | Endpoint                        | Description           |
|--------|---------------------------------|-----------------------|
| GET    | `/admin/dashboard`              | Platform stats        |
| GET    | `/admin/users`                  | List all users        |
| PATCH  | `/admin/users/:id/ban`          | Ban/unban user        |
| GET    | `/admin/reviews/pending`        | Pending reviews       |
| PATCH  | `/admin/reviews/:id/moderate`   | Approve/reject review |

---

## 🗃️ Database Schema

The Prisma schema includes:

- **User** — auth, profiles, sessions, OAuth
- **Movie** — full metadata, ratings, streaming links
- **TVShow** — seasons, episodes
- **Celebrity** — actor/director profiles
- **Review** — with moderation status
- **Rating** — per user per movie/show
- **Watchlist** / **Favorite** — user collections
- **Notification** — real-time events
- **Award** — for movies/shows/celebrities
- **Genre**, **Studio**, **Keyword** — taxonomy
- **AuditLog** — admin tracking
- **Badge** / **UserBadge** — gamification

---

## 🔒 Security

- Helmet.js headers
- CORS configured per environment
- JWT access tokens (15min) + HttpOnly refresh tokens (30d)
- Rate limiting (500 req/15min global, 10/15min auth)
- Zod input validation
- Soft deletes (no hard data loss)
- Role-based access control (USER / MODERATOR / ADMIN / SUPER_ADMIN)

---

## 📁 Pages

| Route                  | Page                  | Auth Required |
|------------------------|-----------------------|---------------|
| `/`                    | Home (Hero + Trending)| No            |
| `/movies`              | Browse movies         | No            |
| `/movies/:slug`        | Movie detail          | No            |
| `/tv`                  | Browse TV shows       | No            |
| `/tv/:slug`            | TV show detail        | No            |
| `/celebrities`         | Celebrity list        | No            |
| `/celebrities/:slug`   | Celebrity profile     | No            |
| `/search`              | Search results        | No            |
| `/login`               | Login                 | No            |
| `/register`            | Register              | No            |
| `/forgot-password`     | Password reset        | No            |
| `/dashboard`           | User dashboard        | ✅ Yes        |
| `/watchlist`           | My watchlist          | ✅ Yes        |
| `/profile/:username`   | Public profile        | No            |
| `/admin`               | Admin panel           | ✅ Admin only |

---

## 🤖 AI Features

Set `OPENAI_API_KEY` in backend `.env` to enable:

- **Personalized Recommendations** — based on your favorites and ratings
- **Similar Movie Suggestions** — genre-based with AI ranking

---

## 📦 Environment Variables

### Backend
```env
PORT=5000
DATABASE_URL=postgresql://user:pass@localhost:5432/cineverse
REDIS_HOST=localhost
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
SMTP_HOST=smtp.gmail.com
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
OPENAI_API_KEY=sk-...
GOOGLE_CLIENT_ID=...
GITHUB_CLIENT_ID=...
FRONTEND_URL=http://localhost:3000
```

### Frontend
```env
REACT_APP_API_URL=http://localhost:5000/api/v1
```

---

## 📄 License

MIT © CineVerse 2025
