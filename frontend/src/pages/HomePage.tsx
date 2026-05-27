import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Search, Play, ChevronRight, Star, TrendingUp, Calendar, Sparkles, ArrowRight } from 'lucide-react';
import { moviesAPI, tvAPI, genreAPI } from '../lib/api';
import { MovieCard, SkeletonCard, SectionHeader, GenrePill } from '../components/ui';
import { Movie, TVShow, Genre } from '../types';

const HERO_INTERVAL = 6000;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [heroIndex, setHeroIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState('');

  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ['movies', 'trending'],
    queryFn: () => moviesAPI.getTrending().then((r) => r.data.data as Movie[]),
  });

  const { data: upcomingData } = useQuery({
    queryKey: ['movies', 'upcoming'],
    queryFn: () => moviesAPI.getUpcoming().then((r) => r.data.data as Movie[]),
  });

  const { data: topRatedData } = useQuery({
    queryKey: ['movies', 'top-rated'],
    queryFn: () => moviesAPI.getTopRated().then((r) => r.data.data as Movie[]),
  });

  const { data: tvData } = useQuery({
    queryKey: ['tv', 'popular'],
    queryFn: () => tvAPI.getAll({ sort: 'popularity', limit: 10 }).then((r) => r.data.data as TVShow[]),
  });

  const { data: genresData } = useQuery({
    queryKey: ['genres'],
    queryFn: () => genreAPI.getAll().then((r) => r.data.data as Genre[]),
  });

  const heroMovies = trendingData?.slice(0, 5) || [];

  useEffect(() => {
    if (heroMovies.length === 0) return;
    const t = setInterval(() => setHeroIndex((p) => (p + 1) % heroMovies.length), HERO_INTERVAL);
    return () => clearInterval(t);
  }, [heroMovies.length]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const currentHero = heroMovies[heroIndex];

  return (
    <div className="min-h-screen">
      {/* ─── HERO ──────────────────────────────────────── */}
      <section className="relative h-[90vh] min-h-[600px] overflow-hidden">
        {/* Background */}
        <AnimatePresence mode="wait">
          {currentHero && (
            <motion.div
              key={heroIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0"
            >
              {currentHero.backdropUrl ? (
                <img src={currentHero.backdropUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-cine-bg via-cine-surface to-cine-card" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-cine-bg via-cine-bg/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-cine-bg via-transparent to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-cine-gold/30"
              style={{ left: `${10 + i * 12}%`, top: `${20 + (i % 3) * 20}%` }}
              animate={{ y: [-10, 10, -10], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center">
          <AnimatePresence mode="wait">
            {currentHero && (
              <motion.div
                key={heroIndex}
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.7 }}
                className="max-w-2xl pt-16"
              >
                {/* Genre badges */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  {currentHero.genres?.slice(0, 3).map(({ genre }) => (
                    <span key={genre.id} className="text-xs bg-cine-gold/20 text-cine-gold border border-cine-gold/30 px-3 py-1 rounded-full font-medium">
                      {genre.name}
                    </span>
                  ))}
                </div>

                <h1 className="font-display text-5xl sm:text-7xl text-white tracking-wider leading-none mb-4">
                  {currentHero.title}
                </h1>

                {/* Rating row */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-5 h-5 text-cine-gold fill-cine-gold" />
                    <span className="text-cine-gold font-bold text-lg">{currentHero.voteAverage.toFixed(1)}</span>
                    <span className="text-cine-muted text-sm">/ 10</span>
                  </div>
                  {currentHero.releaseDate && (
                    <div className="flex items-center gap-1 text-cine-muted text-sm">
                      <Calendar className="w-4 h-4" />
                      {new Date(currentHero.releaseDate).getFullYear()}
                    </div>
                  )}
                  {currentHero.runtime && (
                    <span className="text-cine-muted text-sm">{currentHero.runtime} min</span>
                  )}
                </div>

                <p className="text-cine-muted text-base leading-relaxed line-clamp-3 mb-8 max-w-lg">
                  {currentHero.overview}
                </p>

                <div className="flex gap-3 flex-wrap">
                  <Link
                    to={`/movies/${currentHero.slug}`}
                    className="flex items-center gap-2 bg-cine-gold text-cine-bg font-bold px-6 py-3 rounded-xl hover:bg-cine-gold-dark transition-all shadow-glow"
                  >
                    <Play className="w-5 h-5 fill-cine-bg" /> Watch Now
                  </Link>
                  <Link
                    to={`/movies/${currentHero.slug}`}
                    className="flex items-center gap-2 glass text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-all"
                  >
                    More Info <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hero dots */}
          {heroMovies.length > 1 && (
            <div className="absolute bottom-10 left-4 sm:left-6 flex gap-2">
              {heroMovies.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIndex(i)}
                  className={`h-1 rounded-full transition-all ${i === heroIndex ? 'bg-cine-gold w-8' : 'bg-white/30 w-2'}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── SEARCH BAR ─────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-4 -mt-8 relative z-10 mb-16">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSearch}
          className="glass rounded-2xl p-2 flex items-center gap-3 shadow-card"
        >
          <Search className="w-5 h-5 text-cine-muted ml-3 shrink-0" />
          <input
            type="text"
            placeholder="Search movies, TV shows, celebrities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-cine-muted outline-none text-sm py-2"
          />
          <button
            type="submit"
            className="bg-cine-gold text-cine-bg font-semibold px-5 py-2 rounded-xl hover:bg-cine-gold-dark transition-all text-sm"
          >
            Search
          </button>
        </motion.form>
      </section>

      {/* ─── GENRES ─────────────────────────────────────── */}
      {genresData && genresData.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-14">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
            <GenrePill name="All" slug="" active={activeGenre === ''} onClick={() => setActiveGenre('')} />
            {genresData.slice(0, 100).map((g) => (
              <GenrePill
                key={g.id}
                name={g.name}
                slug={g.slug}
                active={activeGenre === g.slug}
                onClick={() => setActiveGenre(g.slug)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ─── TRENDING ───────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
        <SectionHeader
          title="🔥 Trending Now"
          subtitle="Most popular movies this week"
          link="/movies?sort=popularity"
          linkLabel="View all"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {trendingLoading
            ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
            : trendingData?.slice(0, 100).map((movie, i) => (
                <MovieCard key={movie.id} movie={movie} index={i} />
              ))}
        </div>
      </section>

      {/* ─── STATS BANNER ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
        <div className="bg-cine-surface border border-cine-border rounded-2xl p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Movies', value: '50,000+', icon: '🎬' },
              { label: 'TV Shows', value: '10,000+', icon: '📺' },
              { label: 'Celebrities', value: '100,000+', icon: '⭐' },
              { label: 'Reviews', value: '1M+', icon: '✍️' },
            ].map(({ label, value, icon }) => (
              <div key={label}>
                <div className="text-3xl mb-2">{icon}</div>
                <div className="text-2xl md:text-3xl font-display text-white tracking-wide">{value}</div>
                <div className="text-sm text-cine-muted mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TOP RATED ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
        <SectionHeader
          title="⭐ Top Rated"
          subtitle="All-time greatest movies"
          link="/movies?sort=rating"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {topRatedData?.slice(0, 100).map((movie, i) => (
            <MovieCard key={movie.id} movie={movie} index={i} />
          ))}
        </div>
      </section>

      {/* ─── POPULAR TV SHOWS ───────────────────────────── */}
      {tvData && tvData.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
          <SectionHeader
            title="📺 Popular TV Shows"
            subtitle="Binge-worthy series everyone's watching"
            link="/tv"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {tvData.slice(0, 10).map((show, i) => (
              <motion.div
                key={show.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group"
              >
                <Link to={`/tv/${show.slug}`}>
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-cine-card">
                    {show.posterUrl ? (
                      <img src={show.posterUrl} alt={show.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-cine-muted text-xs text-center px-2">{show.title}</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/70 rounded-lg px-1.5 py-0.5 flex items-center gap-1">
                      <Star className="w-3 h-3 text-cine-gold fill-cine-gold" />
                      <span className="text-xs text-white">{show.voteAverage.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="mt-2 px-0.5">
                    <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-cine-gold transition-colors">{show.title}</h3>
                    <p className="text-xs text-cine-muted mt-0.5">{show.numberOfSeasons} Season{show.numberOfSeasons !== 1 ? 's' : ''}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ─── UPCOMING ───────────────────────────────────── */}
      {upcomingData && upcomingData.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
          <SectionHeader title="🎯 Coming Soon" subtitle="Movies releasing soon" link="/movies?sort=newest" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingData.slice(0, 6).map((movie, i) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <Link to={`/movies/${movie.slug}`} className="flex gap-4 p-4 bg-cine-card border border-cine-border rounded-xl hover:border-cine-gold/30 transition-all group">
                  <img
                    src={movie.posterUrl || ''}
                    alt={movie.title}
                    className="w-16 h-24 object-cover rounded-lg shrink-0 bg-cine-surface"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white group-hover:text-cine-gold transition-colors line-clamp-2 leading-tight">{movie.title}</h3>
                    {movie.releaseDate && (
                      <p className="text-xs text-cine-gold mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(movie.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                    <p className="text-xs text-cine-muted mt-2 line-clamp-2">{movie.overview}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ─── CTA SECTION ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-20">
        <div className="relative overflow-hidden bg-gradient-to-r from-cine-gold/20 to-cine-accent/10 border border-cine-gold/20 rounded-2xl p-10 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,197,24,0.1),transparent)]" />
          <Sparkles className="w-10 h-10 text-cine-gold mx-auto mb-4 relative z-10" />
          <h2 className="font-display text-4xl text-white tracking-wider mb-3 relative z-10">Join CineVerse Today</h2>
          <p className="text-cine-muted max-w-md mx-auto mb-6 relative z-10">Create your account to rate movies, write reviews, build watchlists, and get personalized recommendations.</p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-cine-gold text-cine-bg font-bold px-8 py-3 rounded-xl hover:bg-cine-gold-dark transition-all shadow-glow relative z-10"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
