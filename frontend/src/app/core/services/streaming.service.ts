import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { StreamTokenResponse } from '../models/watchlist.model';

@Injectable({ providedIn: 'root' })
export class StreamingService {
  private readonly apiUrl = `${environment.apiBaseUrl}/streaming`;

  constructor(private http: HttpClient) {}

  getStreamToken(contentId: number): Observable<ApiResponse<StreamTokenResponse>> {
    return this.http.post<ApiResponse<StreamTokenResponse>>(
      `${this.apiUrl}/token/${contentId}`,
      {},
    );
  }
}
