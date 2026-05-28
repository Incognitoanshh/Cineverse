`src/routes/celebrities.ts`


import { Router } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';

const router = Router();

router.get('/:slug', async (req, res, next) => {
  try {
    const celebrity = await prisma.celebrity.findUnique({
      where: { slug: req.params.slug },

      include: {
        movieCast: {
          include: {
            movie: {
              select: {
                id: true,
                title: true,
                slug: true,
                posterUrl: true,
                releaseDate: true,
                voteAverage: true,
              },
            },
          },

          take: 50,
        },

        movieCrew: {
          include: {
            movie: {
              select: {
                id: true,
                title: true,
                slug: true,
                posterUrl: true,
                releaseDate: true,
                voteAverage: true,
              },
            },
          },

          take: 30,
        },

        awards: true,
      },
    });

    if (!celebrity) {
      throw new AppError('Celebrity not found', 404);
    }

    const knownFor = celebrity.movieCast
      .slice(0, 10)
      .map((m) => m.movie);

    const response = {
      ...celebrity,

      personalInfo: {
        fullName: celebrity.name,
        birthday: celebrity.birthday,
        deathday: celebrity.deathday,
        birthPlace: celebrity.birthPlace,
        gender: celebrity.gender,
        department: celebrity.knownForDept,
        popularity: celebrity.popularity,
        biography: celebrity.biography,
      },

      knownFor,

      photos: celebrity.profileUrl
        ? [celebrity.profileUrl]
        : [],

      filmography: {
        acting: celebrity.movieCast,
        crew: celebrity.movieCrew,
      },

      stats: {
        totalMovies:
          celebrity.movieCast.length +
          celebrity.movieCrew.length,

        awardsCount: celebrity.awards.length,
      },
    };

    res.json({
      success: true,
      data: response,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

