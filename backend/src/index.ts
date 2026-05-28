import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { Server as SocketIO } from 'socket.io';
import dotenv from 'dotenv';

import { prisma } from './config/database';
import { redisClient, connectRedis } from './config/redis';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { setupSocketHandlers } from './services/socketService';

// Routes
import authRoutes from './routes/auth';
import movieRoutes from './routes/movies'; 
import tvShowRoutes from './routes/tvshows';
import celebrityRoutes from './routes/celebrities';
import reviewRoutes from './routes/reviews';
import userRoutes from './routes/users';
import searchRoutes from './routes/search';
import adminRoutes from './routes/admin';
import genreRoutes from './routes/genres';
import notificationRoutes from './routes/notifications';
import recommendationRoutes from './routes/recommendations';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIO(server, {
  cors: {
    origin: [
      'https://cineverse-sooty-phi.vercel.app',
      'http://localhost:5173',
      'http://localhost:3000'
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ─── MIDDLEWARE ───────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));

app.use(cors({
  origin: [
    'https://cineverse-sooty-phi.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(rateLimiter);

// ─── HEALTH CHECK ────────────────────────────────────────
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const redisStatus = redisClient.status;
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: redisStatus === 'ready' ? 'connected' : 'disconnected',
      },
    });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: String(error) });
  }
});

// ─── API ROUTES ──────────────────────────────────────────
const API_V1 = '/api/v1';

app.use(`${API_V1}/auth`, authRoutes);
app.use(`${API_V1}/movies`, movieRoutes);
app.use(`${API_V1}/tv`, tvShowRoutes);
app.use(`${API_V1}/celebrities`, celebrityRoutes);
app.use(`${API_V1}/reviews`, reviewRoutes);
app.use(`${API_V1}/users`, userRoutes);
app.use(`${API_V1}/search`, searchRoutes);
app.use(`${API_V1}/admin`, adminRoutes);
app.use(`${API_V1}/genres`, genreRoutes);
app.use(`${API_V1}/notifications`, notificationRoutes);
app.use(`${API_V1}/recommendations`, recommendationRoutes);

// ─── SOCKET SETUP ────────────────────────────────────────
setupSocketHandlers(io);

// ─── ERROR HANDLER ───────────────────────────────────────
app.use(errorHandler);

// ─── START SERVER ────────────────────────────────────────
const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  logger.info(`🚀 CineVerse API running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV}`);

  try {
    await prisma.$connect();
    logger.info('✅ PostgreSQL connected via Prisma');
  } catch (err) {
    logger.error('❌ Database connection failed:', err);
    process.exit(1);
  }

  // Redis is optional — app works fine without it
  await connectRedis();
});

// ─── GRACEFUL SHUTDOWN ───────────────────────────────────
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  try { redisClient.disconnect(); } catch {}
  server.close(() => process.exit(0));
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

export { io };
