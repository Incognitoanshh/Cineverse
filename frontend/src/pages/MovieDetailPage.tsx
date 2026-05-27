import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Star, Clock, Calendar, Bookmark, Heart, Play, Share2,
  ChevronDown, ChevronUp, Film, DollarSign, Globe, Award
} from 'lucide-react';
import { moviesAPI, reviewsAPI } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { StarRating, Badge, LoadingSpinner, MovieCard } from '../components/ui';
import { Movie, Review } from '../types';
import toast from 'react-hot-toast';

const MovieDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [showAllCast, setShowAllCast] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ title: '', content: '', rating: 8, containsSpoiler: false });
  const [userRating, setUserRating] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['movie', slug],
    queryFn: () => moviesAPI.getBySlug(slug!).then((r) => r.data.data as Movie),
    enabled: !!slug,
  });

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ['movie-reviews', slug],
    queryFn: () => moviesAPI.getReviews(slug!).then((r) => r.data),
    enabled: !!slug,
  });

  const { data: similarData } = useQuery({
    queryKey: ['similar-movies', slug],
    queryFn: () => moviesAPI.getSimilar(slug!).then((r) => r.data.data as Movie[]),
    enabled: !!slug,
  });

  const rateMutation = useMutation({
    mutationFn: (score: number) => moviesAPI.rate(slug!, score),
    onSuccess: () => { toast.success('Rating saved!'); queryClient.invalidateQueries({ queryKey: ['movie', slug] }); },
    onError: () => toast.error('Failed to rate'),
  });

  const watchlistMutation = useMutation({
    mutationFn: () => moviesAPI.addToWatchlist(slug!),
    onSuccess: () => toast.success('Added to watchlist!'),
    onError: () => toast.error('Failed to add to watchlist'),
  });

  const favoriteMutation = useMutation({
    mutationFn: () => moviesAPI.toggleFavorite(slug!),
    onSuccess: (res) => toast.success(res.data.favorited ? 'Added to favorites!' : 'Removed from favorites'),
  });

  const reviewMutation = useMutation({
    mutationFn: () => reviewsAPI.create({ ...reviewData, movieId: data?.id }),
    onSuccess: () => {
      toast.success('Review posted!');
      setShowReviewForm(false);
      setReviewData({ title: '', content: '', rating: 8, containsSpoiler: false });
      queryClient.invalidateQueries({ queryKey: ['movie-reviews', slug] });
    },
    onError: () => toast.error('Failed to post review'),
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <LoadingSpinner size={12} />
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <p className="text-cine-muted">Movie not found.</p>
    </div>
  );

  const movie = data;
  const reviews: Review[] = reviewsData?.data || [];
  const directors = movie.crew?.filter((c) => c.job === 'Director') || [];
  const writers = movie.crew?.filter((c) => ['Screenplay', 'Writer'].includes(c.job)) || [];
  const cast = showAllCast ? (movie.cast || []) : (movie.cast || []).slice(0, 10);

  return (
    <div className="min-h-screen">
      {/* ─── BACKDROP ───────────────────────────────── */}
      <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
        {movie.backdropUrl ? (
          <img src={movie.backdropUrl} alt={movie.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-cine-surface to-cine-bg" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-cine-bg via-cine-bg/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-cine-bg/80 to-transparent" />
      </div>

      {/* ─── MAIN CONTENT ───────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-48 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="shrink-0 w-48 md:w-64 mx-auto md:mx-0"
          >
            <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-card border border-cine-border">
              {movie.posterUrl ? (
                <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-cine-card flex items-center justify-center">
                  <Film className="w-12 h-12 text-cine-muted" />
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="mt-4 space-y-2">
              {movie.trailerUrl && (
                <a
                  href={movie.trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-cine-gold text-cine-bg font-bold py-2.5 rounded-xl hover:bg-cine-gold-dark transition-all"
                >
                  <Play className="w-4 h-4 fill-cine-bg" /> Watch Trailer
                </a>
              )}
              {isAuthenticated && (
                <>
                  <button
                    onClick={() => watchlistMutation.mutate()}
                    className="w-full flex items-center justify-center gap-2 bg-cine-card border border-cine-border text-white py-2.5 rounded-xl hover:border-cine-gold/30 transition-all text-sm"
                  >
                    <Bookmark className="w-4 h-4" /> Add to Watchlist
                  </button>
                  <button
                    onClick={() => favoriteMutation.mutate()}
                    className="w-full flex items-center justify-center gap-2 bg-cine-card border border-cine-border text-white py-2.5 rounded-xl hover:border-red-500/30 transition-all text-sm"
                  >
                    <Heart className="w-4 h-4" /> Favorite
                  </button>
                </>
              )}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 pt-4"
          >
            {/* Genres */}
            <div className="flex gap-2 flex-wrap mb-3">
              {movie.genres?.map(({ genre }) => (
                <Link key={genre.id} to={`/movies?genre=${genre.slug}`}>
                  <Badge label={genre.name} color="gold" />
                </Link>
              ))}
            </div>

            <h1 className="font-display text-4xl md:text-5xl text-white tracking-wider leading-tight mb-2">
              {movie.title}
            </h1>
            {movie.tagline && <p className="text-cine-muted italic text-base mb-4">"{movie.tagline}"</p>}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 mb-5 text-sm text-cine-muted">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-cine-gold fill-cine-gold" />
                <span className="text-cine-gold font-bold text-lg">{movie.voteAverage.toFixed(1)}</span>
                <span>/ 10</span>
                <span className="text-xs">({movie.voteCount.toLocaleString()} votes)</span>
              </div>
              {movie.runtime && (
                <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {movie.runtime} min</div>
              )}
              {movie.releaseDate && (
                <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(movie.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              )}
              {movie.status && <Badge label={movie.status} color="green" />}
              {movie.originalLanguage && (
                <div className="flex items-center gap-1"><Globe className="w-4 h-4" /> {movie.originalLanguage.toUpperCase()}</div>
              )}
            </div>

            {/* Overview */}
            <p className="text-cine-muted leading-relaxed mb-6 max-w-2xl">{movie.overview}</p>

            {/* Credits */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              {directors.length > 0 && (
                <div>
                  <p className="text-xs text-cine-muted uppercase tracking-wider mb-1">Director</p>
                  {directors.map((d) => (
                    <Link key={d.celebrity.id} to={`/celebrities/${d.celebrity.slug}`} className="text-sm text-white hover:text-cine-gold transition-colors block">
                      {d.celebrity.name}
                    </Link>
                  ))}
                </div>
              )}
              {writers.length > 0 && (
                <div>
                  <p className="text-xs text-cine-muted uppercase tracking-wider mb-1">Writer</p>
                  {writers.slice(0, 2).map((w) => (
                    <Link key={w.celebrity.id} to={`/celebrities/${w.celebrity.slug}`} className="text-sm text-white hover:text-cine-gold transition-colors block">
                      {w.celebrity.name}
                    </Link>
                  ))}
                </div>
              )}
              {movie.studios && movie.studios.length > 0 && (
                <div>
                  <p className="text-xs text-cine-muted uppercase tracking-wider mb-1">Studio</p>
                  {movie.studios.slice(0, 2).map(({ studio }) => (
                    <p key={studio.id} className="text-sm text-white">{studio.name}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Box office */}
            {(movie.budget || movie.revenue) && (
              <div className="flex gap-6 mb-6">
                {movie.budget && movie.budget > 0 && (
                  <div>
                    <p className="text-xs text-cine-muted uppercase tracking-wider mb-1">Budget</p>
                    <p className="text-white font-semibold flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-cine-gold" />
                      {(Number(movie.budget) / 1e6).toFixed(0)}M
                    </p>
                  </div>
                )}
                {movie.revenue && Number(movie.revenue) > 0 && (
                  <div>
                    <p className="text-xs text-cine-muted uppercase tracking-wider mb-1">Box Office</p>
                    <p className="text-white font-semibold flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-cine-gold" />
                      {(Number(movie.revenue) / 1e6).toFixed(0)}M
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* User Rating */}
            {isAuthenticated && (
              <div className="bg-cine-card border border-cine-border rounded-xl p-4 inline-flex items-center gap-4">
                <div>
                  <p className="text-xs text-cine-muted uppercase tracking-wider mb-1.5">Your Rating</p>
                  <StarRating
                    rating={userRating}
                    interactive
                    size="lg"
                    onChange={(v) => {
                      setUserRating(v);
                      rateMutation.mutate(v);
                    }}
                  />
                </div>
                {userRating > 0 && <span className="text-2xl font-bold text-cine-gold">{userRating}/10</span>}
              </div>
            )}
          </motion.div>
        </div>

        {/* ─── STREAMING LINKS ─────────────────────── */}
        {movie.streamingLinks && movie.streamingLinks.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-2xl text-white tracking-wider mb-4">Where to Watch</h2>
            <div className="flex gap-3 flex-wrap">
              {movie.streamingLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-cine-card border border-cine-border rounded-xl text-white text-sm font-medium hover:border-cine-gold/30 transition-all"
                >
                  {link.platform} · {link.type}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ─── CAST ────────────────────────────────── */}
        {movie.cast && movie.cast.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-2xl text-white tracking-wider mb-5">Cast</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-3">
              {cast.map(({ celebrity, character }) => (
                <Link key={celebrity.id} to={`/celebrities/${celebrity.slug}`} className="group text-center">
                  <div className="aspect-square rounded-xl overflow-hidden bg-cine-card mb-2">
                    {celebrity.profileUrl ? (
                      <img src={celebrity.profileUrl} alt={celebrity.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-cine-muted text-2xl">👤</div>
                    )}
                  </div>
                  <p className="text-xs font-medium text-white group-hover:text-cine-gold transition-colors line-clamp-2">{celebrity.name}</p>
                  {character && <p className="text-xs text-cine-muted line-clamp-1">{character}</p>}
                </Link>
              ))}
            </div>
            {(movie.cast?.length || 0) > 10 && (
              <button
                onClick={() => setShowAllCast(!showAllCast)}
                className="mt-4 flex items-center gap-1 text-sm text-cine-gold hover:text-cine-gold-dark transition-colors"
              >
                {showAllCast ? <><ChevronUp className="w-4 h-4" /> Show less</> : <><ChevronDown className="w-4 h-4" /> Show all {movie.cast?.length} cast members</>}
              </button>
            )}
          </section>
        )}

        {/* ─── AWARDS ──────────────────────────────── */}
        {movie.awards && movie.awards.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-2xl text-white tracking-wider mb-5">Awards</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {movie.awards.map((award) => (
                <div key={award.id} className={`p-4 rounded-xl border ${award.won ? 'bg-cine-gold/10 border-cine-gold/30' : 'bg-cine-card border-cine-border'}`}>
                  <div className="flex items-start gap-3">
                    <Award className={`w-5 h-5 mt-0.5 shrink-0 ${award.won ? 'text-cine-gold' : 'text-cine-muted'}`} />
                    <div>
                      <p className={`text-sm font-semibold ${award.won ? 'text-cine-gold' : 'text-white'}`}>{award.name}</p>
                      <p className="text-xs text-cine-muted">{award.category} · {award.year}</p>
                      <Badge label={award.won ? 'Won' : 'Nominated'} color={award.won ? 'gold' : 'gray'} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── REVIEWS ─────────────────────────────── */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-2xl text-white tracking-wider">
              Reviews <span className="text-cine-muted text-lg">({reviewsData?.pagination?.total || 0})</span>
            </h2>
            {isAuthenticated && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-4 py-2 bg-cine-gold text-cine-bg text-sm font-bold rounded-xl hover:bg-cine-gold-dark transition-all"
              >
                Write Review
              </button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-cine-card border border-cine-border rounded-2xl p-5 mb-6"
            >
              <h3 className="text-white font-semibold mb-4">Write Your Review</h3>
              <input
                type="text"
                placeholder="Review title (optional)"
                value={reviewData.title}
                onChange={(e) => setReviewData((p) => ({ ...p, title: e.target.value }))}
                className="w-full bg-cine-surface border border-cine-border text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cine-gold/50 mb-3"
              />
              <textarea
                placeholder="Share your thoughts about this movie..."
                rows={5}
                value={reviewData.content}
                onChange={(e) => setReviewData((p) => ({ ...p, content: e.target.value }))}
                className="w-full bg-cine-surface border border-cine-border text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cine-gold/50 resize-none mb-3"
              />
              <div className="flex items-center gap-4 flex-wrap mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-cine-muted">Rating:</span>
                  <select
                    value={reviewData.rating}
                    onChange={(e) => setReviewData((p) => ({ ...p, rating: Number(e.target.value) }))}
                    className="bg-cine-surface border border-cine-border text-white rounded-lg px-2 py-1 text-sm outline-none"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}/10</option>)}
                  </select>
                </div>
                <label className="flex items-center gap-2 text-xs text-cine-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reviewData.containsSpoiler}
                    onChange={(e) => setReviewData((p) => ({ ...p, containsSpoiler: e.target.checked }))}
                    className="rounded"
                  />
                  Contains spoilers
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => reviewMutation.mutate()}
                  disabled={!reviewData.content.trim() || reviewMutation.isPending}
                  className="px-5 py-2 bg-cine-gold text-cine-bg font-semibold text-sm rounded-xl hover:bg-cine-gold-dark transition-all disabled:opacity-50"
                >
                  {reviewMutation.isPending ? 'Posting...' : 'Post Review'}
                </button>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="px-5 py-2 border border-cine-border text-cine-muted text-sm rounded-xl hover:text-white transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {/* Reviews list */}
          {reviewsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-cine-card rounded-xl p-4 animate-pulse">
                  <div className="h-4 skeleton rounded w-1/3 mb-2" />
                  <div className="h-3 skeleton rounded w-full mb-1" />
                  <div className="h-3 skeleton rounded w-4/5" />
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-cine-muted">
              <p>No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-cine-card border border-cine-border rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {review.user.avatarUrl ? (
                        <img src={review.user.avatarUrl} alt={review.user.displayName} className="w-9 h-9 rounded-lg object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-cine-gold/20 text-cine-gold flex items-center justify-center font-bold text-sm">
                          {(review.user.displayName || review.user.username)[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-white">{review.user.displayName || review.user.username}</p>
                        <p className="text-xs text-cine-muted">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {review.rating && (
                      <div className="flex items-center gap-1 bg-cine-gold/10 px-2 py-1 rounded-lg">
                        <Star className="w-3.5 h-3.5 text-cine-gold fill-cine-gold" />
                        <span className="text-cine-gold font-bold text-sm">{review.rating}/10</span>
                      </div>
                    )}
                  </div>
                  {review.title && <h4 className="font-semibold text-white mb-2">{review.title}</h4>}
                  {review.containsSpoiler && (
                    <Badge label="⚠ Contains Spoilers" color="red" />
                  )}
                  <p className="text-cine-muted text-sm leading-relaxed mt-2">{review.content}</p>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-cine-border">
                    <span className="text-xs text-cine-muted">👍 {review._count?.likes || 0} helpful</span>
                    <span className="text-xs text-cine-muted">💬 {review._count?.comments || 0} comments</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* ─── SIMILAR MOVIES ──────────────────────── */}
        {similarData && similarData.length > 0 && (
          <section className="mt-14 mb-16">
            <h2 className="font-display text-2xl text-white tracking-wider mb-5">Similar Movies</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {similarData.slice(0, 6).map((movie, i) => <MovieCard key={movie.id} movie={movie} index={i} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default MovieDetailPage;
