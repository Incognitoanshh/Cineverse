import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// All admin routes require authentication and ADMIN role
router.use(authenticate, authorize('ADMIN', 'SUPER_ADMIN'));

router.get('/dashboard', async (req, res, next) => {
  try {
    const [totalUsers, totalMovies, totalTVShows, totalReviews, pendingReviews, bannedUsers] =
      await Promise.all([
        prisma.user.count({ where: { deletedAt: null } }),
        prisma.movie.count({ where: { deletedAt: null } }),
        prisma.tVShow.count({ where: { deletedAt: null } }),
        prisma.review.count({ where: { deletedAt: null } }),
        prisma.review.count({ where: { status: 'PENDING' } }),
        prisma.user.count({ where: { isBanned: true } }),
      ]);

    res.json({
      success: true,
      data: { totalUsers, totalMovies, totalTVShows, totalReviews, pendingReviews, bannedUsers },
    });
  } catch (err) { next(err); }
});

router.get('/users', async (req, res, next) => {
  try {
    const { page = '1', limit = '20', search } = req.query;
    const pageNum = parseInt(String(page));
    const limitNum = parseInt(String(limit));

    const where: any = { deletedAt: null };
    if (search) {
      where.OR = [
        { username: { contains: String(search), mode: 'insensitive' } },
        { email: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, username: true, email: true, displayName: true,
          role: true, isBanned: true, isEmailVerified: true, createdAt: true,
          _count: { select: { reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ success: true, data: users, pagination: { page: pageNum, limit: limitNum, total } });
  } catch (err) { next(err); }
});

router.patch('/users/:id/ban', async (req, res, next) => {
  try {
    const { banned, reason } = req.body;
    await prisma.user.update({
      where: { id: req.params.id },
      data: { isBanned: banned, bannedReason: reason || null },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.get('/reviews/pending', async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { status: 'PENDING', deletedAt: null },
      include: {
        user: { select: { id: true, username: true } },
        movie: { select: { title: true, slug: true } },
        tvShow: { select: { title: true, slug: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });
    res.json({ success: true, data: reviews });
  } catch (err) { next(err); }
});

router.patch('/reviews/:id/moderate', async (req, res, next) => {
  try {
    const { status } = req.body;
    await prisma.review.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
