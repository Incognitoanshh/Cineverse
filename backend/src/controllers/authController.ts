import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/database';
import { cache } from '../config/redis';
import { AppError } from '../utils/AppError';
import { sendEmail } from '../services/emailService';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret';
const JWT_EXPIRES_IN = '15m';
const JWT_REFRESH_EXPIRES_IN = '30d';

const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password, displayName } = req.body;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existing) {
      throw new AppError(existing.email === email ? 'Email already registered' : 'Username taken', 400);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const verifyToken = uuidv4();

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        displayName: displayName || username,
        resetToken: verifyToken,
        resetTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      select: { id: true, username: true, email: true, displayName: true, role: true },
    });

    // await sendEmail({
    //   to: email,
    //   subject: 'Verify your CineVerse account',
    //   html: `<h1>Welcome to CineVerse!</h1><p>Click <a href="${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}">here</a> to verify.</p>`,
    // });

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    await prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        device: req.headers['user-agent'] || 'Unknown',
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ success: true, data: { user, accessToken } });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true, username: true, email: true, displayName: true,
        passwordHash: true, role: true, isActive: true, isBanned: true,
        avatarUrl: true, isEmailVerified: true,
      },
    });

    if (!user || !user.passwordHash) throw new AppError('Invalid credentials', 401);
    if (user.isBanned) throw new AppError('Account suspended', 403);
    if (!user.isActive) throw new AppError('Account deactivated', 403);

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new AppError('Invalid credentials', 401);

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    await prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        device: req.headers['user-agent'] || 'Unknown',
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
 
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const { passwordHash: _, ...safeUser } = user;
    res.json({ success: true, data: { user: safeUser, accessToken } });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await prisma.session.deleteMany({ where: { token: refreshToken } });
    }
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) throw new AppError('No refresh token', 401);

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: { select: { id: true, role: true, isActive: true, isBanned: true } } },
    });

    if (!session || session.expiresAt < new Date()) {
      res.clearCookie('refreshToken');
      throw new AppError('Session expired', 401);
    }

    if (!session.user.isActive || session.user.isBanned) {
      throw new AppError('Account suspended', 403);
    }

    jwt.verify(token, JWT_REFRESH_SECRET);

    const { accessToken } = generateTokens(session.user.id, session.user.role);
    res.json({ success: true, data: { accessToken } });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const resetToken = uuidv4();
      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000) },
      });
      await sendEmail({
        to: email,
        subject: 'Reset your CineVerse password',
        html: `<p>Click <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}">here</a> to reset your password. Link expires in 1 hour.</p>`,
      });
    }

    res.json({ success: true, message: 'If email exists, reset link has been sent' });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;
    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
    });

    if (!user) throw new AppError('Invalid or expired reset token', 400);

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExpiry: null },
    });

    await prisma.session.deleteMany({ where: { userId: user.id } });
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
    });

    if (!user) throw new AppError('Invalid or expired token', 400);

    await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true, resetToken: null, resetTokenExpiry: null },
    });

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    next(err);
  }
};

export const sendOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { otpCode: otp, otpExpiry },
    });

    await sendEmail({
      to: email,
      subject: 'Your CineVerse OTP',
      html: `<h2>Your OTP is: <strong>${otp}</strong></h2><p>Valid for 10 minutes.</p>`,
    });

    res.json({ success: true, message: 'OTP sent' });
  } catch (err) {
    next(err);
  }
};

export const verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = req.body;
    const user = await prisma.user.findFirst({
      where: { email, otpCode: otp, otpExpiry: { gt: new Date() } },
    });

    if (!user) throw new AppError('Invalid or expired OTP', 400);

    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode: null, otpExpiry: null, isEmailVerified: true },
    });

    res.json({ success: true, message: 'OTP verified' });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: (req as any).userId },
      select: {
        id: true, username: true, email: true, displayName: true,
        bio: true, avatarUrl: true, coverUrl: true, role: true,
        isEmailVerified: true, createdAt: true,
        _count: { select: { reviews: true, followers: true, following: true } },
      },
    });

    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const getSessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessions = await prisma.session.findMany({
      where: { userId: (req as any).userId },
      select: { id: true, device: true, ip: true, createdAt: true, expiresAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: sessions });
  } catch (err) {
    next(err);
  }
};

export const revokeSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.session.deleteMany({
      where: { id: req.params.id, userId: (req as any).userId },
    });
    res.json({ success: true, message: 'Session revoked' });
  } catch (err) {
    next(err);
  }
};

export const googleAuth = (req: Request, res: Response) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.BACKEND_URL}/api/v1/auth/google/callback`;
  const scope = 'email profile';
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`);
};

export const googleCallback = async (req: Request, res: Response, next: NextFunction) => {
  res.redirect(`${process.env.FRONTEND_URL}?auth=success`);
};

export const githubAuth = (req: Request, res: Response) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  res.redirect(`https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user:email`);
};

export const githubCallback = async (req: Request, res: Response, next: NextFunction) => {
  res.redirect(`${process.env.FRONTEND_URL}?auth=success`);
};
