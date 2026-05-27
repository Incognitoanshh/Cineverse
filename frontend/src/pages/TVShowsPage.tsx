import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Star, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { tvAPI } from '../lib/api';
import { SkeletonCard, LoadingSpinner, EmptyState } from '../components/ui';
import { TVShow } from '../types';

const TVShowsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('popularity');

  const { data, isLoading } = useQuery({
    queryKey: ['tv', page, sort],
    queryFn: () => tvAPI.getAll({ page, limit: 24, sort }).then((r) => r.data),
  });

  const shows: TVShow[] = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl md:text-5xl text-white tracking-wider">TV Shows</h1>
            <p className="text-cine-muted mt-1">{pagination?.total.toLocaleString()} shows</p>
          </div>
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="bg-cine-card border border-cine-border text-white rounded-xl px-3 py-2 text-sm outline-none"
          >
            <option value="popularity">Most Popular</option>
            <option value="rating">Top Rated</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 24 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : shows.length === 0 ? (
          <EmptyState title="No TV shows found" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {shows.map((show, i) => (
              <motion.div
                key={show.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group"
              >
                <Link to={`/tv/${show.slug}`}>
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-cine-card">
                    {show.posterUrl ? (
                      <img src={show.posterUrl} alt={show.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><span className="text-cine-muted text-xs text-center px-2">{show.title}</span></div>
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
        )}

        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-lg border border-cine-border text-sm text-cine-muted disabled:opacity-40 hover:text-white transition-all">Previous</button>
            {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-lg text-sm ${page === p ? 'bg-cine-gold text-cine-bg font-bold' : 'border border-cine-border text-cine-muted hover:text-white'}`}>{p}</button>
            ))}
            <button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="px-4 py-2 rounded-lg border border-cine-border text-sm text-cine-muted disabled:opacity-40 hover:text-white transition-all">Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TVShowsPage;
