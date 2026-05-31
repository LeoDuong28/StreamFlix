import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly ACCESS_TOKEN_KEY = 'sf_access_token';
  private readonly REFRESH_TOKEN_KEY = 'sf_refresh_token';
  private readonly USER_KEY = 'sf_user';
  private readonly PROFILE_ID_KEY = 'sf_profile_id';

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  getUser(): User | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (
        typeof parsed?.email !== 'string' ||
        typeof parsed?.fullName !== 'string' ||
        !Array.isArray(parsed?.roles)
      ) {
        return null;
      }
      return parsed as User;
    } catch {
      return null;
    }
  }

  setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getProfileId(): number | null {
    const val = localStorage.getItem(this.PROFILE_ID_KEY);
    if (!val) return null;
    const parsed = Number(val);
    return isNaN(parsed) ? null : parsed;
  }

  setProfileId(profileId: number): void {
    localStorage.setItem(this.PROFILE_ID_KEY, profileId.toString());
  }

  clearProfileId(): void {
    localStorage.removeItem(this.PROFILE_ID_KEY);
  }

  clear(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.PROFILE_ID_KEY);
  }
}
