import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: (req as any).userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: notifications });
  } catch (err) { next(err); }
});

router.patch('/:id/read', authenticate, async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: (req as any).userId },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.patch('/read-all', authenticate, async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: (req as any).userId },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
