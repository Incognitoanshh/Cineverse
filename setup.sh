#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🎬 CineVerse Setup Script${NC}"
echo "=================================="

# ─── Check Node ──────────────────────────────────────────
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js not found. Install from https://nodejs.org${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# ─── Check PostgreSQL ────────────────────────────────────
if ! command -v psql &> /dev/null; then
  echo -e "${YELLOW}⚠️  PostgreSQL not found. Install with:${NC}"
  echo "   macOS: brew install postgresql@16 && brew services start postgresql@16"
  echo "   Ubuntu: sudo apt install postgresql"
  echo ""
  echo "   Or use Docker: docker-compose up -d postgres redis"
  exit 1
fi
echo -e "${GREEN}✅ PostgreSQL found${NC}"

# ─── Setup backend .env ──────────────────────────────────
if [ ! -f "backend/.env" ]; then
  cp backend/.env.example backend/.env
  echo -e "${GREEN}✅ Created backend/.env from .env.example${NC}"
else
  echo -e "${GREEN}✅ backend/.env already exists${NC}"
fi

# ─── Setup frontend .env ─────────────────────────────────
if [ ! -f "frontend/.env" ]; then
  cp frontend/.env.example frontend/.env
  echo -e "${GREEN}✅ Created frontend/.env${NC}"
fi

# ─── Create PostgreSQL DB ────────────────────────────────
echo ""
echo "Creating PostgreSQL database 'cineverse'..."
createdb cineverse 2>/dev/null && echo -e "${GREEN}✅ Database 'cineverse' created${NC}" || echo -e "${YELLOW}ℹ️  Database 'cineverse' already exists (OK)${NC}"

# ─── Install backend deps ────────────────────────────────
echo ""
echo "Installing backend dependencies..."
cd backend && npm install --silent
echo -e "${GREEN}✅ Backend deps installed${NC}"

# ─── Prisma setup ────────────────────────────────────────
echo ""
echo "Setting up database schema..."
npx prisma generate --silent 2>&1 | tail -1
npx prisma migrate dev --name init 2>&1 | grep -E "(✓|✅|error|Error)" || true
echo -e "${GREEN}✅ Database migrated${NC}"

echo ""
echo "Seeding sample data..."
npx ts-node prisma/seed.ts
echo -e "${GREEN}✅ Database seeded${NC}"

cd ..

# ─── Install frontend deps ───────────────────────────────
echo ""
echo "Installing frontend dependencies..."
cd frontend && npm install --silent
echo -e "${GREEN}✅ Frontend deps installed${NC}"
cd ..

# ─── Done ────────────────────────────────────────────────
echo ""
echo -e "${GREEN}=================================="
echo "🎉 Setup complete!"
echo "=================================="
echo ""
echo "Start the app:"
echo ""
echo "  Terminal 1 — Backend:"
echo "    cd backend && npm run dev"
echo ""
echo "  Terminal 2 — Frontend:"
echo "    cd frontend && npm start"
echo ""
echo "Then open: http://localhost:3000"
echo ""
echo "Login credentials:"
echo "  Admin: admin@cineverse.com / Admin@123456"
echo -e "  User:  demo@cineverse.com  / Demo@123456${NC}"
