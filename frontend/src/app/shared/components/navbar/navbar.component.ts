import { Component, signal, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { NavigationStart, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription, filter } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule],
  template: `
    <nav
      class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 py-3 transition-colors duration-300"
      [class]="scrolled() ? 'bg-neutral-950' : 'bg-gradient-to-b from-black/90 to-transparent'"
    >
      <div class="flex items-center gap-6">
        <a routerLink="/browse" class="text-2xl font-bold text-red-600">STREAMFLIX</a>
        <div class="hidden md:flex gap-5 text-sm">
          <a
            routerLink="/browse"
            routerLinkActive="font-bold text-white"
            [routerLinkActiveOptions]="{ exact: true }"
            class="text-neutral-300 hover:text-white transition-colors"
            >Home</a
          >
          <a
            routerLink="/search"
            routerLinkActive="font-bold text-white"
            class="text-neutral-300 hover:text-white transition-colors"
            >Search</a
          >
          <a
            routerLink="/watchlist"
            routerLinkActive="font-bold text-white"
            class="text-neutral-300 hover:text-white transition-colors"
            >My List</a
          >
          @if (authService.isAdmin()) {
            <a
              routerLink="/admin"
              routerLinkActive="font-bold text-white"
              class="text-neutral-300 hover:text-white transition-colors"
              >Admin</a
            >
          }
        </div>
      </div>

      <div class="flex items-center gap-4">
        <!-- Search icon + inline search -->
        @if (searchOpen()) {
          <div class="flex items-center bg-neutral-900 border border-neutral-600 rounded px-2">
            <svg
              class="w-4 h-4 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (keydown.enter)="onSearch()"
              (keydown.escape)="closeSearch()"
              placeholder="Titles, genres..."
              class="bg-transparent border-none outline-none text-sm px-2 py-1.5 w-48 text-white placeholder-neutral-500"
              autofocus
            />
          </div>
        } @else {
          <button
            (click)="searchOpen.set(true)"
            class="text-neutral-300 hover:text-white transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        }

        <!-- Profile dropdown -->
        <div class="relative" #profileDropdown>
          <button
            (click)="profileOpen.set(!profileOpen())"
            class="flex items-center gap-2 text-sm text-neutral-300 hover:text-white transition-colors"
          >
            <div
              class="w-8 h-8 rounded bg-red-700 flex items-center justify-center text-white font-bold text-sm"
            >
              {{ getInitial() }}
            </div>
            <svg
              class="w-4 h-4 transition-transform"
              [class.rotate-180]="profileOpen()"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          @if (profileOpen()) {
            <div
              class="absolute right-0 top-full mt-2 w-48 bg-neutral-900 border border-neutral-700 rounded-md shadow-lg py-1 z-50"
            >
              <a
                routerLink="/profiles"
                (click)="profileOpen.set(false)"
                class="block px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
              >
                Manage Profiles
              </a>
              <a
                routerLink="/subscription"
                (click)="profileOpen.set(false)"
                class="block px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
              >
                Subscription
              </a>
              <hr class="border-neutral-700 my-1" />
              <button
                (click)="authService.logout()"
                class="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
              >
                Sign Out
              </button>
            </div>
          }
        </div>
      </div>
    </nav>
  `,
})
export class NavbarComponent implements OnDestroy {
  @ViewChild('profileDropdown', { static: true }) profileDropdownRef!: ElementRef;

  searchOpen = signal(false);
  searchQuery = '';
  profileOpen = signal(false);
  scrolled = signal(false);

  private routerSub: Subscription;
  private scrollHandler = () => this.scrolled.set(window.scrollY > 50);
  private clickHandler = (e: MouseEvent) => {
    if (
      this.profileOpen() &&
      this.profileDropdownRef &&
      !this.profileDropdownRef.nativeElement.contains(e.target as Node)
    ) {
      this.profileOpen.set(false);
    }
  };

  constructor(
    public authService: AuthService,
    private router: Router,
  ) {
    // Close dropdown on route navigation
    this.routerSub = this.router.events
      .pipe(filter((e) => e instanceof NavigationStart))
      .subscribe(() => {
        this.profileOpen.set(false);
        this.searchOpen.set(false);
      });

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', this.scrollHandler, { passive: true });
      window.addEventListener('click', this.clickHandler);
    }
  }

  ngOnDestroy(): void {
    this.routerSub.unsubscribe();
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.scrollHandler);
      window.removeEventListener('click', this.clickHandler);
    }
  }

  getInitial(): string {
    const name = this.authService.user()?.fullName;
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery.trim() } });
      this.searchQuery = '';
      this.searchOpen.set(false);
    }
  }

  closeSearch(): void {
    this.searchQuery = '';
    this.searchOpen.set(false);
  }
}
