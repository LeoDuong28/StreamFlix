import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, EMPTY } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { RatingDto, RateRequest } from '../models/watchlist.model';
import { ProfileService } from './profile.service';

@Injectable({ providedIn: 'root' })
export class RatingService {
  private readonly baseUrl = `${environment.apiBaseUrl}/profiles`;

  constructor(
    private http: HttpClient,
    private profileService: ProfileService,
  ) {}

  rateContent(request: RateRequest): Observable<ApiResponse<RatingDto>> {
    const profileId = this.profileService.profileId();
    if (profileId === null) return EMPTY;
    return this.http.post<ApiResponse<RatingDto>>(
      `${this.baseUrl}/${profileId}/ratings`,
      request,
    );
  }

  getRating(contentId: number): Observable<ApiResponse<RatingDto>> {
    const profileId = this.profileService.profileId();
    if (profileId === null) return EMPTY;
    return this.http.get<ApiResponse<RatingDto>>(
      `${this.baseUrl}/${profileId}/ratings/${contentId}`,
    );
  }

  deleteRating(contentId: number): Observable<ApiResponse<void>> {
    const profileId = this.profileService.profileId();
    if (profileId === null) return EMPTY;
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/${profileId}/ratings/${contentId}`,
    );
  }
}
