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
  Star,
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
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* HERO SECTION */}
        <div className="relative rounded-3xl overflow-hidden mb-14 border border-cine-border">
          
          {/* BACKDROP */}
          {celebrity.backdropUrl && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-20"
              style={{
                backgroundImage: `url(${celebrity.backdropUrl})`,
              }}
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/40" />

          <div className="relative p-6 md:p-10 flex flex-col md:flex-row gap-10">
            
            {/* PROFILE IMAGE */}
            <div className="shrink-0 w-52 md:w-72 mx-auto md:mx-0">
              <div className="aspect-[3/4] rounded-3xl overflow-hidden border border-cine-border shadow-2xl">
                {celebrity.profileUrl ? (
                  <img
                    src={celebrity.profileUrl}
                    alt={celebrity.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-cine-card flex items-center justify-center">
                    <User className="w-20 h-20 text-cine-muted" />
                  </div>
                )}
              </div>

              {/* SOCIALS */}
              <div className="flex gap-3 mt-5 flex-wrap justify-center md:justify-start">
                {celebrity.instagram && (
                  <a
                    href={`https://instagram.com/${celebrity.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-cine-card border border-cine-border hover:border-cine-gold transition-all"
                  >
                    <Instagram className="w-5 h-5 text-white" />
                  </a>
                )}

                {celebrity.twitter && (
                  <a
                    href={`https://twitter.com/${celebrity.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-cine-card border border-cine-border hover:border-cine-gold transition-all"
                  >
                    <Twitter className="w-5 h-5 text-white" />
                  </a>
                )}

                {celebrity.website && (
                  <a
                    href={celebrity.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-cine-card border border-cine-border hover:border-cine-gold transition-all"
                  >
                    <Globe className="w-5 h-5 text-white" />
                  </a>
                )}
              </div>
            </div>

            {/* INFO */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1"
            >
              {celebrity.knownForDept && (
                <Badge label={celebrity.knownForDept} color="gold" />
              )}

              <h1 className="font-display text-4xl md:text-6xl text-white tracking-wider mt-4 mb-5">
                {celebrity.name}
              </h1>

              <div className="flex flex-wrap gap-6 text-sm text-cine-muted mb-8">
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

              {/* STATS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                
                <div className="bg-cine-card/80 border border-cine-border rounded-2xl p-4">
                  <p className="text-cine-muted text-xs uppercase">
                    Movies
                  </p>

                  <p className="text-3xl font-bold text-white mt-2">
                    {celebrity.movieCast?.length || 0}
                  </p>
                </div>

                <div className="bg-cine-card/80 border border-cine-border rounded-2xl p-4">
                  <p className="text-cine-muted text-xs uppercase">
                    Awards
                  </p>

                  <p className="text-3xl font-bold text-white mt-2">
                    {celebrity.awards?.length || 0}
                  </p>
                </div>

                <div className="bg-cine-card/80 border border-cine-border rounded-2xl p-4">
                  <p className="text-cine-muted text-xs uppercase">
                    Department
                  </p>

                  <p className="text-white font-semibold mt-2">
                    {celebrity.knownForDept || 'Acting'}
                  </p>
                </div>

                <div className="bg-cine-card/80 border border-cine-border rounded-2xl p-4">
                  <p className="text-cine-muted text-xs uppercase">
                    Popularity
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <Star className="w-5 h-5 text-cine-gold fill-cine-gold" />

                    <p className="text-2xl font-bold text-white">
                      {Math.floor(Math.random() * 100)}
                    </p>
                  </div>
                </div>
              </div>

              {/* BIOGRAPHY */}
              {celebrity.biography && (
                <div>
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                    Biography
                  </h3>

                  <p className="text-cine-muted leading-relaxed max-w-3xl">
                    {celebrity.biography}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* KNOWN FOR */}
        {celebrity.movieCast && celebrity.movieCast.length > 0 && (
          <section className="mb-14">
            <h2 className="font-display text-2xl text-white tracking-wider mb-6">
              Known For
            </h2>

            <div className="flex gap-5 overflow-x-auto pb-3 scrollbar-hide">
              {celebrity.movieCast.slice(0, 10).map((cast: any) => (
                <Link
                  key={cast.movie.id}
                  to={`/movies/${cast.movie.slug}`}
                  className="min-w-[190px] group"
                >
                  <div className="aspect-[2/3] rounded-2xl overflow-hidden border border-cine-border bg-cine-card mb-3">
                    {cast.movie.posterUrl ? (
                      <img
                        src={cast.movie.posterUrl}
                        alt={cast.movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-cine-muted text-sm text-center p-4">
                        {cast.movie.title}
                      </div>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-white group-hover:text-cine-gold transition-colors line-clamp-2">
                    {cast.movie.title}
                  </h3>

                  {cast.character && (
                    <p className="text-xs text-cine-muted mt-1">
                      {cast.character}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* PERSONAL DETAILS */}
        <section className="mb-14">
          <h2 className="font-display text-2xl text-white tracking-wider mb-6">
            Personal Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            <div className="bg-cine-card border border-cine-border rounded-2xl p-5">
              <p className="text-cine-muted text-sm mb-1">
                Born
              </p>

              <p className="text-white font-medium">
                {celebrity.birthday || 'Unknown'}
              </p>
            </div>

            <div className="bg-cine-card border border-cine-border rounded-2xl p-5">
              <p className="text-cine-muted text-sm mb-1">
                Birth Place
              </p>

              <p className="text-white font-medium">
                {celebrity.birthPlace || 'Unknown'}
              </p>
            </div>

            <div className="bg-cine-card border border-cine-border rounded-2xl p-5">
              <p className="text-cine-muted text-sm mb-1">
                Department
              </p>

              <p className="text-white font-medium">
                {celebrity.knownForDept || 'Acting'}
              </p>
            </div>

            <div className="bg-cine-card border border-cine-border rounded-2xl p-5">
              <p className="text-cine-muted text-sm mb-1">
                Known Credits
              </p>

              <p className="text-white font-medium">
                {celebrity.movieCast?.length || 0} Titles
              </p>
            </div>
          </div>
        </section>

        {/* FILMOGRAPHY */}
        {celebrity.movieCast && celebrity.movieCast.length > 0 && (
          <section className="mb-14">
            <h2 className="font-display text-2xl text-white tracking-wider mb-6">
              Filmography
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {celebrity.movieCast.slice(0, 100).map((cast: any) => {
                const { movie, character } = cast;

                return (
                  <Link
                    key={movie.id}
                    to={`/movies/${movie.slug}`}
                    className="group"
                  >
                    <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-cine-card border border-cine-border mb-3">
                      {movie.posterUrl ? (
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-cine-muted text-xs text-center px-2">
                          {movie.title}
                        </div>
                      )}
                    </div>

                    <h3 className="text-sm font-semibold text-white group-hover:text-cine-gold transition-colors line-clamp-2">
                      {movie.title}
                    </h3>

                    {character && (
                      <p className="text-xs text-cine-muted mt-1">
                        {character}
                      </p>
                    )}

                    {movie.releaseDate && (
                      <p className="text-xs text-cine-muted mt-1">
                        {new Date(movie.releaseDate).getFullYear()}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* AWARDS */}
        {celebrity.awards && celebrity.awards.length > 0 && (
          <section className="mb-14">
            <h2 className="font-display text-2xl text-white tracking-wider mb-6">
              Awards
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {celebrity.awards.map((award: any) => (
                <div
                  key={award.id}
                  className={`p-5 rounded-2xl border ${
                    award.won
                      ? 'bg-cine-gold/10 border-cine-gold/30'
                      : 'bg-cine-card border-cine-border'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <Award
                      className={`w-6 h-6 mt-1 ${
                        award.won
                          ? 'text-cine-gold'
                          : 'text-cine-muted'
                      }`}
                    />

                    <div>
                      <p
                        className={`font-semibold ${
                          award.won
                            ? 'text-cine-gold'
                            : 'text-white'
                        }`}
                      >
                        {award.name}
                      </p>

                      <p className="text-sm text-cine-muted mt-1">
                        {award.category} · {award.year}
                      </p>

                      <div className="mt-3">
                        <Badge
                          label={award.won ? 'Won' : 'Nominated'}
                          color={award.won ? 'gold' : 'gray'}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PHOTOS */}
        {celebrity.images && celebrity.images.length > 0 && (
          <section>
            <h2 className="font-display text-2xl text-white tracking-wider mb-6">
              Photos
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {celebrity.images.slice(0, 12).map((img: any) => (
                <div
                  key={img.id}
                  className="rounded-2xl overflow-hidden border border-cine-border bg-cine-card"
                >
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover aspect-square hover:scale-105 transition-transform duration-500"
                  />
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