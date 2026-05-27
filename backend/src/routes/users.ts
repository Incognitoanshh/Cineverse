import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/authenticate';
import { AppError } from '../utils/AppError';
import bcrypt from 'bcryptjs';

const router = Router();

router.get('/:username', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
      select: {
        id: true, username: true, displayName: true, bio: true,
        avatarUrl: true, coverUrl: true, createdAt: true,
        _count: { select: { reviews: true, followers: true, following: true } },
      },
    });
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

router.put('/me', authenticate, async (req, res, next) => {
  try {
    const { displayName, bio, avatarUrl, coverUrl } = req.body;
    const user = await prisma.user.update({
      where: { id: (req as any).userId },
      data: { displayName, bio, avatarUrl, coverUrl },
      select: { id: true, username: true, email: true, displayName: true, bio: true, avatarUrl: true, coverUrl: true },
    });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

router.put('/me/password', authenticate, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: (req as any).userId } });
    if (!user?.passwordHash) throw new AppError('No password set', 400);

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) throw new AppError('Current password is incorrect', 401);

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    res.json({ success: true, message: 'Password updated' });
  } catch (err) { next(err); }
});

router.get('/me/watchlist', authenticate, async (req, res, next) => {
  try {
    const watchlists = await prisma.watchlist.findMany({
      where: { userId: (req as any).userId },
      include: {
        items: {
          include: {
            movie: { select: { id: true, title: true, slug: true, posterUrl: true, voteAverage: true } },
            tvShow: { select: { id: true, title: true, slug: true, posterUrl: true, voteAverage: true } },
          },
        },
      },
    });
    res.json({ success: true, data: watchlists });
  } catch (err) { next(err); }
});

router.get('/me/favorites', authenticate, async (req, res, next) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: (req as any).userId },
      include: {
        movie: { select: { id: true, title: true, slug: true, posterUrl: true, voteAverage: true } },
        tvShow: { select: { id: true, title: true, slug: true, posterUrl: true, voteAverage: true } },
      },
    });
    res.json({ success: true, data: favorites });
  } catch (err) { next(err); }
});

router.get('/me/reviews', authenticate, async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { userId: (req as any).userId, deletedAt: null },
      include: {
        movie: { select: { title: true, slug: true, posterUrl: true } },
        tvShow: { select: { title: true, slug: true, posterUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: reviews });
  } catch (err) { next(err); }
});

export default router;
