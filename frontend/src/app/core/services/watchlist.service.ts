import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, EMPTY } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PagedResponse } from '../models/api-response.model';
import { WatchlistItem } from '../models/watchlist.model';
import { ProfileService } from './profile.service';

@Injectable({ providedIn: 'root' })
export class WatchlistService {
  private readonly baseUrl = `${environment.apiBaseUrl}/profiles`;

  constructor(
    private http: HttpClient,
    private profileService: ProfileService,
  ) {}

  getWatchlist(page = 0, size = 20): Observable<ApiResponse<PagedResponse<WatchlistItem>>> {
    const profileId = this.profileService.profileId();
    if (profileId === null) return EMPTY;
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<ApiResponse<PagedResponse<WatchlistItem>>>(
      `${this.baseUrl}/${profileId}/watchlist`,
      { params },
    );
  }

  addToWatchlist(contentId: number): Observable<ApiResponse<WatchlistItem>> {
    const profileId = this.profileService.profileId();
    if (profileId === null) return EMPTY;
    return this.http.post<ApiResponse<WatchlistItem>>(
      `${this.baseUrl}/${profileId}/watchlist/${contentId}`,
      {},
    );
  }

  removeFromWatchlist(contentId: number): Observable<ApiResponse<void>> {
    const profileId = this.profileService.profileId();
    if (profileId === null) return EMPTY;
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/${profileId}/watchlist/${contentId}`,
    );
  }

  isInWatchlist(contentId: number): Observable<ApiResponse<boolean>> {
    const profileId = this.profileService.profileId();
    if (profileId === null) return EMPTY;
    return this.http.get<ApiResponse<boolean>>(
      `${this.baseUrl}/${profileId}/watchlist/${contentId}/status`,
    );
  }
}
