import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const API_KEY = process.env.TMDB_API_KEY;

async function importCelebrities() {
  for (let page = 1; page <= 20; page++) {
    const res = await axios.get(
      `https://api.themoviedb.org/3/person/popular?api_key=${API_KEY}&page=${page}`
    );

    for (const person of res.data.results) {
      try {
        const detail = await axios.get(
          `https://api.themoviedb.org/3/person/${person.id}?api_key=${API_KEY}`
        );

        await prisma.celebrity.upsert({
          where: { tmdbId: person.id },
          update: {},
          create: {
            name: person.name,
            slug: person.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-'),

            biography: detail.data.biography || '',
            birthday: detail.data.birthday
              ? new Date(detail.data.birthday)
              : null,

            birthPlace: detail.data.place_of_birth || '',
            popularity: person.popularity,
            knownForDept: person.known_for_department,
            profileUrl: person.profile_path
              ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
              : null,

            tmdbId: person.id,
          },
        });

        console.log(`Imported celebrity: ${person.name}`);
      } catch (err) {
        console.log(`Skipped: ${person.name}`);
      }
    }
  }

  console.log('Done importing celebrities');
}

importCelebrities();