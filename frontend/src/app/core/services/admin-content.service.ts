import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PagedResponse } from '../models/api-response.model';
import { ContentDetail, ContentSummary } from '../models/content.model';

export interface ContentCreateRequest {
  title: string;
  overview?: string;
  type: 'MOVIE' | 'SERIES';
  releaseDate?: string;
  runtime?: number;
  posterPath?: string;
  backdropPath?: string;
  trailerUrl?: string;
  videoUrl?: string;
  maturityRating?: string;
  isPremium?: boolean;
  isFeatured?: boolean;
  genreIds?: number[];
}

export interface ContentUpdateRequest {
  title?: string;
  overview?: string;
  type?: 'MOVIE' | 'SERIES';
  releaseDate?: string;
  runtime?: number;
  posterPath?: string;
  backdropPath?: string;
  trailerUrl?: string;
  videoUrl?: string;
  maturityRating?: string;
  isPremium?: boolean;
  isFeatured?: boolean;
  genreIds?: number[];
}

@Injectable({ providedIn: 'root' })
export class AdminContentService {
  private readonly apiUrl = `${environment.apiBaseUrl}/admin/content`;

  constructor(private http: HttpClient) {}

  createContent(request: ContentCreateRequest): Observable<ApiResponse<ContentDetail>> {
    return this.http.post<ApiResponse<ContentDetail>>(this.apiUrl, request);
  }

  updateContent(id: number, request: ContentUpdateRequest): Observable<ApiResponse<ContentDetail>> {
    return this.http.put<ApiResponse<ContentDetail>>(`${this.apiUrl}/${id}`, request);
  }

  deleteContent(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  importMovie(tmdbId: number): Observable<ApiResponse<ContentDetail>> {
    return this.http.post<ApiResponse<ContentDetail>>(`${this.apiUrl}/import/movie/${tmdbId}`, {});
  }

  importSeries(tmdbId: number): Observable<ApiResponse<ContentDetail>> {
    return this.http.post<ApiResponse<ContentDetail>>(`${this.apiUrl}/import/series/${tmdbId}`, {});
  }

  syncGenres(): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/import/sync-genres`, {});
  }

  searchTmdbMovies(query: string): Observable<ApiResponse<any[]>> {
    const params = new HttpParams().set('q', query);
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/tmdb/search/movie`, { params });
  }

  searchTmdbSeries(query: string): Observable<ApiResponse<any[]>> {
    const params = new HttpParams().set('q', query);
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/tmdb/search/series`, { params });
  }
}
