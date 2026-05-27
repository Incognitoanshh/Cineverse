import { Router } from 'express';
import { prisma } from '../config/database';
import { cache } from '../config/redis';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { q, type = 'all', page = '1', limit = '20' } = req.query;
    if (!q || String(q).trim().length < 2) {
      return res.json({ success: true, data: { movies: [], tvShows: [], celebrities: [] } });
    }

    const query = String(q).trim();
    const pageNum = parseInt(String(page));
    const limitNum = parseInt(String(limit));
    const skip = (pageNum - 1) * limitNum;
    const cacheKey = `search:${query}:${type}:${page}:${limit}`;

    const cached = await cache.get(cacheKey);
    if (cached) return res.json(cached);

    const contains = { contains: query, mode: 'insensitive' as const };

    const [movies, tvShows, celebrities] = await Promise.all([
      type === 'all' || type === 'movie'
        ? prisma.movie.findMany({
            where: { deletedAt: null, isPublished: true, OR: [{ title: contains }, { overview: contains }] },
            select: { id: true, title: true, slug: true, posterUrl: true, releaseDate: true, voteAverage: true },
            take: limitNum, skip,
          })
        : [],
      type === 'all' || type === 'tv'
        ? prisma.tVShow.findMany({
            where: { deletedAt: null, isPublished: true, OR: [{ title: contains }, { overview: contains }] },
            select: { id: true, title: true, slug: true, posterUrl: true, firstAirDate: true, voteAverage: true },
            take: limitNum, skip,
          })
        : [],
      type === 'all' || type === 'celebrity'
        ? prisma.celebrity.findMany({
            where: { deletedAt: null, name: contains },
            select: { id: true, name: true, slug: true, profileUrl: true, knownForDept: true },
            take: limitNum, skip,
          })
        : [],
    ]);

    const result = { success: true, data: { movies, tvShows, celebrities } };
    await cache.set(cacheKey, result, 60);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/suggestions', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || String(q).trim().length < 2) return res.json({ success: true, data: [] });

    const query = String(q).trim();
    const contains = { contains: query, mode: 'insensitive' as const };

    const [movies, tvShows, celebrities] = await Promise.all([
      prisma.movie.findMany({
        where: { deletedAt: null, isPublished: true, title: contains },
        select: { title: true, slug: true, posterUrl: true, releaseDate: true },
        take: 5,
      }),
      prisma.tVShow.findMany({
        where: { deletedAt: null, isPublished: true, title: contains },
        select: { title: true, slug: true, posterUrl: true },
        take: 3,
      }),
      prisma.celebrity.findMany({
        where: { deletedAt: null, name: contains },
        select: { name: true, slug: true, profileUrl: true },
        take: 3,
      }),
    ]);

    const suggestions = [
      ...movies.map((m) => ({ type: 'movie', ...m })),
      ...tvShows.map((t) => ({ type: 'tv', ...t })),
      ...celebrities.map((c) => ({ type: 'celebrity', ...c })),
    ];

    res.json({ success: true, data: suggestions });
  } catch (err) {
    next(err);
  }
});

export default router;
