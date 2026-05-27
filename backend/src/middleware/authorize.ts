import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).userRole;
    if (!roles.includes(userRole)) {
      return next(new AppError('Insufficient permissions', 403));
    }
    next();
  };
};
