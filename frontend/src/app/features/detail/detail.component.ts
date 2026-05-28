import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { TmdbImagePipe } from '../../shared/pipes/tmdb-image.pipe';
import { GenreNamesPipe } from '../../shared/pipes/genre-names.pipe';
import { StarRatingComponent } from '../../shared/components/star-rating/star-rating.component';
import { WatchlistButtonComponent } from '../../shared/components/watchlist-button/watchlist-button.component';
import { ContentService } from '../../core/services/content.service';
import { RatingService } from '../../core/services/rating.service';
import { ProfileService } from '../../core/services/profile.service';
import { ContentDetail, Season } from '../../core/models/content.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [
    NavbarComponent,
    RouterLink,
    TmdbImagePipe,
    GenreNamesPipe,
    DatePipe,
    DecimalPipe,
    StarRatingComponent,
    WatchlistButtonComponent,
  ],
  template: `
    <app-navbar />

    @if (loading()) {
      <div class="flex items-center justify-center h-screen">
        <div
          class="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"
        ></div>
      </div>
    } @else if (content(); as c) {
      <!-- Backdrop -->
      <div class="relative">
        <div class="h-[60vh] overflow-hidden">
          <img
            [src]="c.backdropPath | tmdbImage: 'original'"
            [alt]="c.title"
            class="w-full h-full object-cover"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-transparent"
          ></div>
        </div>

        <!-- Content info overlay -->
        <div class="absolute bottom-0 left-0 right-0 px-8 md:px-16 pb-8">
          <h1 class="text-4xl md:text-5xl font-bold mb-4">{{ c.title }}</h1>

          <div class="flex items-center gap-3 mb-4 text-sm">
            @if (c.voteAverage) {
              <span class="text-green-400 font-semibold"
                >{{ c.voteAverage * 10 | number: '1.0-0' }}% Match</span
              >
            }
            @if (c.releaseDate) {
              <span>{{ c.releaseDate | date: 'yyyy' }}</span>
            }
            <span class="border border-neutral-400 px-1.5 py-0.5 text-xs">{{
              c.maturityRating
            }}</span>
            @if (c.runtime) {
              <span>{{ formatRuntime(c.runtime) }}</span>
            }
            <span class="text-xs uppercase bg-neutral-700 px-2 py-0.5 rounded">{{ c.type }}</span>
          </div>

          <div class="flex items-center gap-3 mb-6">
            <a
              [routerLink]="['/player', c.id]"
              class="flex items-center gap-2 px-8 py-3 bg-white text-black font-semibold rounded hover:bg-white/80 transition text-lg"
            >
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Play
            </a>

            @if (hasProfile()) {
              <app-watchlist-button [contentId]="c.id" />
            }
          </div>
        </div>
      </div>

      <!-- Details section -->
      <div class="px-8 md:px-16 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="md:col-span-2">
          @if (c.overview) {
            <p class="text-neutral-300 text-lg leading-relaxed mb-6">{{ c.overview }}</p>
          }

          <!-- Rating section -->
          @if (hasProfile()) {
            <div class="mb-8 flex items-center gap-4">
              <span class="text-neutral-400">Your Rating:</span>
              <app-star-rating [rating]="userScore()" (ratingChange)="onRatingChange($event)" />
              @if (averageScore() !== null) {
                <span class="text-neutral-500 text-sm ml-4">
                  Avg: {{ averageScore() | number: '1.1-1' }} ({{ totalRatings() }} ratings)
                </span>
              }
            </div>
          }

          <!-- Trailer embed -->
          @if (trailerEmbedUrl()) {
            <div class="mb-8">
              <h2 class="text-2xl font-bold mb-4">Trailer</h2>
              <div class="relative pb-[56.25%]">
                <iframe
                  [src]="trailerEmbedUrl()"
                  class="absolute inset-0 w-full h-full rounded-lg"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                ></iframe>
              </div>
            </div>
          }

          <!-- Episodes (for series) -->
          @if (c.type === 'SERIES' && c.seasons.length > 0) {
            <div>
              <div class="flex items-center gap-4 mb-4">
                <h2 class="text-2xl font-bold">Episodes</h2>
                <select
                  (change)="selectSeason($event)"
                  class="bg-neutral-800 border border-neutral-600 rounded px-3 py-1.5 text-sm"
                >
                  @for (season of c.seasons; track season.id) {
                    <option
                      [value]="season.seasonNumber"
                      [selected]="season.seasonNumber === selectedSeason()?.seasonNumber"
                    >
                      {{ season.name || 'Season ' + season.seasonNumber }}
                    </option>
                  }
                </select>
              </div>

              @if (selectedSeason(); as season) {
                <div class="space-y-3">
                  @for (ep of season.episodes; track ep.id) {
                    <div
                      class="flex gap-4 p-4 bg-neutral-800/50 rounded-lg hover:bg-neutral-800 transition group"
                    >
                      <div
                        class="flex-shrink-0 w-8 text-center text-neutral-500 font-bold text-xl self-center"
                      >
                        {{ ep.episodeNumber }}
                      </div>
                      @if (ep.stillPath) {
                        <img
                          [src]="ep.stillPath | tmdbImage: 'w300'"
                          [alt]="ep.name"
                          class="w-32 aspect-video object-cover rounded flex-shrink-0"
                          loading="lazy"
                        />
                      }
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between mb-1">
                          <h3 class="font-semibold truncate">{{ ep.name }}</h3>
                          @if (ep.runtime) {
                            <span class="text-sm text-neutral-500 flex-shrink-0 ml-2"
                              >{{ ep.runtime }}m</span
                            >
                          }
                        </div>
                        @if (ep.overview) {
                          <p class="text-sm text-neutral-400 line-clamp-2">{{ ep.overview }}</p>
                        }
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>

        <!-- Sidebar -->
        <div>
          <div class="space-y-3 text-sm">
            @if (c.genres.length > 0) {
              <div>
                <span class="text-neutral-500">Genres: </span>
                <span>{{ c.genres | genreNames }}</span>
              </div>
            }
            @if (c.voteCount) {
              <div>
                <span class="text-neutral-500">Votes: </span>
                <span>{{ c.voteCount | number }}</span>
              </div>
            }
            @if (c.isPremium) {
              <div
                class="inline-block bg-yellow-600 text-white px-3 py-1 rounded text-xs font-semibold"
              >
                PREMIUM CONTENT
              </div>
            }
          </div>
        </div>
      </div>
    } @else {
      <div class="flex items-center justify-center h-screen">
        <p class="text-neutral-400 text-lg">Content not found.</p>
      </div>
    }
  `,
})
export class DetailComponent implements OnInit, OnDestroy {
  content = signal<ContentDetail | null>(null);
  selectedSeason = signal<Season | null>(null);
  trailerEmbedUrl = signal<SafeResourceUrl | null>(null);
  loading = signal(true);
  hasProfile = computed(() => this.profileService.profileId() !== null);
  userScore = signal<number | null>(null);
  averageScore = signal<number | null>(null);
  totalRatings = signal(0);

  private routeSub?: Subscription;
  private contentSub?: Subscription;
  private ratingSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private contentService: ContentService,
    private ratingService: RatingService,
    private profileService: ProfileService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (!isNaN(id) && id > 0) {
        this.loadContent(id);
      } else {
        this.loading.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.contentSub?.unsubscribe();
    this.ratingSub?.unsubscribe();
  }

  onRatingChange(score: number): void {
    const c = this.content();
    if (!c) return;

    this.ratingSub?.unsubscribe();
    if (score === 0) {
      this.ratingSub = this.ratingService.deleteRating(c.id).subscribe({
        next: () => {
          this.userScore.set(null);
          this.loadRating(c.id);
        },
      });
    } else {
      this.ratingSub = this.ratingService.rateContent({ contentId: c.id, score }).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.userScore.set(res.data.userScore);
            this.averageScore.set(res.data.averageScore);
            this.totalRatings.set(res.data.totalRatings);
          }
        },
      });
    }
  }

  private loadContent(id: number): void {
    this.loading.set(true);
    this.contentSub?.unsubscribe();
    this.contentSub = this.contentService.getContentById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.content.set(res.data);
          if (res.data.seasons?.length > 0) {
            this.selectedSeason.set(res.data.seasons[0]);
          } else {
            this.selectedSeason.set(null);
          }
          if (res.data.trailerUrl) {
            this.trailerEmbedUrl.set(this.buildEmbedUrl(res.data.trailerUrl));
          } else {
            this.trailerEmbedUrl.set(null);
          }
          if (this.hasProfile()) {
            this.loadRating(id);
          }
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private loadRating(contentId: number): void {
    this.ratingSub?.unsubscribe();
    this.ratingSub = this.ratingService.getRating(contentId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.userScore.set(res.data.userScore);
          this.averageScore.set(res.data.averageScore);
          this.totalRatings.set(res.data.totalRatings);
        }
      },
      error: () => {
        this.userScore.set(null);
        this.averageScore.set(null);
        this.totalRatings.set(0);
      },
    });
  }

  selectSeason(event: Event): void {
    const seasonNumber = Number((event.target as HTMLSelectElement).value);
    const season = this.content()?.seasons.find((s) => s.seasonNumber === seasonNumber);
    if (season) this.selectedSeason.set(season);
  }

  formatRuntime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  private buildEmbedUrl(url: string): SafeResourceUrl | null {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{5,20})/);
    if (match) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube.com/embed/${match[1]}`,
      );
    }
    return null;
  }
}
