import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Star, Calendar, ChevronDown, ChevronUp, Tv } from 'lucide-react';
import { tvAPI } from '../lib/api';
import { Badge, LoadingSpinner } from '../components/ui';
import { TVShow } from '../types';

const TVShowDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [activeSeason, setActiveSeason] = useState(0);

  const { data: show, isLoading } = useQuery({
    queryKey: ['tv', slug],
    queryFn: () => tvAPI.getBySlug(slug!).then((r) => r.data.data as TVShow),
    enabled: !!slug,
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center pt-16"><LoadingSpinner size={12} /></div>;
  if (!show) return <div className="min-h-screen flex items-center justify-center pt-16"><p className="text-cine-muted">Show not found.</p></div>;

  const selectedSeason = show.seasons?.[activeSeason];

  return (
    <div className="min-h-screen">
      {/* Backdrop */}
      <div className="relative h-[55vh] min-h-[350px] overflow-hidden">
        {show.backdropUrl ? <img src={show.backdropUrl} alt={show.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-cine-surface" />}
        <div className="absolute inset-0 bg-gradient-to-t from-cine-bg via-cine-bg/50 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-40 relative z-10 pb-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="shrink-0 w-44 md:w-56 mx-auto md:mx-0">
            <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-card border border-cine-border">
              {show.posterUrl ? <img src={show.posterUrl} alt={show.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-cine-card flex items-center justify-center"><Tv className="w-10 h-10 text-cine-muted" /></div>}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pt-4">
            <div className="flex gap-2 flex-wrap mb-3">
              {show.genres?.map(({ genre }) => <Badge key={genre.id} label={genre.name} color="gold" />)}
            </div>
            <h1 className="font-display text-4xl md:text-5xl text-white tracking-wider mb-3">{show.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-cine-muted">
              <div className="flex items-center gap-1.5"><Star className="w-4 h-4 text-cine-gold fill-cine-gold" /><span className="text-cine-gold font-bold text-lg">{show.voteAverage.toFixed(1)}</span><span>/ 10</span></div>
              {show.firstAirDate && <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(show.firstAirDate).getFullYear()}</div>}
              <span>{show.numberOfSeasons} Seasons</span>
              <span>{show.numberOfEpisodes} Episodes</span>
              {show.status && <Badge label={show.status} color="green" />}
            </div>
            <p className="text-cine-muted leading-relaxed max-w-2xl">{show.overview}</p>
          </div>
        </div>

        {/* Cast */}
        {show.cast && show.cast.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-2xl text-white tracking-wider mb-5">Cast</h2>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-3">
              {show.cast.slice(0, 10).map(({ celebrity, character }) => (
                <Link key={celebrity.id} to={`/celebrities/${celebrity.slug}`} className="group text-center">
                  <div className="aspect-square rounded-xl overflow-hidden bg-cine-card mb-1.5">
                    {celebrity.profileUrl ? <img src={celebrity.profileUrl} alt={celebrity.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>}
                  </div>
                  <p className="text-xs font-medium text-white group-hover:text-cine-gold transition-colors line-clamp-2">{celebrity.name}</p>
                  {character && <p className="text-xs text-cine-muted line-clamp-1">{character}</p>}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Seasons & Episodes */}
        {show.seasons && show.seasons.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-2xl text-white tracking-wider mb-5">Seasons & Episodes</h2>
            {/* Season tabs */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6">
              {show.seasons.map((season, i) => (
                <button
                  key={season.id}
                  onClick={() => setActiveSeason(i)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeSeason === i ? 'bg-cine-gold text-cine-bg' : 'bg-cine-card border border-cine-border text-cine-muted hover:text-white'}`}
                >
                  {season.name || `Season ${season.seasonNumber}`}
                </button>
              ))}
            </div>

            {/* Episodes */}
            {selectedSeason && selectedSeason.episodes && (
              <div className="space-y-2">
                {selectedSeason.episodes.map((ep) => (
                  <div key={ep.id} className="flex items-start gap-4 p-4 bg-cine-card border border-cine-border rounded-xl hover:border-cine-gold/20 transition-all">
                    {ep.stillUrl && <img src={ep.stillUrl} alt={ep.title} className="w-24 h-14 object-cover rounded-lg shrink-0 bg-cine-surface" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-cine-muted font-mono">E{String(ep.episodeNumber).padStart(2, '0')}</span>
                        <h4 className="text-sm font-semibold text-white">{ep.title}</h4>
                      </div>
                      {ep.airDate && <p className="text-xs text-cine-muted mb-1">{new Date(ep.airDate).toLocaleDateString()}{ep.runtime ? ` · ${ep.runtime}m` : ''}</p>}
                      {ep.overview && <p className="text-xs text-cine-muted line-clamp-2">{ep.overview}</p>}
                    </div>
                    {ep.voteAverage > 0 && (
                      <div className="flex items-center gap-1 shrink-0"><Star className="w-3.5 h-3.5 text-cine-gold fill-cine-gold" /><span className="text-xs text-cine-gold font-bold">{ep.voteAverage.toFixed(1)}</span></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default TVShowDetailPage;
