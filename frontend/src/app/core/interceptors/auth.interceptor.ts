import { HttpInterceptorFn, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { AuthService } from '../services/auth.service';

const REFRESH_FAILED = 'REFRESH_FAILED';
const AUTH_EXCLUDED_URLS = ['/auth/login', '/auth/register', '/auth/refresh'];

@Injectable({ providedIn: 'root' })
export class AuthInterceptorState {
  isRefreshing = false;
  refreshTokenSubject = new BehaviorSubject<string | null>(null);
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(StorageService);
  const authService = inject(AuthService);
  const state = inject(AuthInterceptorState);

  const token = storage.getAccessToken();
  let authReq = req;

  // Don't attach token to auth endpoints
  if (token && !AUTH_EXCLUDED_URLS.some((url) => req.url.includes(url))) {
    authReq = addTokenHeader(req, token);
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/')) {
        if (!state.isRefreshing) {
          state.isRefreshing = true;
          state.refreshTokenSubject.next(null);

          return authService.refreshToken().pipe(
            switchMap((res) => {
              state.isRefreshing = false;
              if (res.success && res.data) {
                state.refreshTokenSubject.next(res.data.accessToken);
                return next(addTokenHeader(authReq, res.data.accessToken));
              }
              state.refreshTokenSubject.next(REFRESH_FAILED);
              authService.logout();
              return throwError(() => error);
            }),
            catchError((refreshError) => {
              state.isRefreshing = false;
              state.refreshTokenSubject.next(REFRESH_FAILED);
              authService.logout();
              return throwError(() => refreshError);
            }),
          );
        }

        // Queue concurrent requests — wait for the refresh to complete
        return state.refreshTokenSubject.pipe(
          filter((token) => token !== null),
          take(1),
          switchMap((newToken) => {
            if (newToken === REFRESH_FAILED) {
              return throwError(() => error);
            }
            return next(addTokenHeader(authReq, newToken));
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};

function addTokenHeader(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}
