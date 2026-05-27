import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bookmark, Trash2, Star, Eye } from 'lucide-react';
import { userAPI, moviesAPI } from '../lib/api';
import { LoadingSpinner, EmptyState } from '../components/ui';
import toast from 'react-hot-toast';

const WatchlistPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => userAPI.getWatchlist().then((r) => r.data.data),
  });

  const removeMutation = useMutation({
    mutationFn: (slug: string) => moviesAPI.removeFromWatchlist(slug),
    onSuccess: () => {
      toast.success('Removed from watchlist');
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <LoadingSpinner size={12} />
    </div>
  );

  const allItems = data?.flatMap((wl: any) => wl.items || []) || [];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 mb-8">
          <Bookmark className="w-7 h-7 text-cine-gold" />
          <div>
            <h1 className="font-display text-4xl text-white tracking-wider">My Watchlist</h1>
            <p className="text-cine-muted text-sm mt-0.5">{allItems.length} titles saved</p>
          </div>
        </div>

        {allItems.length === 0 ? (
          <EmptyState
            icon={<Bookmark className="w-16 h-16" />}
            title="Your watchlist is empty"
            description="Add movies and TV shows you want to watch later."
            action={
              <Link to="/movies" className="px-6 py-2.5 bg-cine-gold text-cine-bg font-bold rounded-xl text-sm hover:bg-cine-gold-dark transition-all">
                Browse Movies
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {allItems.map((item: any, i: number) => {
              const media = item.movie || item.tvShow;
              if (!media) return null;
              const type = item.movie ? 'movies' : 'tv';
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-4 p-4 bg-cine-card border border-cine-border rounded-2xl hover:border-cine-gold/20 transition-all group"
                >
                  <Link to={`/${type}/${media.slug}`} className="shrink-0">
                    <div className="w-14 h-20 rounded-xl overflow-hidden bg-cine-surface">
                      {media.posterUrl ? (
                        <img src={media.posterUrl} alt={media.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Eye className="w-5 h-5 text-cine-muted" />
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link to={`/${type}/${media.slug}`}>
                      <h3 className="font-semibold text-white group-hover:text-cine-gold transition-colors line-clamp-1">
                        {media.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-3 mt-1 text-xs text-cine-muted">
                      <span className="capitalize">{type === 'tv' ? 'TV Show' : 'Movie'}</span>
                      {media.voteAverage > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-cine-gold fill-cine-gold" />
                          {media.voteAverage.toFixed(1)}
                        </span>
                      )}
                      <span>Added {new Date(item.addedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.watched && (
                      <span className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        Watched
                      </span>
                    )}
                    <button
                      onClick={() => media.slug && removeMutation.mutate(media.slug)}
                      className="p-2 text-cine-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchlistPage;
