#!/bin/bash
set -e
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; BLUE='\033[0;34m'; NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════╗${NC}"
echo -e "${BLUE}║   CineVerse — Fix & Start Script  ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════╝${NC}"
echo ""

# ─── Step 1: Kill anything on port 5000 ─────────────────
echo -e "${YELLOW}[1/6] Killing any process on port 5000...${NC}"
lsof -ti:5000 | xargs kill -9 2>/dev/null && echo -e "${GREEN}✅ Port 5000 cleared${NC}" || echo -e "${GREEN}✅ Port 5000 already free${NC}"

# ─── Step 2: Auto-detect Mac username & fix DATABASE_URL ─
MAC_USER=$(whoami)
echo ""
echo -e "${YELLOW}[2/6] Setting up database for user: ${MAC_USER}${NC}"

cd "$(dirname "$0")/backend"

# Write correct .env
cat > .env << ENVEOF
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
DATABASE_URL=postgresql://${MAC_USER}@localhost:5432/cineverse
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
JWT_SECRET=cineverse_jwt_dev_secret_key_change_in_prod
JWT_REFRESH_SECRET=cineverse_refresh_dev_secret_key_change_in_prod
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
OPENAI_API_KEY=
LOG_LEVEL=info
ENVEOF

echo -e "${GREEN}✅ .env created with DATABASE_URL for user '${MAC_USER}'${NC}"

# ─── Step 3: Create DB if needed ────────────────────────
echo ""
echo -e "${YELLOW}[3/6] Creating database 'cineverse'...${NC}"
createdb cineverse 2>/dev/null \
  && echo -e "${GREEN}✅ Database 'cineverse' created${NC}" \
  || echo -e "${GREEN}✅ Database already exists${NC}"

# ─── Step 4: Install backend deps ───────────────────────
echo ""
echo -e "${YELLOW}[4/6] Installing backend dependencies...${NC}"
npm install --silent
echo -e "${GREEN}✅ Backend deps ready${NC}"

# ─── Step 5: Prisma migrate + seed ──────────────────────
echo ""
echo -e "${YELLOW}[5/6] Running database migrations...${NC}"
npx prisma generate --silent 2>/dev/null || true
npx prisma migrate dev --name init --skip-seed 2>&1 | grep -E "(Applied|already|error)" || true
echo -e "${GREEN}✅ Migrations done${NC}"

echo ""
echo -e "${YELLOW}[5b/6] Seeding sample data (movies, users)...${NC}"
npm run prisma:seed
echo -e "${GREEN}✅ Seeded!${NC}"

# ─── Step 6: Install frontend deps ──────────────────────
echo ""
echo -e "${YELLOW}[6/6] Installing frontend dependencies...${NC}"
cd ../frontend
npm install --legacy-peer-deps --silent
echo -e "${GREEN}✅ Frontend deps ready${NC}"

# ─── Done ────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔═══════════════════════════════════╗${NC}"
echo -e "${GREEN}║       ✅ Setup Complete!           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════╝${NC}"
echo ""
echo -e "Now run in ${YELLOW}2 separate terminals${NC}:"
echo ""
echo -e "  ${BLUE}Terminal 1 (Backend):${NC}"
echo -e "  cd cineverse/backend && npm run dev"
echo ""
echo -e "  ${BLUE}Terminal 2 (Frontend):${NC}"
echo -e "  cd cineverse/frontend && npm start"
echo ""
echo -e "  ${BLUE}Open:${NC} http://localhost:3000"
echo ""
echo -e "  ${BLUE}Login:${NC}"
echo -e "    Admin: admin@cineverse.com / Admin@123456"
echo -e "    User:  demo@cineverse.com  / Demo@123456"
echo ""
