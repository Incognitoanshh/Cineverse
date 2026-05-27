# ▶️ CineVerse — Step by Step Guide

## Step 1 — Backend folder mein jao
```bash
cd cineverse/backend
```

## Step 2 — Dependencies install karo
```bash
npm install
```

## Step 3 — .env check karo (already included hai)
PostgreSQL password apna daalo agar default nahi hai:
```bash
# backend/.env file open karo aur DATABASE_URL fix karo
# Default: postgresql://postgres:postgres@localhost:5432/cineverse
```

## Step 4 — Database create karo (agar nahi hai)
```bash
createdb cineverse
```

## Step 5 — Prisma migrate karo
```bash
npx prisma migrate dev --name init
```

## Step 6 — Sample data seed karo
```bash
npm run prisma:seed
```

## Step 7 — Backend start karo
```bash
npm run dev
```
✅ Backend: http://localhost:5000

---

## Step 8 — New terminal kholo, frontend mein jao
```bash
cd cineverse/frontend
npm install
npm start
```
✅ Frontend: http://localhost:3000

---

## Login Credentials
- Admin: admin@cineverse.com / Admin@123456
- User:  demo@cineverse.com  / Demo@123456
