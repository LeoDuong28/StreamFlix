import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiBaseUrl}/auth`;
  private currentUser = signal<User | null>(null);

  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly isAdmin = computed(() => this.currentUser()?.roles?.includes('ROLE_ADMIN') ?? false);
  readonly isPremium = computed(() => this.currentUser()?.roles?.includes('ROLE_PREMIUM') ?? false);

  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private router: Router,
  ) {
    this.loadUserFromStorage();
  }

  register(request: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, request)
      .pipe(tap((res) => this.handleAuthResponse(res)));
  }

  login(request: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, request)
      .pipe(tap((res) => this.handleAuthResponse(res)));
  }

  refreshToken(): Observable<ApiResponse<AuthResponse>> {
    const refreshToken = this.storage.getRefreshToken();
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.apiUrl}/refresh`, {
        refreshToken,
      })
      .pipe(tap((res) => this.handleAuthResponse(res)));
  }

  logout(): void {
    // Capture token before clearing storage so the logout request is authenticated
    const token = this.storage.getAccessToken();
    this.storage.clear();
    this.currentUser.set(null);
    this.router.navigate(['/login']);
    // Best-effort server-side invalidation (fire and forget)
    if (token) {
      this.http
        .post(
          `${this.apiUrl}/logout`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        .subscribe();
    }
  }

  private handleAuthResponse(res: ApiResponse<AuthResponse>): void {
    if (res.success && res.data) {
      this.storage.setAccessToken(res.data.accessToken);
      this.storage.setRefreshToken(res.data.refreshToken);
      const user: User = {
        email: res.data.email,
        fullName: res.data.fullName,
        roles: res.data.roles,
      };
      this.storage.setUser(user);
      this.currentUser.set(user);
    }
  }

  private loadUserFromStorage(): void {
    const user = this.storage.getUser();
    if (user && this.storage.getAccessToken()) {
      this.currentUser.set(user);
    }
  }
}
