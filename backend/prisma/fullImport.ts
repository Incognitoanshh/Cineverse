import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const API_KEY = process.env.TMDB_API_KEY;

const BASE = 'https://api.themoviedb.org/3';

async function fetchGenres() {
  const res = await axios.get(
    `${BASE}/genre/movie/list?api_key=${API_KEY}`
  );

  for (const genre of res.data.genres) {
    await prisma.genre.upsert({
      where: { tmdbId: genre.id },
      update: {},
      create: {
        name: genre.name,
        slug: genre.name.toLowerCase().replace(/\s+/g, '-'),
        tmdbId: genre.id,
      },
    });
  }

  console.log('✅ Genres synced');
}

async function importMovies() {
  for (let page = 1; page <= 500; page++) {
    console.log(`📦 Importing page ${page}`);

    const res = await axios.get(
      `${BASE}/movie/popular?api_key=${API_KEY}&page=${page}`
    );

    for (const movie of res.data.results) {
      try {
        await prisma.movie.upsert({
          where: { tmdbId: movie.id },
          update: {},
          create: {
            title: movie.title,

            slug: `${movie.title}-${movie.id}`
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

            genres: {
              create: movie.genre_ids.map((genreId: number) => ({
                genre: {
                  connect: {
                    tmdbId: genreId,
                  },
                },
              })),
            },
          },
        });

        console.log(`✅ ${movie.title}`);
      } catch (err) {
        console.log(`⚠️ Skipped ${movie.title}`);
      }
    }
  }

  console.log('🎬 Movies imported');
}

async function importTVShows() {
  for (let page = 1; page <= 200; page++) {
    console.log(`📺 TV page ${page}`);

    const res = await axios.get(
      `${BASE}/tv/popular?api_key=${API_KEY}&page=${page}`
    );

    for (const show of res.data.results) {
      try {
        await prisma.tVShow.upsert({
          where: { tmdbId: show.id },
          update: {},
          create: {
            title: show.name,

            slug: `${show.name}-${show.id}`
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-'),

            overview: show.overview,

            firstAirDate: show.first_air_date
              ? new Date(show.first_air_date)
              : null,

            posterUrl: show.poster_path
              ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
              : null,

            backdropUrl: show.backdrop_path
              ? `https://image.tmdb.org/t/p/original${show.backdrop_path}`
              : null,

            voteAverage: show.vote_average,
            popularity: show.popularity,
            tmdbId: show.id,
            originalLanguage: show.original_language,
            status: 'Released',
            isPublished: true,
          },
        });

        console.log(`📺 ${show.name}`);
      } catch {
        console.log(`⚠️ Skipped ${show.name}`);
      }
    }
  }

  console.log('✅ TV shows imported');
}

async function main() {
  await fetchGenres();

  await importMovies();

  await importTVShows();

  console.log('🔥 FULL IMPORT COMPLETE');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });