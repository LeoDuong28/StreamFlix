import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { HeroBannerComponent } from '../../shared/components/hero-banner/hero-banner.component';
import { ContentCarouselComponent } from '../../shared/components/content-carousel/content-carousel.component';
import { ContentService } from '../../core/services/content.service';
import { WatchHistoryService } from '../../core/services/watch-history.service';
import { ProfileService } from '../../core/services/profile.service';
import { ContentSummary, GenreWithContent } from '../../core/models/content.model';
import { WatchHistoryItem } from '../../core/models/watchlist.model';
import { TmdbImagePipe } from '../../shared/pipes/tmdb-image.pipe';

@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [
    NavbarComponent,
    HeroBannerComponent,
    ContentCarouselComponent,
    RouterLink,
    TmdbImagePipe,
  ],
  template: `
    <app-navbar />

    @if (loading()) {
      <div class="flex items-center justify-center h-screen">
        <div
          class="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"
        ></div>
      </div>
    } @else {
      <!-- Hero Banner -->
      @if (featured().length > 0) {
        <app-hero-banner [items]="featured()" />
      }

      <!-- Content rows -->
      <div class="px-4 md:px-8 -mt-16 relative z-10 pb-16">
        <!-- Continue Watching -->
        @if (continueWatching().length > 0) {
          <section class="mb-8">
            <h2 class="text-xl font-bold mb-3">Continue Watching</h2>
            <div class="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
              @for (item of continueWatching(); track item.id) {
                <a
                  [routerLink]="['/player', item.content.id]"
                  class="flex-shrink-0 w-64 bg-neutral-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-white transition group"
                >
                  <div class="relative aspect-video">
                    <img
                      [src]="item.content.backdropPath | tmdbImage: 'w500'"
                      [alt]="item.content.title"
                      class="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div
                      class="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  <!-- Progress bar -->
                  <div class="h-1 bg-neutral-700">
                    <div class="h-full bg-red-600" [style.width.%]="getProgressPercent(item)"></div>
                  </div>
                  <div class="p-2">
                    <p class="text-sm font-medium truncate">{{ item.content.title }}</p>
                  </div>
                </a>
              }
            </div>
          </section>
        }

        @if (trending().length > 0) {
          <app-content-carousel title="Trending Now" [items]="trending()" />
        }

        @for (genre of genreRows(); track genre.id) {
          <app-content-carousel [title]="genre.name" [items]="genre.content" />
        }
      </div>

      @if (error()) {
        <div class="text-center py-20">
          <p class="text-neutral-400 text-lg">{{ error() }}</p>
          <button
            (click)="loadContent()"
            class="mt-4 px-6 py-2 bg-red-600 rounded hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      }
    }
  `,
  styles: `
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `,
})
export class BrowseComponent implements OnInit, OnDestroy {
  featured = signal<ContentSummary[]>([]);
  trending = signal<ContentSummary[]>([]);
  genreRows = signal<GenreWithContent[]>([]);
  continueWatching = signal<WatchHistoryItem[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  private loadSub?: Subscription;
  private historySub?: Subscription;

  constructor(
    private contentService: ContentService,
    private watchHistoryService: WatchHistoryService,
    private profileService: ProfileService,
  ) {}

  ngOnInit(): void {
    this.loadContent();
  }

  ngOnDestroy(): void {
    this.loadSub?.unsubscribe();
    this.historySub?.unsubscribe();
  }

  loadContent(): void {
    this.loading.set(true);
    this.error.set(null);
    this.loadSub?.unsubscribe();

    this.loadSub = forkJoin({
      featured: this.contentService.getFeaturedContent(),
      trending: this.contentService.getTrendingContent(),
      browse: this.contentService.getBrowseContent(20),
    }).subscribe({
      next: ({ featured, trending, browse }) => {
        if (featured.success && featured.data) this.featured.set(featured.data);
        if (trending.success && trending.data) this.trending.set(trending.data);
        if (browse.success && browse.data) this.genreRows.set(browse.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load content. Please try again.');
        this.loading.set(false);
      },
    });

    // Load continue watching separately (only if profile is selected)
    if (this.profileService.profileId() !== null) {
      this.historySub?.unsubscribe();
      this.historySub = this.watchHistoryService.getContinueWatching(10).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.continueWatching.set(res.data);
          }
        },
        error: () => {},
      });
    }
  }

  getProgressPercent(item: WatchHistoryItem): number {
    if (!item.durationSeconds || item.durationSeconds === 0) return 0;
    return Math.min((item.progressSeconds / item.durationSeconds) * 100, 100);
  }
}
