import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

export const setupSocketHandlers = (io: Server) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
        (socket as any).userId = decoded.userId;
      } catch {}
    }
    next();
  });

  io.on('connection', (socket) => {
    const userId = (socket as any).userId;
    logger.info(`Socket connected: ${socket.id}`);

    if (userId) socket.join(`user:${userId}`);

    socket.on('join:movie', (movieId: string) => socket.join(`movie:${movieId}`));
    socket.on('leave:movie', (movieId: string) => socket.leave(`movie:${movieId}`));

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });
};

export const emitNotification = (io: Server, userId: string, notification: any) => {
  io.to(`user:${userId}`).emit('notification', notification);
};
