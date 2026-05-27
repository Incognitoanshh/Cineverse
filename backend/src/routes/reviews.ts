import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/authenticate';
import { AppError } from '../utils/AppError';

const router = Router();

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { movieId, tvShowId, title, content, rating, containsSpoiler } = req.body;
    const userId = (req as any).userId;

    const review = await prisma.review.create({
      data: { userId, movieId, tvShowId, title, content, rating, containsSpoiler: containsSpoiler || false },
      include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) { next(err); }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!review) throw new AppError('Review not found', 404);
    if (review.userId !== (req as any).userId) throw new AppError('Unauthorized', 403);

    const updated = await prisma.review.update({
      where: { id: req.params.id },
      data: { title: req.body.title, content: req.body.content, rating: req.body.rating },
    });

    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!review) throw new AppError('Review not found', 404);
    if (review.userId !== (req as any).userId && (req as any).userRole !== 'ADMIN') {
      throw new AppError('Unauthorized', 403);
    }
    await prisma.review.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.post('/:id/like', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).userId;
    const existing = await prisma.like.findFirst({ where: { userId, reviewId: req.params.id } });
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      res.json({ success: true, liked: false });
    } else {
      await prisma.like.create({ data: { userId, reviewId: req.params.id } });
      res.json({ success: true, liked: true });
    }
  } catch (err) { next(err); }
});

router.post('/:id/comments', authenticate, async (req, res, next) => {
  try {
    const comment = await prisma.comment.create({
      data: { userId: (req as any).userId, reviewId: req.params.id, content: req.body.content },
      include: { user: { select: { id: true, username: true, avatarUrl: true } } },
    });
    res.status(201).json({ success: true, data: comment });
  } catch (err) { next(err); }
});

export default router;
