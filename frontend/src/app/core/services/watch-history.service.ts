import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, EMPTY } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { WatchHistoryItem, ProgressUpdateRequest } from '../models/watchlist.model';
import { ProfileService } from './profile.service';

@Injectable({ providedIn: 'root' })
export class WatchHistoryService {
  private readonly baseUrl = `${environment.apiBaseUrl}/profiles`;

  constructor(
    private http: HttpClient,
    private profileService: ProfileService,
  ) {}

  updateProgress(request: ProgressUpdateRequest): Observable<ApiResponse<WatchHistoryItem>> {
    const profileId = this.profileService.profileId();
    if (profileId === null) return EMPTY;
    return this.http.post<ApiResponse<WatchHistoryItem>>(
      `${this.baseUrl}/${profileId}/history/progress`,
      request,
    );
  }

  getContinueWatching(limit = 20): Observable<ApiResponse<WatchHistoryItem[]>> {
    const profileId = this.profileService.profileId();
    if (profileId === null) return EMPTY;
    return this.http.get<ApiResponse<WatchHistoryItem[]>>(
      `${this.baseUrl}/${profileId}/history/continue-watching`,
      { params: { limit: limit.toString() } },
    );
  }

  getRecentlyWatched(limit = 20): Observable<ApiResponse<WatchHistoryItem[]>> {
    const profileId = this.profileService.profileId();
    if (profileId === null) return EMPTY;
    return this.http.get<ApiResponse<WatchHistoryItem[]>>(
      `${this.baseUrl}/${profileId}/history/recently-watched`,
      { params: { limit: limit.toString() } },
    );
  }
}
