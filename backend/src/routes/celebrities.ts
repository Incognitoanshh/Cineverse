import { Router } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(String(page));
    const limitNum = parseInt(String(limit));

    const [celebrities, total] = await Promise.all([
      prisma.celebrity.findMany({
        where: { deletedAt: null, isPublished: true },
        orderBy: { popularity: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        select: { id: true, name: true, slug: true, profileUrl: true, knownForDept: true, popularity: true },
      }),
      prisma.celebrity.count({ where: { deletedAt: null, isPublished: true } }),
    ]);

    res.json({ success: true, data: celebrities, pagination: { page: pageNum, limit: limitNum, total } });
  } catch (err) { next(err); }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const celebrity = await prisma.celebrity.findUnique({
      where: { slug: req.params.slug },
      include: {
        movieCast: {
          include: { movie: { select: { id: true, title: true, slug: true, posterUrl: true, releaseDate: true } } },
          take: 20,
        },
        movieCrew: {
          include: { movie: { select: { id: true, title: true, slug: true, posterUrl: true, releaseDate: true } } },
          take: 10,
        },
        awards: true,
      },
    });
    if (!celebrity) throw new AppError('Celebrity not found', 404);
    res.json({ success: true, data: celebrity });
  } catch (err) { next(err); }
});

export default router;
