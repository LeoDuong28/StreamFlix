import { ContentSummary } from './content.model';

export interface WatchlistItem {
  id: number;
  content: ContentSummary;
  addedAt: string;
}

export interface WatchHistoryItem {
  id: number;
  content: ContentSummary;
  episodeId: number | null;
  episodeNumber: number | null;
  episodeTitle: string | null;
  progressSeconds: number;
  durationSeconds: number;
  completed: boolean;
  lastWatchedAt: string;
}

export interface ProgressUpdateRequest {
  contentId: number;
  episodeId?: number;
  progressSeconds: number;
  durationSeconds?: number;
}

export interface RatingDto {
  contentId: number;
  userScore: number | null;
  averageScore: number | null;
  totalRatings: number;
}

export interface RateRequest {
  contentId: number;
  score: number;
}

export interface StreamTokenResponse {
  streamUrl: string;
  token: string;
  expiresAt: number;
}
