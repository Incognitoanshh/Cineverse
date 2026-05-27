export interface Movie {
  id: string;
  title: string;
  slug: string;
  overview?: string;
  tagline?: string;
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  releaseDate?: string;
  runtime?: number;
  budget?: number;
  revenue?: number;
  popularity: number;
  voteAverage: number;
  voteCount: number;
  status?: string;
  originalLanguage?: string;
  isAdult: boolean;
  genres?: { genre: Genre }[];
  cast?: CastMember[];
  crew?: CrewMember[];
  studios?: { studio: Studio }[];
  awards?: Award[];
  streamingLinks?: StreamingLink[];
  _count?: { reviews: number };
}

export interface TVShow {
  id: string;
  title: string;
  slug: string;
  overview?: string;
  posterUrl?: string;
  backdropUrl?: string;
  firstAirDate?: string;
  lastAirDate?: string;
  numberOfSeasons: number;
  numberOfEpisodes: number;
  voteAverage: number;
  voteCount: number;
  status?: string;
  genres?: { genre: Genre }[];
  seasons?: Season[];
  cast?: TVCastMember[];
  streamingLinks?: StreamingLink[];
}

export interface Season {
  id: string;
  seasonNumber: number;
  name?: string;
  overview?: string;
  posterUrl?: string;
  airDate?: string;
  episodes?: Episode[];
}

export interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  overview?: string;
  stillUrl?: string;
  airDate?: string;
  runtime?: number;
  voteAverage: number;
}

export interface Celebrity {
  id: string;
  name: string;
  slug: string;
  biography?: string;
  profileUrl?: string;
  birthday?: string;
  deathday?: string;
  birthPlace?: string;
  gender: string;
  popularity: number;
  knownForDept?: string;
  website?: string;
  instagram?: string;
  twitter?: string;
  movieCast?: { movie: Partial<Movie>; character?: string }[];
  awards?: Award[];
}

export interface CastMember {
  celebrity: {
    id: string;
    name: string;
    slug: string;
    profileUrl?: string;
  };
  character?: string;
  order: number;
}

export interface CrewMember {
  celebrity: {
    id: string;
    name: string;
    slug: string;
    profileUrl?: string;
  };
  job: string;
  department?: string;
}

export interface TVCastMember {
  celebrity: {
    id: string;
    name: string;
    slug: string;
    profileUrl?: string;
  };
  character?: string;
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
}

export interface Studio {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface Award {
  id: string;
  name: string;
  category: string;
  year: number;
  won: boolean;
}

export interface StreamingLink {
  id: string;
  platform: string;
  url: string;
  type: string;
  country?: string;
}

export interface Review {
  id: string;
  userId: string;
  content: string;
  title?: string;
  rating?: number;
  containsSpoiler: boolean;
  status: string;
  helpfulCount: number;
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  _count?: { likes: number; comments: number };
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
