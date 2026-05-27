import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Bookmark, Plus, Calendar, Clock } from 'lucide-react';
import { Movie } from '../../types';

// ─── MOVIE CARD ──────────────────────────────────────────
interface MovieCardProps {
  movie: Movie;
  index?: number;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, index = 0 }) => {
  const releaseYear = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : null;
  const genres = movie.genres?.slice(0, 2).map((g) => g.genre.name) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="movie-card group relative"
    >
      <Link to={`/movies/${movie.slug}`}>
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-cine-card">
          {movie.posterUrl ? (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-cine-card">
              <span className="text-cine-muted text-xs text-center px-2">{movie.title}</span>
            </div>
          )}

          {/* Overlay */}
          <div className="movie-overlay absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 flex flex-col justify-end">
            <div className="flex items-center gap-1 mb-1">
              <Star className="w-3 h-3 text-cine-gold fill-cine-gold" />
              <span className="text-xs text-cine-gold font-semibold">{movie.voteAverage.toFixed(1)}</span>
            </div>
            {genres.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {genres.map((g) => (
                  <span key={g} className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">{g}</span>
                ))}
              </div>
            )}
          </div>

          {/* Rating badge */}
          <div className="absolute top-2 right-2 bg-black/70 rounded-lg px-1.5 py-0.5 flex items-center gap-1">
            <Star className="w-3 h-3 text-cine-gold fill-cine-gold" />
            <span className="text-xs text-white font-medium">{movie.voteAverage.toFixed(1)}</span>
          </div>
        </div>

        <div className="mt-2.5 px-0.5">
          <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-cine-gold transition-colors leading-tight">
            {movie.title}
          </h3>
          {releaseYear && (
            <p className="text-xs text-cine-muted mt-0.5 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {releaseYear}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

// ─── SKELETON CARD ───────────────────────────────────────
export const SkeletonCard: React.FC = () => (
  <div className="animate-pulse">
    <div className="aspect-[2/3] rounded-xl skeleton" />
    <div className="mt-2.5 space-y-1.5">
      <div className="h-3.5 skeleton rounded w-3/4" />
      <div className="h-3 skeleton rounded w-1/2" />
    </div>
  </div>
);

// ─── STAR RATING ─────────────────────────────────────────
interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (val: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating, maxRating = 10, size = 'md', interactive = false, onChange,
}) => {
  const [hover, setHover] = React.useState(0);
  const stars = Math.round(maxRating / 2); // show 5 stars for 10-point scale
  const filled = Math.round(rating / 2);

  const sizeMap = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-6 h-6' };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: stars }).map((_, i) => (
        <Star
          key={i}
          className={`${sizeMap[size]} transition-colors ${
            i < (hover || filled) ? 'text-cine-gold fill-cine-gold' : 'text-cine-border'
          } ${interactive ? 'cursor-pointer' : ''}`}
          onClick={() => interactive && onChange?.(i * 2 + 2)}
          onMouseEnter={() => interactive && setHover(i + 1)}
          onMouseLeave={() => interactive && setHover(0)}
        />
      ))}
    </div>
  );
};

// ─── BADGE ───────────────────────────────────────────────
interface BadgeProps {
  label: string;
  color?: 'gold' | 'red' | 'green' | 'blue' | 'gray';
}

export const Badge: React.FC<BadgeProps> = ({ label, color = 'gray' }) => {
  const colorMap = {
    gold: 'bg-cine-gold/15 text-cine-gold border-cine-gold/30',
    red: 'bg-red-500/15 text-red-400 border-red-500/30',
    green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    gray: 'bg-white/10 text-cine-muted border-white/10',
  };
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${colorMap[color]}`}>
      {label}
    </span>
  );
};

// ─── SECTION HEADER ──────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  link?: string;
  linkLabel?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, link, linkLabel }) => (
  <div className="flex items-end justify-between mb-6">
    <div>
      <h2 className="text-2xl md:text-3xl font-display text-white tracking-wider">{title}</h2>
      {subtitle && <p className="text-cine-muted text-sm mt-1">{subtitle}</p>}
    </div>
    {link && (
      <a href={link} className="text-sm text-cine-gold hover:text-cine-gold-dark transition-colors flex items-center gap-1">
        {linkLabel || 'View all'} →
      </a>
    )}
  </div>
);

// ─── GENRE PILL ──────────────────────────────────────────
interface GenrePillProps {
  name: string;
  slug: string;
  active?: boolean;
  onClick?: () => void;
}

export const GenrePill: React.FC<GenrePillProps> = ({ name, slug, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${
      active
        ? 'bg-cine-gold text-cine-bg border-cine-gold'
        : 'bg-cine-card text-cine-muted border-cine-border hover:border-cine-gold/30 hover:text-white'
    }`}
  >
    {name}
  </button>
);

// ─── LOADING SPINNER ─────────────────────────────────────
export const LoadingSpinner: React.FC<{ size?: number }> = ({ size = 8 }) => (
  <div className="flex items-center justify-center">
    <div
      className={`w-${size} h-${size} border-2 border-cine-border border-t-cine-gold rounded-full animate-spin`}
    />
  </div>
);

// ─── EMPTY STATE ─────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    {icon && <div className="mb-4 text-cine-muted opacity-50">{icon}</div>}
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    {description && <p className="text-cine-muted text-sm max-w-sm mb-6">{description}</p>}
    {action}
  </div>
);
