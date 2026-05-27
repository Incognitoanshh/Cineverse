import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const API_KEY = process.env.TMDB_API_KEY;

async function importMovies() {
  for (let page = 1; page <= 20; page++) {
    const res = await axios.get(
      `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=${page}`
    );

    for (const movie of res.data.results) {
      try {
        await prisma.movie.upsert({
          where: { tmdbId: movie.id },
          update: {},
          create: {
            title: movie.title,
            slug: movie.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-'),

            overview: movie.overview,
            releaseDate: movie.release_date
              ? new Date(movie.release_date)
              : null,

            posterUrl: movie.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : null,

            backdropUrl: movie.backdrop_path
              ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
              : null,

            voteAverage: movie.vote_average,
            popularity: movie.popularity,
            tmdbId: movie.id,
            originalLanguage: movie.original_language,
            status: 'Released',
            isPublished: true,
          },
        });

        console.log(`Imported: ${movie.title}`);
      } catch (err) {
        console.log(`Skipped: ${movie.title}`);
      }
    }
  }

  console.log('Done importing movies');
}

importMovies();