import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { ContentCardComponent } from '../../shared/components/content-card/content-card.component';
import { WatchlistService } from '../../core/services/watchlist.service';
import { WatchlistItem } from '../../core/models/watchlist.model';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [NavbarComponent, ContentCardComponent, RouterLink],
  template: `
    <app-navbar />

    <div class="pt-20 px-4 md:px-8 pb-16 min-h-screen">
      <h1 class="text-3xl font-bold mb-8">My List</h1>

      @if (loading()) {
        <div class="flex items-center justify-center py-20">
          <div
            class="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"
          ></div>
        </div>
      } @else if (items().length === 0) {
        <div class="text-center py-20">
          <svg
            class="w-16 h-16 mx-auto mb-4 text-neutral-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <p class="text-neutral-400 text-lg mb-2">Your list is empty</p>
          <p class="text-neutral-500 mb-6">
            Browse content and add titles you want to watch later.
          </p>
          <a
            routerLink="/browse"
            class="px-6 py-3 bg-white text-black font-semibold rounded hover:bg-white/80 transition"
            >Browse Content</a
          >
        </div>
      } @else {
        <div
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
        >
          @for (item of items(); track item.id) {
            <div class="relative group">
              <app-content-card [item]="item.content" />
              <button
                (click)="removeItem(item.content.id)"
                class="absolute top-2 right-2 w-8 h-8 bg-black/70 rounded-full flex items-center justify-center
                       opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                title="Remove from list"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                  />
                </svg>
              </button>
            </div>
          }
        </div>

        <!-- Load more -->
        @if (!lastPage()) {
          <div class="text-center mt-8">
            <button
              (click)="loadMore()"
              class="px-6 py-2 bg-neutral-800 rounded hover:bg-neutral-700 transition"
            >
              Load More
            </button>
          </div>
        }
      }
    </div>
  `,
})
export class WatchlistComponent implements OnInit, OnDestroy {
  items = signal<WatchlistItem[]>([]);
  loading = signal(true);
  lastPage = signal(false);

  private currentPage = 0;
  private loadSub?: Subscription;

  constructor(private watchlistService: WatchlistService) {}

  ngOnInit(): void {
    this.loadPage(0);
  }

  ngOnDestroy(): void {
    this.loadSub?.unsubscribe();
  }

  loadMore(): void {
    this.loadPage(this.currentPage + 1);
  }

  removeItem(contentId: number): void {
    this.watchlistService.removeFromWatchlist(contentId).subscribe({
      next: () => {
        this.items.update((list) => list.filter((i) => i.content.id !== contentId));
      },
    });
  }

  private loadPage(page: number): void {
    if (page === 0) this.loading.set(true);
    this.loadSub?.unsubscribe();
    this.loadSub = this.watchlistService.getWatchlist(page).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          if (page === 0) {
            this.items.set(res.data.content);
          } else {
            this.items.update((list) => [...list, ...res.data!.content]);
          }
          this.currentPage = page;
          this.lastPage.set(res.data.last);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
