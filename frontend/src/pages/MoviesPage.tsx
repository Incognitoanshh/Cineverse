import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { moviesAPI, genreAPI } from '../lib/api';
import { MovieCard, SkeletonCard, SectionHeader, GenrePill, LoadingSpinner, EmptyState } from '../components/ui';
import { Movie, Genre } from '../types';

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Most Popular' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
];

const MoviesPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('popularity');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['movies', page, sort, genre, year],
    queryFn: () => moviesAPI.getAll({ page, limit: 24, sort, genre: genre || undefined, year: year || undefined }).then((r) => r.data),
  });

  const { data: genresData } = useQuery({
    queryKey: ['genres'],
    queryFn: () => genreAPI.getAll().then((r) => r.data.data as Genre[]),
  });

  const movies: Movie[] = data?.data || [];
  const pagination = data?.pagination;
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const clearFilters = () => { setGenre(''); setYear(''); setSort('popularity'); setPage(1); };
  const hasFilters = genre || year || sort !== 'popularity';

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl md:text-5xl text-white tracking-wider">Movies</h1>
            <p className="text-cine-muted mt-1">
              {pagination ? `${pagination.total.toLocaleString()} movies` : 'Browse all movies'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                <X className="w-4 h-4" /> Clear
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${showFilters ? 'bg-cine-gold/10 border-cine-gold/30 text-cine-gold' : 'border-cine-border text-cine-muted hover:text-white'}`}
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-cine-surface border border-cine-border rounded-2xl p-5 mb-8"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-cine-muted uppercase tracking-wider mb-2 block">Sort By</label>
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setPage(1); }}
                  className="w-full bg-cine-card border border-cine-border text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-cine-gold/50"
                >
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-cine-muted uppercase tracking-wider mb-2 block">Year</label>
                <select
                  value={year}
                  onChange={(e) => { setYear(e.target.value); setPage(1); }}
                  className="w-full bg-cine-card border border-cine-border text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-cine-gold/50"
                >
                  <option value="">All Years</option>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-cine-muted uppercase tracking-wider mb-2 block">Genre</label>
                <select
                  value={genre}
                  onChange={(e) => { setGenre(e.target.value); setPage(1); }}
                  className="w-full bg-cine-card border border-cine-border text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-cine-gold/50"
                >
                  <option value="">All Genres</option>
                  {genresData?.map((g) => <option key={g.id} value={g.slug}>{g.name}</option>)}
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Genre pills */}
        {genresData && (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 mb-8">
            <GenrePill name="All" slug="" active={genre === ''} onClick={() => { setGenre(''); setPage(1); }} />
            {genresData.slice(0, 100).map((g) => (
              <GenrePill key={g.id} name={g.name} slug={g.slug} active={genre === g.slug} onClick={() => { setGenre(g.slug); setPage(1); }} />
            ))}
          </div>
        )}

        {/* Movies grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 24 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : movies.length === 0 ? (
          <EmptyState title="No movies found" description="Try adjusting your filters or search criteria." />
        ) : (
          <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 ${isFetching ? 'opacity-70' : ''}`}>
            {movies.map((movie, i) => <MovieCard key={movie.id} movie={movie} index={i} />)}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border border-cine-border text-sm text-cine-muted hover:text-white hover:border-cine-gold/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>

            {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
              const p = i + Math.max(1, Math.min(page - 3, pagination.pages - 6));
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                    page === p
                      ? 'bg-cine-gold text-cine-bg'
                      : 'border border-cine-border text-cine-muted hover:text-white hover:border-cine-gold/30'
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="px-4 py-2 rounded-lg border border-cine-border text-sm text-cine-muted hover:text-white hover:border-cine-gold/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoviesPage;
