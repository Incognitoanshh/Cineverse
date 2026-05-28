
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const API_KEY = process.env.TMDB_API_KEY;

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function importCelebrities() {
  try {
    // TEMPORARY: only 3 pages to avoid TMDB rate-limit
    for (let page = 1; page <= 3; page++) {
      console.log(`Importing page ${page}...`);

      const res = await axios.get(
        `https://api.themoviedb.org/3/person/popular?api_key=${API_KEY}&page=${page}`
      );

      for (const person of res.data.results) {
        try {
          const detail = await axios.get(
            `https://api.themoviedb.org/3/person/${person.id}?api_key=${API_KEY}&append_to_response=combined_credits,images,external_ids`
          );

          const slug = person.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

          await prisma.celebrity.upsert({
            where: {
              tmdbId: person.id,
            },

            update: {
              biography: detail.data.biography || '',

              birthday: detail.data.birthday
                ? new Date(detail.data.birthday)
                : null,

              birthPlace: detail.data.place_of_birth || '',

              popularity: person.popularity,

              knownForDept:
                detail.data.known_for_department || 'Acting',

              profileUrl: detail.data.profile_path
                ? `https://image.tmdb.org/t/p/w500${detail.data.profile_path}`
                : null,

              imdbId: detail.data.imdb_id || null,
            },

            create: {
              name: person.name,

              slug,

              biography: detail.data.biography || '',

              birthday: detail.data.birthday
                ? new Date(detail.data.birthday)
                : null,

              birthPlace: detail.data.place_of_birth || '',

              popularity: person.popularity,

              knownForDept:
                detail.data.known_for_department || 'Acting',

              profileUrl: detail.data.profile_path
                ? `https://image.tmdb.org/t/p/w500${detail.data.profile_path}`
                : null,

              tmdbId: person.id,

              imdbId: detail.data.imdb_id || null,
            },
          });

          console.log(`Imported: ${person.name}`);

          // delay to avoid TMDB connection reset
          await delay(500);
        } catch (err) {
          console.log(`Skipped: ${person.name}`);
        }
      }
    }

    console.log('Done importing celebrities');
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

importCelebrities();