import { Router } from 'express';
import { prisma } from '../config/database';
import { cache } from '../config/redis';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const cached = await cache.get('genres:all');
    if (cached) return res.json(cached);

    const genres = await prisma.genre.findMany({ orderBy: { name: 'asc' } });
    const result = { success: true, data: genres };
    await cache.set('genres:all', result, 3600);
    res.json(result);
  } catch (err) { next(err); }
});

export default router;
