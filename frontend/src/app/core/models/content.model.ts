export interface Genre {
  id: number;
  name: string;
}

export interface ContentSummary {
  id: number;
  title: string;
  slug: string;
  type: 'MOVIE' | 'SERIES';
  posterPath: string | null;
  backdropPath: string | null;
  maturityRating: string;
  isPremium: boolean;
  voteAverage: number;
  releaseYear: number | null;
  runtime: number | null;
  genres: Genre[];
}

export interface Episode {
  id: number;
  episodeNumber: number;
  name: string;
  overview: string | null;
  runtime: number | null;
  stillPath: string | null;
  videoUrl: string | null;
  airDate: string | null;
}

export interface Season {
  id: number;
  seasonNumber: number;
  name: string;
  overview: string | null;
  posterPath: string | null;
  airDate: string | null;
  episodes: Episode[];
}

export interface ContentDetail {
  id: number;
  title: string;
  slug: string;
  overview: string | null;
  type: 'MOVIE' | 'SERIES';
  releaseDate: string | null;
  runtime: number | null;
  posterPath: string | null;
  backdropPath: string | null;
  trailerUrl: string | null;
  videoUrl: string | null;
  maturityRating: string;
  isPremium: boolean;
  isFeatured: boolean;
  voteAverage: number;
  voteCount: number;
  genres: Genre[];
  seasons: Season[];
}

export interface GenreWithContent {
  id: number;
  name: string;
  content: ContentSummary[];
}
