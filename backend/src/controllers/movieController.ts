import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { cache } from '../config/redis';
import { AppError } from '../utils/AppError';

const CACHE_TTL = 300; // 5 min

export const getMovies = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '20', sort = 'popularity', genre, year, lang } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100);
    const skip = (pageNum - 1) * limitNum;

    const cacheKey = `movies:${page}:${limit}:${sort}:${genre}:${year}:${lang}`;
    const cached = await cache.get(cacheKey);
    if (cached) return res.json(cached);

    const where: any = { deletedAt: null, isPublished: true };
    if (genre) where.genres = { some: { genre: { slug: genre } } };
    if (year) {
      where.releaseDate = {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`),
      };
    }
    if (lang) where.originalLanguage = lang;

    const orderBy: any = {
      popularity: { popularity: 'desc' },
      rating: { voteAverage: 'desc' },
      newest: { releaseDate: 'desc' },
      oldest: { releaseDate: 'asc' },
    }[sort as string] || { popularity: 'desc' };

    const [movies, total] = await Promise.all([
      prisma.movie.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        select: {
          id: true, title: true, slug: true, posterUrl: true, backdropUrl: true,
          releaseDate: true, voteAverage: true, voteCount: true,
          runtime: true, overview: true,
          genres: { select: { genre: { select: { name: true, slug: true } } } },
        },
      }),
      prisma.movie.count({ where }),
    ]);

    const result = {
      success: true,
      data: movies,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    };

    await cache.set(cacheKey, result, CACHE_TTL);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getTrending = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cached = await cache.get('movies:trending');
    if (cached) return res.json(cached);

    const movies = await prisma.movie.findMany({
      where: { deletedAt: null, isPublished: true },
      orderBy: { popularity: 'desc' },
      take: 20,
      select: {
        id: true, title: true, slug: true, posterUrl: true, backdropUrl: true,
        releaseDate: true, voteAverage: true, overview: true,
        genres: { select: { genre: { select: { name: true } } } },
      },
    });

    const result = { success: true, data: movies };
    await cache.set('movies:trending', result, 600);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getUpcoming = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const movies = await prisma.movie.findMany({
      where: { deletedAt: null, isPublished: true, releaseDate: { gt: new Date() } },
      orderBy: { releaseDate: 'asc' },
      take: 20,
      select: {
        id: true, title: true, slug: true, posterUrl: true, backdropUrl: true,
        releaseDate: true, voteAverage: true, overview: true,
      },
    });
    res.json({ success: true, data: movies });
  } catch (err) {
    next(err);
  }
};

export const getTopRated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cached = await cache.get('movies:top-rated');
    if (cached) return res.json(cached);

    const movies = await prisma.movie.findMany({
      where: { deletedAt: null, isPublished: true, voteCount: { gte: 100 } },
      orderBy: { voteAverage: 'desc' },
      take: 20,
      select: {
        id: true, title: true, slug: true, posterUrl: true, backdropUrl: true,
        releaseDate: true, voteAverage: true, voteCount: true, overview: true,
      },
    });

    const result = { success: true, data: movies };
    await cache.set('movies:top-rated', result, 600);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getByGenre = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { genreSlug } = req.params;
    const movies = await prisma.movie.findMany({
      where: {
        deletedAt: null, isPublished: true,
        genres: { some: { genre: { slug: genreSlug } } },
      },
      orderBy: { popularity: 'desc' },
      take: 20,
      select: {
        id: true, title: true, slug: true, posterUrl: true,
        releaseDate: true, voteAverage: true, overview: true,
      },
    });
    res.json({ success: true, data: movies });
  } catch (err) {
    next(err);
  }
};

export const getMovie = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const cacheKey = `movie:${slug}`;
    const cached = await cache.get(cacheKey);
    if (cached) return res.json(cached);

    const movie = await prisma.movie.findUnique({
      where: { slug },
      include: {
        genres: { include: { genre: true } },
        cast: {
          include: { celebrity: { select: { id: true, name: true, slug: true, profileUrl: true } } },
          orderBy: { order: 'asc' },
          take: 20,
        },
        crew: {
          include: { celebrity: { select: { id: true, name: true, slug: true, profileUrl: true } } },
          where: { job: { in: ['Director', 'Producer', 'Screenplay', 'Writer'] } },
        },
        studios: { include: { studio: true } },
        awards: true,
        streamingLinks: true,
        _count: { select: { reviews: true } },
      },
    });

    if (!movie) throw new AppError('Movie not found', 404);

    const result = { success: true, data: movie };
    await cache.set(cacheKey, result, CACHE_TTL);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getMovieCast = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const movie = await prisma.movie.findUnique({ where: { slug }, select: { id: true } });
    if (!movie) throw new AppError('Movie not found', 404);

    const cast = await prisma.movieCast.findMany({
      where: { movieId: movie.id },
      include: { celebrity: true },
      orderBy: { order: 'asc' },
    });
    res.json({ success: true, data: cast });
  } catch (err) {
    next(err);
  }
};

export const getMovieCrew = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const movie = await prisma.movie.findUnique({ where: { slug }, select: { id: true } });
    if (!movie) throw new AppError('Movie not found', 404);

    const crew = await prisma.movieCrew.findMany({
      where: { movieId: movie.id },
      include: { celebrity: true },
    });
    res.json({ success: true, data: crew });
  } catch (err) {
    next(err);
  }
};

export const getMovieReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const { page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const movie = await prisma.movie.findUnique({ where: { slug }, select: { id: true } });
    if (!movie) throw new AppError('Movie not found', 404);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { movieId: movie.id, status: 'APPROVED', deletedAt: null },
        include: {
          user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          _count: { select: { likes: true, comments: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.review.count({ where: { movieId: movie.id, status: 'APPROVED', deletedAt: null } }),
    ]);

    res.json({
      success: true,
      data: reviews,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
};

export const getSimilarMovies = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const movie = await prisma.movie.findUnique({
      where: { slug },
      include: { genres: { select: { genreId: true } } },
    });
    if (!movie) throw new AppError('Movie not found', 404);

    const genreIds = movie.genres.map((g) => g.genreId);
    const similar = await prisma.movie.findMany({
      where: {
        id: { not: movie.id },
        deletedAt: null, isPublished: true,
        genres: { some: { genreId: { in: genreIds } } },
      },
      orderBy: { popularity: 'desc' },
      take: 12,
      select: {
        id: true, title: true, slug: true, posterUrl: true,
        releaseDate: true, voteAverage: true,
      },
    });
    res.json({ success: true, data: similar });
  } catch (err) {
    next(err);
  }
};

export const getMovieAwards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const movie = await prisma.movie.findUnique({ where: { slug }, select: { id: true } });
    if (!movie) throw new AppError('Movie not found', 404);

    const awards = await prisma.award.findMany({ where: { movieId: movie.id } });
    res.json({ success: true, data: awards });
  } catch (err) {
    next(err);
  }
};

export const rateMovie = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const { score } = req.body;
    const userId = (req as any).userId;

    const movie = await prisma.movie.findUnique({ where: { slug }, select: { id: true } });
    if (!movie) throw new AppError('Movie not found', 404);

    const rating = await prisma.rating.upsert({
      where: { userId_movieId: { userId, movieId: movie.id } },
      update: { score },
      create: { userId, movieId: movie.id, score },
    });

    // Update aggregate rating
    const agg = await prisma.rating.aggregate({
      where: { movieId: movie.id },
      _avg: { score: true },
      _count: true,
    });

    await prisma.movie.update({
      where: { id: movie.id },
      data: { voteAverage: agg._avg.score || 0, voteCount: agg._count },
    });

    await cache.del(`movie:${slug}`);
    res.json({ success: true, data: rating });
  } catch (err) {
    next(err);
  }
};

export const addToWatchlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const userId = (req as any).userId;

    const movie = await prisma.movie.findUnique({ where: { slug }, select: { id: true } });
    if (!movie) throw new AppError('Movie not found', 404);

    let watchlist = await prisma.watchlist.findFirst({ where: { userId, name: 'My Watchlist' } });
    if (!watchlist) {
      watchlist = await prisma.watchlist.create({ data: { userId, name: 'My Watchlist' } });
    }

    const item = await prisma.watchlistItem.create({
      data: { watchlistId: watchlist.id, movieId: movie.id },
    });

    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

export const removeFromWatchlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const userId = (req as any).userId;

    const movie = await prisma.movie.findUnique({ where: { slug }, select: { id: true } });
    if (!movie) throw new AppError('Movie not found', 404);

    const watchlist = await prisma.watchlist.findFirst({ where: { userId } });
    if (watchlist) {
      await prisma.watchlistItem.deleteMany({
        where: { watchlistId: watchlist.id, movieId: movie.id },
      });
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const toggleFavorite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const userId = (req as any).userId;

    const movie = await prisma.movie.findUnique({ where: { slug }, select: { id: true } });
    if (!movie) throw new AppError('Movie not found', 404);

    const existing = await prisma.favorite.findFirst({ where: { userId, movieId: movie.id } });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      res.json({ success: true, favorited: false });
    } else {
      await prisma.favorite.create({ data: { userId, movieId: movie.id } });
      res.json({ success: true, favorited: true });
    }
  } catch (err) {
    next(err);
  }
};

export const createMovie = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const movie = await prisma.movie.create({ data: req.body });
    await cache.flush('movies:*');
    res.status(201).json({ success: true, data: movie });
  } catch (err) {
    next(err);
  }
};

export const updateMovie = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const movie = await prisma.movie.update({ where: { id: req.params.id }, data: req.body });
    await cache.flush('movies:*');
    await cache.del(`movie:${movie.slug}`);
    res.json({ success: true, data: movie });
  } catch (err) {
    next(err);
  }
};

export const deleteMovie = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.movie.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), isPublished: false },
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
