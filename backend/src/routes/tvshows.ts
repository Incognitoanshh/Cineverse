import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { cache } from '../config/redis';
import { AppError } from '../utils/AppError';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { page = '1', limit = '20', sort = 'popularity' } = req.query;
    const pageNum = parseInt(String(page));
    const limitNum = Math.min(parseInt(String(limit)), 100);

    const orderBy: any = {
      popularity: { popularity: 'desc' },
      rating: { voteAverage: 'desc' },
      newest: { firstAirDate: 'desc' },
    }[String(sort)] || { popularity: 'desc' };

    const [shows, total] = await Promise.all([
      prisma.tVShow.findMany({
        where: { deletedAt: null, isPublished: true },
        orderBy,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        select: {
          id: true, title: true, slug: true, posterUrl: true, backdropUrl: true,
          firstAirDate: true, voteAverage: true, overview: true, numberOfSeasons: true,
          genres: { select: { genre: { select: { name: true, slug: true } } } },
        },
      }),
      prisma.tVShow.count({ where: { deletedAt: null, isPublished: true } }),
    ]);

    res.json({
      success: true, data: shows,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) { next(err); }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const show = await prisma.tVShow.findUnique({
      where: { slug: req.params.slug },
      include: {
        genres: { include: { genre: true } },
        seasons: { include: { episodes: { orderBy: { episodeNumber: 'asc' } } }, orderBy: { seasonNumber: 'asc' } },
        cast: { include: { celebrity: true }, orderBy: { order: 'asc' }, take: 20 },
        streamingLinks: true,
        _count: { select: { reviews: true } },
      },
    });
    if (!show) throw new AppError('TV Show not found', 404);
    res.json({ success: true, data: show });
  } catch (err) { next(err); }
});

export default router;
