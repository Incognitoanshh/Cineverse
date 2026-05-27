import Redis from 'ioredis';
import { logger } from '../utils/logger';

let redisAvailable = false;

export const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    if (times > 3) {
      // Stop retrying — app works fine without Redis
      return null;
    }
    return Math.min(times * 500, 2000);
  },
  lazyConnect: true,
  enableOfflineQueue: false,
});

redisClient.on('connect', () => {
  redisAvailable = true;
  logger.info('Redis connected');
});

redisClient.on('error', (err) => {
  redisAvailable = false;
  // Only log once — don't flood the console
  if (err.message.includes('ECONNREFUSED')) {
    logger.warn('Redis unavailable — caching disabled (app works without it)');
  }
});

redisClient.on('close', () => {
  redisAvailable = false;
});

// Gracefully attempt connection — don't throw if Redis is down
export const connectRedis = async () => {
  try {
    await redisClient.connect();
    redisAvailable = true;
  } catch {
    redisAvailable = false;
    logger.warn('Redis not reachable — running without cache');
  }
};

// Cache helpers — all silently no-op when Redis is down
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    if (!redisAvailable) return null;
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    if (!redisAvailable) return;
    try {
      await redisClient.setex(key, ttlSeconds, JSON.stringify(value));
    } catch {}
  },

  async del(key: string): Promise<void> {
    if (!redisAvailable) return;
    try {
      await redisClient.del(key);
    } catch {}
  },

  async flush(pattern: string): Promise<void> {
    if (!redisAvailable) return;
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) await redisClient.del(...keys);
    } catch {}
  },
};
