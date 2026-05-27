import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Film, Tv, User } from 'lucide-react';
import { searchAPI } from '../lib/api';
import { MovieCard, SkeletonCard, EmptyState } from '../components/ui';

const TABS = ['all', 'movie', 'tv', 'celebrity'] as const;
type Tab = typeof TABS[number];

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const q = searchParams.get('q') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['search', q, activeTab],
    queryFn: () => searchAPI.search({ q, type: activeTab }).then((r) => r.data.data),
    enabled: q.length >= 2,
  });

  const movies = data?.movies || [];
  const tvShows = data?.tvShows || [];
  const celebrities = data?.celebrities || [];
  const total = movies.length + tvShows.length + celebrities.length;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="font-display text-4xl text-white tracking-wider mb-2">
            {q ? <>Results for "<span className="text-cine-gold">{q}</span>"</> : 'Search'}
          </h1>
          {q && !isLoading && <p className="text-cine-muted">{total} results</p>}
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 border-b border-cine-border mb-8">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-medium capitalize border-b-2 transition-all -mb-px ${activeTab === tab ? 'border-cine-gold text-cine-gold' : 'border-transparent text-cine-muted hover:text-white'}`}
            >
              {tab === 'all' ? 'All' : tab === 'movie' ? 'Movies' : tab === 'tv' ? 'TV Shows' : 'Celebrities'}
            </button>
          ))}
        </div>

        {!q && (
          <EmptyState
            icon={<Search className="w-16 h-16" />}
            title="Search for anything"
            description="Find movies, TV shows, and celebrities. Type at least 2 characters."
          />
        )}

        {q && isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {q && !isLoading && total === 0 && (
          <EmptyState icon={<Search className="w-16 h-16" />} title="No results found" description={`No results found for "${q}". Try different keywords.`} />
        )}

        {/* Movies */}
        {(activeTab === 'all' || activeTab === 'movie') && movies.length > 0 && (
          <section className="mb-12">
            {activeTab === 'all' && <h2 className="font-display text-xl text-white tracking-wider mb-4 flex items-center gap-2"><Film className="w-5 h-5 text-cine-gold" /> Movies ({movies.length})</h2>}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {movies.map((m: any, i: number) => <MovieCard key={m.id} movie={m} index={i} />)}
            </div>
          </section>
        )}

        {/* TV Shows */}
        {(activeTab === 'all' || activeTab === 'tv') && tvShows.length > 0 && (
          <section className="mb-12">
            {activeTab === 'all' && <h2 className="font-display text-xl text-white tracking-wider mb-4 flex items-center gap-2"><Tv className="w-5 h-5 text-cine-gold" /> TV Shows ({tvShows.length})</h2>}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {tvShows.map((show: any, i: number) => (
                <motion.div key={show.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="group">
                  <Link to={`/tv/${show.slug}`}>
                    <div className="aspect-[2/3] rounded-xl overflow-hidden bg-cine-card mb-2">
                      {show.posterUrl ? <img src={show.posterUrl} alt={show.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center text-cine-muted text-xs text-center px-2">{show.title}</div>}
                    </div>
                    <h3 className="text-xs font-semibold text-white group-hover:text-cine-gold transition-colors line-clamp-2">{show.title}</h3>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Celebrities */}
        {(activeTab === 'all' || activeTab === 'celebrity') && celebrities.length > 0 && (
          <section className="mb-12">
            {activeTab === 'all' && <h2 className="font-display text-xl text-white tracking-wider mb-4 flex items-center gap-2"><User className="w-5 h-5 text-cine-gold" /> Celebrities ({celebrities.length})</h2>}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {celebrities.map((c: any, i: number) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="group text-center">
                  <Link to={`/celebrities/${c.slug}`}>
                    <div className="aspect-square rounded-xl overflow-hidden bg-cine-card mb-2">
                      {c.profileUrl ? <img src={c.profileUrl} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center"><User className="w-8 h-8 text-cine-muted" /></div>}
                    </div>
                    <h3 className="text-xs font-semibold text-white group-hover:text-cine-gold transition-colors">{c.name}</h3>
                    {c.knownForDept && <p className="text-xs text-cine-muted">{c.knownForDept}</p>}
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
