import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/authenticate';
import { cache } from '../config/redis';
import OpenAI from 'openai';

const router = Router();

// Lazy init — only created when OPENAI_API_KEY is present
const getOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

router.get('/personalized', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).userId;
    const cacheKey = `recs:${userId}`;
    const cached = await cache.get(cacheKey);
    if (cached) return res.json(cached);

    const [favorites, watchlistItems, ratings] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId },
        include: { movie: { select: { title: true, genres: { include: { genre: true } } } } },
        take: 10,
      }),
      prisma.watchlistItem.findMany({
        where: { watchlist: { userId } },
        include: { movie: { select: { title: true } } },
        take: 10,
      }),
      prisma.rating.findMany({
        where: { userId, score: { gte: 7 } },
        include: { movie: { select: { title: true } } },
        take: 10,
      }),
    ]);

    const likedTitles = [
      ...favorites.map((f) => f.movie?.title).filter(Boolean),
      ...ratings.map((r) => r.movie?.title).filter(Boolean),
    ].join(', ');

    // AI-powered recommendations
    let aiRecs: string[] = [];
    const openai = getOpenAI();
    if (likedTitles && openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'user',
            content: `Based on these liked movies: ${likedTitles}, suggest 10 similar movies. Return ONLY a JSON array of movie titles, nothing else.`,
          }],
          max_tokens: 300,
        });
        const text = completion.choices[0].message.content || '[]';
        aiRecs = JSON.parse(text.replace(/```json|```/g, '').trim());
      } catch {}
    }

    // Find matching movies in DB
    const movies = await prisma.movie.findMany({
      where: {
        isPublished: true, deletedAt: null,
        title: { in: aiRecs },
      },
      select: {
        id: true, title: true, slug: true, posterUrl: true,
        voteAverage: true, releaseDate: true, overview: true,
      },
    });

    // Fallback: trending
    if (movies.length < 5) {
      const trending = await prisma.movie.findMany({
        where: { isPublished: true, deletedAt: null },
        orderBy: { popularity: 'desc' },
        take: 20,
        select: {
          id: true, title: true, slug: true, posterUrl: true,
          voteAverage: true, releaseDate: true, overview: true,
        },
      });
      const result = { success: true, data: trending, source: 'trending' };
      await cache.set(cacheKey, result, 600);
      return res.json(result);
    }

    const result = { success: true, data: movies, source: 'ai' };
    await cache.set(cacheKey, result, 1800);
    res.json(result);
  } catch (err) { next(err); }
});

router.get('/similar/:movieId', async (req, res, next) => {
  try {
    const movie = await prisma.movie.findUnique({
      where: { id: req.params.movieId },
      include: { genres: { select: { genreId: true } } },
    });

    if (!movie) return res.json({ success: true, data: [] });

    const genreIds = movie.genres.map((g) => g.genreId);
    const similar = await prisma.movie.findMany({
      where: {
        id: { not: movie.id },
        isPublished: true, deletedAt: null,
        genres: { some: { genreId: { in: genreIds } } },
      },
      orderBy: { popularity: 'desc' },
      take: 12,
      select: {
        id: true, title: true, slug: true, posterUrl: true,
        voteAverage: true, releaseDate: true,
      },
    });

    res.json({ success: true, data: similar });
  } catch (err) { next(err); }
});

export default router;
