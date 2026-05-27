import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { StorageService } from './storage.service';
import { Profile } from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

export interface ProfileCreateRequest {
  name: string;
  avatarUrl?: string;
  isKids?: boolean;
  language?: string;
}

export interface ProfileUpdateRequest {
  name?: string;
  avatarUrl?: string;
  isKids?: boolean;
  language?: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly apiUrl = `${environment.apiBaseUrl}/profiles`;

  private activeProfile = signal<Profile | null>(null);
  private profiles = signal<Profile[]>([]);

  readonly profile = this.activeProfile.asReadonly();
  readonly profileId = computed(() => this.activeProfile()?.id ?? null);
  readonly allProfiles = this.profiles.asReadonly();

  constructor(
    private http: HttpClient,
    private storage: StorageService,
  ) {
    this.loadFromStorage();
  }

  setActiveProfile(profile: Profile): void {
    this.activeProfile.set(profile);
    this.storage.setProfileId(profile.id);
  }

  clearActiveProfile(): void {
    this.activeProfile.set(null);
    this.storage.clearProfileId();
  }

  getProfileIdOrThrow(): number {
    const id = this.profileId();
    if (id === null) {
      throw new Error('No active profile selected');
    }
    return id;
  }

  fetchProfiles(): Observable<ApiResponse<Profile[]>> {
    return this.http.get<ApiResponse<Profile[]>>(this.apiUrl).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.profiles.set(res.data);
          // If active profile was loaded from storage, enrich it with full data
          const currentId = this.profileId();
          if (currentId !== null) {
            const full = res.data.find((p) => p.id === currentId);
            if (full) {
              this.activeProfile.set(full);
            }
          }
        }
      }),
    );
  }

  getProfile(profileId: number): Observable<ApiResponse<Profile>> {
    return this.http.get<ApiResponse<Profile>>(`${this.apiUrl}/${profileId}`);
  }

  createProfile(request: ProfileCreateRequest): Observable<ApiResponse<Profile>> {
    return this.http.post<ApiResponse<Profile>>(this.apiUrl, request);
  }

  updateProfile(profileId: number, request: ProfileUpdateRequest): Observable<ApiResponse<Profile>> {
    return this.http.put<ApiResponse<Profile>>(`${this.apiUrl}/${profileId}`, request);
  }

  deleteProfile(profileId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${profileId}`);
  }

  private loadFromStorage(): void {
    const id = this.storage.getProfileId();
    if (id !== null) {
      this.activeProfile.set({ id, name: '', isKids: false, language: 'en' });
    }
  }
}
