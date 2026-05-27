import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PagedResponse } from '../models/api-response.model';
import { ContentSummary, ContentDetail, Genre, GenreWithContent } from '../models/content.model';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly apiUrl = `${environment.apiBaseUrl}/content`;

  constructor(private http: HttpClient) {}

  getContent(params: {
    type?: string;
    genreId?: number;
    year?: number;
    page?: number;
    size?: number;
    sortBy?: string;
  }): Observable<ApiResponse<PagedResponse<ContentSummary>>> {
    let httpParams = new HttpParams();
    if (params.type) httpParams = httpParams.set('type', params.type);
    if (params.genreId !== undefined && params.genreId !== null)
      httpParams = httpParams.set('genreId', params.genreId.toString());
    if (params.year !== undefined && params.year !== null)
      httpParams = httpParams.set('year', params.year.toString());
    if (params.page !== undefined && params.page !== null)
      httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined && params.size !== null)
      httpParams = httpParams.set('size', params.size.toString());
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    return this.http.get<ApiResponse<PagedResponse<ContentSummary>>>(this.apiUrl, {
      params: httpParams,
    });
  }

  getContentById(id: number): Observable<ApiResponse<ContentDetail>> {
    return this.http.get<ApiResponse<ContentDetail>>(`${this.apiUrl}/${id}`);
  }

  getContentBySlug(slug: string): Observable<ApiResponse<ContentDetail>> {
    return this.http.get<ApiResponse<ContentDetail>>(`${this.apiUrl}/slug/${slug}`);
  }

  getFeaturedContent(): Observable<ApiResponse<ContentSummary[]>> {
    return this.http.get<ApiResponse<ContentSummary[]>>(`${this.apiUrl}/featured`);
  }

  getTrendingContent(): Observable<ApiResponse<ContentSummary[]>> {
    return this.http.get<ApiResponse<ContentSummary[]>>(`${this.apiUrl}/trending`);
  }

  getContentByGenre(
    genreId: number,
    page = 0,
    size = 20,
  ): Observable<ApiResponse<PagedResponse<ContentSummary>>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<ApiResponse<PagedResponse<ContentSummary>>>(
      `${this.apiUrl}/genre/${genreId}`,
      { params },
    );
  }

  searchContent(
    query: string,
    page = 0,
    size = 20,
  ): Observable<ApiResponse<PagedResponse<ContentSummary>>> {
    const params = new HttpParams()
      .set('q', query)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<PagedResponse<ContentSummary>>>(`${this.apiUrl}/search`, {
      params,
    });
  }

  getAllGenres(): Observable<ApiResponse<Genre[]>> {
    return this.http.get<ApiResponse<Genre[]>>(`${this.apiUrl}/genres`);
  }

  getBrowseContent(limit = 20): Observable<ApiResponse<GenreWithContent[]>> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<ApiResponse<GenreWithContent[]>>(`${this.apiUrl}/browse`, { params });
  }
}
