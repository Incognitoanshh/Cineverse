import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Instagram,
  Twitter,
  Globe,
  Award,
  User,
} from 'lucide-react';

import { celebrityAPI } from '../lib/api';
import { Badge, LoadingSpinner } from '../components/ui';
import { Celebrity } from '../types';

const CelebrityDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: celebrity, isLoading } = useQuery({
    queryKey: ['celebrity', slug],
    queryFn: () =>
      celebrityAPI
        .getBySlug(slug!)
        .then((r) => r.data.data as Celebrity),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <LoadingSpinner size={12} />
      </div>
    );
  }

  if (!celebrity) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <p className="text-cine-muted">Celebrity not found.</p>
      </div>
    );
  }

  const age = celebrity.birthday
    ? Math.floor(
        (new Date().getTime() -
          new Date(celebrity.birthday).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {/* Profile photo */}
          <div className="shrink-0 w-48 md:w-64 mx-auto md:mx-0">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-card border border-cine-border">
              {celebrity.profileUrl ? (
                <img
                  src={celebrity.profileUrl}
                  alt={celebrity.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-cine-card flex items-center justify-center">
                  <User className="w-16 h-16 text-cine-muted" />
                </div>
              )}
            </div>

            {/* Social links */}
            <div className="flex gap-2 mt-4 justify-center md:justify-start flex-wrap">
              {celebrity.instagram && (
                <a
                  href={`https://instagram.com/${celebrity.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-cine-card border border-cine-border rounded-lg hover:border-cine-gold/30 transition-all"
                >
                  <Instagram className="w-4 h-4 text-cine-muted" />
                </a>
              )}

              {celebrity.twitter && (
                <a
                  href={`https://twitter.com/${celebrity.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-cine-card border border-cine-border rounded-lg hover:border-cine-gold/30 transition-all"
                >
                  <Twitter className="w-4 h-4 text-cine-muted" />
                </a>
              )}

              {celebrity.website && (
                <a
                  href={celebrity.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-cine-card border border-cine-border rounded-lg hover:border-cine-gold/30 transition-all"
                >
                  <Globe className="w-4 h-4 text-cine-muted" />
                </a>
              )}
            </div>
          </div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1"
          >
            {celebrity.knownForDept && (
              <Badge label={celebrity.knownForDept} color="gold" />
            )}

            <h1 className="font-display text-4xl md:text-5xl text-white tracking-wider mt-3 mb-4">
              {celebrity.name}
            </h1>

            <div className="flex flex-wrap gap-5 mb-6 text-sm text-cine-muted">
              {celebrity.birthday && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(celebrity.birthday).toLocaleDateString(
                    'en-US',
                    {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }
                  )}
                  {age ? ` (${age} years old)` : ''}
                </div>
              )}

              {celebrity.birthPlace && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {celebrity.birthPlace}
                </div>
              )}
            </div>

            {celebrity.biography && (
              <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                  Biography
                </h3>

                <p className="text-cine-muted leading-relaxed text-sm max-w-2xl">
                  {celebrity.biography}
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Filmography */}
        {celebrity.movieCast && celebrity.movieCast.length > 0 && (
          <section className="mb-12">
            <h2 className="font-display text-2xl text-white tracking-wider mb-5">
              Filmography
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {celebrity.movieCast
                .slice(0, 100)
                .map((cast: any) => {
                  const { movie, character } = cast;

                  return (
                    <Link
                      key={movie.id}
                      to={`/movies/${movie.slug}`}
                      className="group"
                    >
                      <div className="aspect-[2/3] rounded-xl overflow-hidden bg-cine-card mb-2">
                        {movie.posterUrl ? (
                          <img
                            src={movie.posterUrl}
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-cine-muted text-xs text-center px-2">
                            {movie.title}
                          </div>
                        )}
                      </div>

                      <h3 className="text-xs font-semibold text-white group-hover:text-cine-gold transition-colors line-clamp-2">
                        {movie.title}
                      </h3>

                      {character && (
                        <p className="text-xs text-cine-muted">
                          {character}
                        </p>
                      )}

                      {movie.releaseDate && (
                        <p className="text-xs text-cine-muted">
                          {new Date(movie.releaseDate).getFullYear()}
                        </p>
                      )}
                    </Link>
                  );
                })}
            </div>
          </section>
        )}

        {/* Awards */}
        {celebrity.awards && celebrity.awards.length > 0 && (
          <section>
            <h2 className="font-display text-2xl text-white tracking-wider mb-5">
              Awards
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {celebrity.awards.map((award: any) => (
                <div
                  key={award.id}
                  className={`p-4 rounded-xl border ${
                    award.won
                      ? 'bg-cine-gold/10 border-cine-gold/30'
                      : 'bg-cine-card border-cine-border'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Award
                      className={`w-5 h-5 mt-0.5 ${
                        award.won
                          ? 'text-cine-gold'
                          : 'text-cine-muted'
                      }`}
                    />

                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          award.won
                            ? 'text-cine-gold'
                            : 'text-white'
                        }`}
                      >
                        {award.name}
                      </p>

                      <p className="text-xs text-cine-muted">
                        {award.category} · {award.year}
                      </p>

                      <Badge
                        label={award.won ? 'Won' : 'Nominated'}
                        color={award.won ? 'gold' : 'gray'}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default CelebrityDetailPage;