import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProfileService, ProfileCreateRequest } from '../../../core/services/profile.service';
import { Profile } from '../../../core/models/user.model';

const AVATAR_COLORS = [
  'bg-red-700',
  'bg-blue-700',
  'bg-green-700',
  'bg-yellow-600',
  'bg-purple-700',
  'bg-pink-700',
  'bg-teal-700',
  'bg-orange-700',
];

@Component({
  selector: 'app-profile-select',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen bg-neutral-950 flex flex-col items-center justify-center px-4">
      <h1 class="text-3xl md:text-5xl font-bold text-white mb-2">Who's Watching?</h1>

      @if (editing()) {
        <!-- Edit/Create Profile Form -->
        <div class="mt-10 bg-neutral-900 rounded-lg p-8 w-full max-w-md">
          <h2 class="text-xl font-semibold text-white mb-6">
            {{ editingProfile() ? 'Edit Profile' : 'Add Profile' }}
          </h2>

          <div class="space-y-4">
            <div>
              <label class="block text-sm text-neutral-400 mb-1">Name</label>
              <input
                type="text"
                [(ngModel)]="formName"
                maxlength="50"
                class="w-full bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-white focus:outline-none focus:border-red-600"
                placeholder="Profile name"
              />
            </div>

            <div class="flex items-center gap-3">
              <input
                type="checkbox"
                [(ngModel)]="formIsKids"
                id="isKids"
                class="w-4 h-4 accent-red-600"
              />
              <label for="isKids" class="text-sm text-neutral-300">Kids Profile</label>
            </div>

            <div>
              <label class="block text-sm text-neutral-400 mb-1">Language</label>
              <select
                [(ngModel)]="formLanguage"
                class="w-full bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-white focus:outline-none focus:border-red-600"
              >
                <option value="en">English</option>
                <option value="vi">Vietnamese</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
              </select>
            </div>
          </div>

          @if (formError()) {
            <p class="mt-3 text-sm text-red-500">{{ formError() }}</p>
          }

          <div class="flex gap-3 mt-6">
            <button
              (click)="saveProfile()"
              [disabled]="saving()"
              class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-semibold transition-colors disabled:opacity-50"
            >
              {{ saving() ? 'Saving...' : 'Save' }}
            </button>
            @if (editingProfile()) {
              <button
                (click)="confirmDelete()"
                [disabled]="saving()"
                class="bg-neutral-700 hover:bg-neutral-600 text-white py-2 px-4 rounded font-semibold transition-colors disabled:opacity-50"
              >
                Delete
              </button>
            }
            <button
              (click)="cancelEdit()"
              class="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white py-2 px-4 rounded font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      } @else {
        <!-- Profile Grid -->
        <div class="flex flex-wrap justify-center gap-6 mt-10">
          @for (profile of profiles(); track profile.id) {
            <div
              class="group flex flex-col items-center cursor-pointer"
              (click)="selectProfile(profile)"
            >
              <div
                class="w-24 h-24 md:w-32 md:h-32 rounded-md flex items-center justify-center text-3xl md:text-4xl font-bold text-white transition-all group-hover:ring-2 group-hover:ring-white {{
                  getColor(profile)
                }}"
              >
                {{ getInitial(profile) }}
              </div>
              <span
                class="mt-2 text-neutral-400 group-hover:text-white transition-colors text-sm md:text-base"
              >
                {{ profile.name }}
              </span>
              @if (profile.isKids) {
                <span class="text-xs text-blue-400 mt-0.5">KIDS</span>
              }
              <button
                (click)="editProfile(profile, $event)"
                class="mt-1 text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                Edit
              </button>
            </div>
          }

          <!-- Add Profile Button -->
          @if (profiles().length < 5) {
            <div class="group flex flex-col items-center cursor-pointer" (click)="startCreate()">
              <div
                class="w-24 h-24 md:w-32 md:h-32 rounded-md bg-neutral-800 flex items-center justify-center text-4xl text-neutral-500 transition-all group-hover:bg-neutral-700 group-hover:text-white"
              >
                +
              </div>
              <span
                class="mt-2 text-neutral-400 group-hover:text-white transition-colors text-sm md:text-base"
              >
                Add Profile
              </span>
            </div>
          }
        </div>

        @if (manageMode()) {
          <button
            (click)="manageMode.set(false)"
            class="mt-8 border border-neutral-500 text-neutral-300 hover:text-white hover:border-white px-8 py-2 text-sm tracking-wider transition-colors"
          >
            DONE
          </button>
        } @else {
          <button
            (click)="manageMode.set(true)"
            class="mt-8 border border-neutral-500 text-neutral-300 hover:text-white hover:border-white px-8 py-2 text-sm tracking-wider transition-colors"
          >
            MANAGE PROFILES
          </button>
        }
      }
    </div>
  `,
})
export class ProfileSelectComponent implements OnInit {
  profiles = signal<Profile[]>([]);
  editing = signal(false);
  editingProfile = signal<Profile | null>(null);
  manageMode = signal(false);
  saving = signal(false);
  formError = signal('');

  formName = '';
  formIsKids = false;
  formLanguage = 'en';

  constructor(
    private profileService: ProfileService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadProfiles();
  }

  loadProfiles(): void {
    this.profileService.fetchProfiles().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.profiles.set(res.data);
        }
      },
    });
  }

  selectProfile(profile: Profile): void {
    this.profileService.setActiveProfile(profile);
    this.router.navigate(['/browse']);
  }

  getInitial(profile: Profile): string {
    return profile.name ? profile.name.charAt(0).toUpperCase() : '?';
  }

  getColor(profile: Profile): string {
    return AVATAR_COLORS[profile.id % AVATAR_COLORS.length];
  }

  startCreate(): void {
    this.formName = '';
    this.formIsKids = false;
    this.formLanguage = 'en';
    this.formError.set('');
    this.editingProfile.set(null);
    this.editing.set(true);
  }

  editProfile(profile: Profile, event: Event): void {
    event.stopPropagation();
    this.formName = profile.name;
    this.formIsKids = profile.isKids;
    this.formLanguage = profile.language;
    this.formError.set('');
    this.editingProfile.set(profile);
    this.editing.set(true);
  }

  cancelEdit(): void {
    this.editing.set(false);
    this.editingProfile.set(null);
    this.formError.set('');
  }

  saveProfile(): void {
    if (!this.formName.trim()) {
      this.formError.set('Name is required');
      return;
    }

    this.saving.set(true);
    this.formError.set('');

    const existing = this.editingProfile();
    if (existing) {
      this.profileService
        .updateProfile(existing.id, {
          name: this.formName.trim(),
          isKids: this.formIsKids,
          language: this.formLanguage,
        })
        .subscribe({
          next: () => {
            this.saving.set(false);
            this.editing.set(false);
            this.loadProfiles();
          },
          error: (err) => {
            this.saving.set(false);
            this.formError.set(err.error?.message || 'Failed to update profile');
          },
        });
    } else {
      const request: ProfileCreateRequest = {
        name: this.formName.trim(),
        isKids: this.formIsKids,
        language: this.formLanguage,
      };
      this.profileService.createProfile(request).subscribe({
        next: () => {
          this.saving.set(false);
          this.editing.set(false);
          this.loadProfiles();
        },
        error: (err) => {
          this.saving.set(false);
          this.formError.set(err.error?.message || 'Failed to create profile');
        },
      });
    }
  }

  confirmDelete(): void {
    const profile = this.editingProfile();
    if (!profile) return;

    if (!confirm(`Delete profile "${profile.name}"? This cannot be undone.`)) return;

    this.saving.set(true);
    this.profileService.deleteProfile(profile.id).subscribe({
      next: () => {
        this.saving.set(false);
        this.editing.set(false);
        // If deleted profile was active, clear it and stay on profile select
        if (this.profileService.profileId() === profile.id) {
          this.profileService.clearActiveProfile();
          this.router.navigate(['/profiles']);
        }
        this.loadProfiles();
      },
      error: (err) => {
        this.saving.set(false);
        this.formError.set(err.error?.message || 'Failed to delete profile');
      },
    });
  }
}
