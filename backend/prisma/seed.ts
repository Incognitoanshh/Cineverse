import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Genres ──────────────────────────────────────────
  const genreData = [
    { name: 'Action', slug: 'action', tmdbId: 28 },
    { name: 'Adventure', slug: 'adventure', tmdbId: 12 },
    { name: 'Animation', slug: 'animation', tmdbId: 16 },
    { name: 'Comedy', slug: 'comedy', tmdbId: 35 },
    { name: 'Crime', slug: 'crime', tmdbId: 80 },
    { name: 'Documentary', slug: 'documentary', tmdbId: 99 },
    { name: 'Drama', slug: 'drama', tmdbId: 18 },
    { name: 'Fantasy', slug: 'fantasy', tmdbId: 14 },
    { name: 'Horror', slug: 'horror', tmdbId: 27 },
    { name: 'Mystery', slug: 'mystery', tmdbId: 9648 },
    { name: 'Romance', slug: 'romance', tmdbId: 10749 },
    { name: 'Science Fiction', slug: 'science-fiction', tmdbId: 878 },
    { name: 'Thriller', slug: 'thriller', tmdbId: 53 },
    { name: 'War', slug: 'war', tmdbId: 10752 },
    { name: 'Western', slug: 'western', tmdbId: 37 },
    { name: 'Biography', slug: 'biography', tmdbId: 100001 },
    { name: 'History', slug: 'history', tmdbId: 36 },
    { name: 'Music', slug: 'music', tmdbId: 10402 },
    { name: 'Sport', slug: 'sport', tmdbId: 7 },
    { name: 'Family', slug: 'family', tmdbId: 10751 },
  ];

  for (const g of genreData) {
    await prisma.genre.upsert({
      where: { slug: g.slug },
      update: {},
      create: g,
    });
  }
  console.log('✅ Genres seeded');

  // ─── Admin user ──────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cineverse.com' },
    update: {},
    create: {
      username: 'cineverse_admin',
      email: 'admin@cineverse.com',
      passwordHash: adminPassword,
      displayName: 'CineVerse Admin',
      role: 'ADMIN',
      isEmailVerified: true,
    },
  });
  console.log('✅ Admin user created — email: admin@cineverse.com / password: Admin@123456');

  // ─── Demo user ───────────────────────────────────────
  const demoPassword = await bcrypt.hash('Demo@123456', 12);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@cineverse.com' },
    update: {},
    create: {
      username: 'demo_user',
      email: 'demo@cineverse.com',
      passwordHash: demoPassword,
      displayName: 'Demo User',
      role: 'USER',
      isEmailVerified: true,
      bio: 'Passionate movie lover and critic.',
    },
  });
  console.log('✅ Demo user created — email: demo@cineverse.com / password: Demo@123456');

  // ─── Studios ─────────────────────────────────────────
  const studios = [
    { name: 'Warner Bros.', country: 'US' },
    { name: 'Universal Pictures', country: 'US' },
    { name: 'Paramount Pictures', country: 'US' },
    { name: 'Walt Disney Pictures', country: 'US' },
    { name: 'Sony Pictures', country: 'US' },
    { name: 'Marvel Studios', country: 'US' },
    { name: 'Netflix', country: 'US' },
    { name: 'A24', country: 'US' },
  ];

  for (const s of studios) {
    await prisma.studio.upsert({ where: { name: s.name }, update: {}, create: s });
  }
  console.log('✅ Studios seeded');

  // ─── Sample Celebrities ──────────────────────────────
  const celebrities = [
    { name: 'Christopher Nolan', slug: 'christopher-nolan', knownForDept: 'Directing', gender: 'MALE' as const, popularity: 95.0, birthday: new Date('1970-07-30'), birthPlace: 'London, England' },
    { name: 'Leonardo DiCaprio', slug: 'leonardo-dicaprio', knownForDept: 'Acting', gender: 'MALE' as const, popularity: 97.2, birthday: new Date('1974-11-11'), birthPlace: 'Los Angeles, California, USA' },
    { name: 'Scarlett Johansson', slug: 'scarlett-johansson', knownForDept: 'Acting', gender: 'FEMALE' as const, popularity: 94.5, birthday: new Date('1984-11-22'), birthPlace: 'New York City, New York, USA' },
    { name: 'Robert Downey Jr.', slug: 'robert-downey-jr', knownForDept: 'Acting', gender: 'MALE' as const, popularity: 96.1, birthday: new Date('1965-04-04'), birthPlace: 'Manhattan, New York City, New York, USA' },
    { name: 'Cate Blanchett', slug: 'cate-blanchett', knownForDept: 'Acting', gender: 'FEMALE' as const, popularity: 89.3, birthday: new Date('1969-05-14'), birthPlace: 'Ivanhoe, Victoria, Australia' },
    { name: 'Tom Hanks', slug: 'tom-hanks', knownForDept: 'Acting', gender: 'MALE' as const, popularity: 92.7, birthday: new Date('1956-07-09'), birthPlace: 'Concord, California, USA' },
  ];

  for (const c of celebrities) {
    await prisma.celebrity.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }
  console.log('✅ Celebrities seeded');

  // ─── Sample Movies ───────────────────────────────────
  const movieSeed = [
    {
      title: 'Inception',
      slug: 'inception',
      overview: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
      tagline: 'Your mind is the scene of the crime.',
      releaseDate: new Date('2010-07-16'),
      runtime: 148,
      voteAverage: 8.8,
      voteCount: 35000,
      popularity: 98.5,
      budget: BigInt(160000000),
      revenue: BigInt(836848102),
      status: 'Released',
      originalLanguage: 'en',
      tmdbId: 27205,
      imdbId: 'tt1375666',
      posterUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
      genres: ['action', 'science-fiction', 'thriller'],
    },
    {
      title: 'The Dark Knight',
      slug: 'the-dark-knight',
      overview: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
      tagline: 'Why so serious?',
      releaseDate: new Date('2008-07-18'),
      runtime: 152,
      voteAverage: 9.0,
      voteCount: 42000,
      popularity: 99.1,
      budget: BigInt(185000000),
      revenue: BigInt(1004558444),
      status: 'Released',
      originalLanguage: 'en',
      tmdbId: 155,
      imdbId: 'tt0468569',
      posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/original/nMKdUFyrkXyfXHJRwsCTHgCOCVi.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
      genres: ['action', 'crime', 'drama', 'thriller'],
    },
    {
      title: 'Interstellar',
      slug: 'interstellar',
      overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
      tagline: 'Mankind was born on Earth. It was never meant to die here.',
      releaseDate: new Date('2014-11-07'),
      runtime: 169,
      voteAverage: 8.6,
      voteCount: 38000,
      popularity: 96.8,
      budget: BigInt(165000000),
      revenue: BigInt(773342699),
      status: 'Released',
      originalLanguage: 'en',
      tmdbId: 157336,
      imdbId: 'tt0816692',
      posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
      genres: ['adventure', 'drama', 'science-fiction'],
    },
    {
      title: 'The Shawshank Redemption',
      slug: 'the-shawshank-redemption',
      overview: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
      tagline: 'Fear can hold you prisoner. Hope can set you free.',
      releaseDate: new Date('1994-09-23'),
      runtime: 142,
      voteAverage: 9.3,
      voteCount: 28000,
      popularity: 88.4,
      budget: BigInt(25000000),
      revenue: BigInt(16000000),
      status: 'Released',
      originalLanguage: 'en',
      tmdbId: 278,
      imdbId: 'tt0111161',
      posterUrl: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/original/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
      genres: ['drama', 'crime'],
    },
    {
      title: 'Pulp Fiction',
      slug: 'pulp-fiction',
      overview: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
      tagline: 'Just because you are a character doesn\'t mean you have character.',
      releaseDate: new Date('1994-10-14'),
      runtime: 154,
      voteAverage: 8.9,
      voteCount: 31500,
      popularity: 91.3,
      budget: BigInt(8000000),
      revenue: BigInt(213928762),
      status: 'Released',
      originalLanguage: 'en',
      tmdbId: 680,
      imdbId: 'tt0110912',
      posterUrl: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/original/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg',
      genres: ['thriller', 'crime'],
    },
    {
      title: 'Avengers: Endgame',
      slug: 'avengers-endgame',
      overview: 'After the devastating events of Infinity War, the Avengers assemble once more in order to reverse Thanos\' actions and restore balance to the universe.',
      tagline: 'Part of the journey is the end.',
      releaseDate: new Date('2019-04-26'),
      runtime: 181,
      voteAverage: 8.4,
      voteCount: 45000,
      popularity: 99.8,
      budget: BigInt(356000000),
      revenue: BigInt(2797800564),
      status: 'Released',
      originalLanguage: 'en',
      tmdbId: 299534,
      imdbId: 'tt4154796',
      posterUrl: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
      genres: ['action', 'adventure', 'science-fiction'],
    },
    {
      title: 'The Godfather',
      slug: 'the-godfather',
      overview: 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.',
      tagline: "An offer you can't refuse.",
      releaseDate: new Date('1972-03-24'),
      runtime: 175,
      voteAverage: 9.2,
      voteCount: 26000,
      popularity: 86.7,
      budget: BigInt(6000000),
      revenue: BigInt(245066411),
      status: 'Released',
      originalLanguage: 'en',
      tmdbId: 238,
      imdbId: 'tt0068646',
      posterUrl: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsLe1rBxiuHOF.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/original/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
      genres: ['drama', 'crime'],
    },
    {
      title: 'Fight Club',
      slug: 'fight-club',
      overview: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.',
      tagline: 'Mischief. Mayhem. Soap.',
      releaseDate: new Date('1999-10-15'),
      runtime: 139,
      voteAverage: 8.8,
      voteCount: 29000,
      popularity: 90.2,
      budget: BigInt(63000000),
      revenue: BigInt(100853753),
      status: 'Released',
      originalLanguage: 'en',
      tmdbId: 550,
      imdbId: 'tt0137523',
      posterUrl: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/original/87hTDiay2N2qWyX4Ds7ybXi9h8I.jpg',
      genres: ['drama', 'thriller'],
    },
  ];

  for (const m of movieSeed) {
    const { genres, ...movieData } = m;
    const movie = await prisma.movie.upsert({
      where: { slug: m.slug },
      update: {},
      create: { ...movieData, isPublished: true },
    });

    for (const genreSlug of genres) {
      const genre = await prisma.genre.findUnique({ where: { slug: genreSlug } });
      if (genre) {
        await prisma.movieGenre.upsert({
          where: { movieId_genreId: { movieId: movie.id, genreId: genre.id } },
          update: {},
          create: { movieId: movie.id, genreId: genre.id },
        });
      }
    }
  }
  console.log('✅ Movies seeded');

  // ─── Sample TV Shows ─────────────────────────────────
  const tvShows = [
    {
      title: 'Breaking Bad',
      slug: 'breaking-bad',
      overview: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family\'s future.',
      firstAirDate: new Date('2008-01-20'),
      lastAirDate: new Date('2013-09-29'),
      numberOfSeasons: 5,
      numberOfEpisodes: 62,
      voteAverage: 9.5,
      voteCount: 38000,
      popularity: 99.3,
      status: 'Ended',
      originalLanguage: 'en',
      tmdbId: 1396,
      imdbId: 'tt0903747',
      posterUrl: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
      genres: ['drama', 'crime', 'thriller'],
    },
    {
      title: 'Game of Thrones',
      slug: 'game-of-thrones',
      overview: 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.',
      firstAirDate: new Date('2011-04-17'),
      lastAirDate: new Date('2019-05-19'),
      numberOfSeasons: 8,
      numberOfEpisodes: 73,
      voteAverage: 9.2,
      voteCount: 45000,
      popularity: 98.7,
      status: 'Ended',
      originalLanguage: 'en',
      tmdbId: 1399,
      imdbId: 'tt0944947',
      posterUrl: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/original/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg',
      genres: ['action', 'adventure', 'drama', 'fantasy'],
    },
    {
      title: 'The Wire',
      slug: 'the-wire',
      overview: 'The Baltimore drug scene, as seen through the eyes of drug dealers and law enforcement.',
      firstAirDate: new Date('2002-06-02'),
      lastAirDate: new Date('2008-03-09'),
      numberOfSeasons: 5,
      numberOfEpisodes: 60,
      voteAverage: 9.3,
      voteCount: 21000,
      popularity: 87.4,
      status: 'Ended',
      originalLanguage: 'en',
      tmdbId: 1438,
      imdbId: 'tt0306414',
      posterUrl: 'https://image.tmdb.org/t/p/w500/4lbclFySvugI51fwsyxBTOm4DqK.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/original/jh1XMqUivSNKl0g7L0F2J5cuQM5.jpg',
      genres: ['drama', 'crime'],
    },
  ];

  for (const t of tvShows) {
    const { genres, ...tvData } = t;
    const show = await prisma.tVShow.upsert({
      where: { slug: t.slug },
      update: {},
      create: { ...tvData, isPublished: true },
    });

    for (const genreSlug of genres) {
      const genre = await prisma.genre.findUnique({ where: { slug: genreSlug } });
      if (genre) {
        await prisma.tVShowGenre.upsert({
          where: { tvShowId_genreId: { tvShowId: show.id, genreId: genre.id } },
          update: {},
          create: { tvShowId: show.id, genreId: genre.id },
        });
      }
    }

    // Seed a sample season
    if (t.numberOfSeasons > 0) {
      await prisma.season.upsert({
        where: { tvShowId_seasonNumber: { tvShowId: show.id, seasonNumber: 1 } },
        update: {},
        create: {
          tvShowId: show.id,
          seasonNumber: 1,
          name: 'Season 1',
          episodeCount: Math.ceil(t.numberOfEpisodes / t.numberOfSeasons),
        },
      });
    }
  }
  console.log('✅ TV Shows seeded');

  // ─── Sample Reviews ──────────────────────────────────
  const inception = await prisma.movie.findUnique({ where: { slug: 'inception' } });
  if (inception) {
    await prisma.review.create({
      data: {
        userId: demoUser.id,
        movieId: inception.id,
        title: 'A mind-bending masterpiece',
        content: 'Christopher Nolan has crafted one of the most intricate and visually stunning films ever made. The concept of shared dreaming is executed flawlessly, and the performances, especially from DiCaprio, are outstanding. The ending still haunts me.',
        rating: 9.5,
        containsSpoiler: false,
        status: 'APPROVED',
        helpfulCount: 42,
      },
    });
  }
  console.log('✅ Sample reviews seeded');

  // ─── Badges ──────────────────────────────────────────
  const badges = [
    { name: 'Cinephile', description: 'Reviewed more than 50 movies' },
    { name: 'Critic', description: 'Written 10 in-depth reviews' },
    { name: 'Early Adopter', description: 'Joined in the first month' },
    { name: 'Top Reviewer', description: 'Reviews liked by 100+ users' },
    { name: 'Binge Watcher', description: 'Added 50+ shows to watchlist' },
  ];

  for (const b of badges) {
    await prisma.badge.upsert({ where: { name: b.name }, update: {}, create: b });
  }
  console.log('✅ Badges seeded');

  console.log('\n🎉 Database seeded successfully!');
  console.log('─────────────────────────────────');
  console.log('Admin: admin@cineverse.com / Admin@123456');
  console.log('Demo:  demo@cineverse.com  / Demo@123456');
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
