import { Component, input, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ContentSummary } from '../../../core/models/content.model';
import { TmdbImagePipe } from '../../pipes/tmdb-image.pipe';

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [RouterLink, TmdbImagePipe, DecimalPipe],
  template: `
    @if (currentItem(); as item) {
      <div class="relative h-[80vh] w-full overflow-hidden">
        <!-- Backdrop image -->
        <div class="absolute inset-0">
          <img
            [src]="item.backdropPath | tmdbImage: 'original'"
            [alt]="item.title"
            class="w-full h-full object-cover"
          />
          <!-- Gradient overlays -->
          <div
            class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"
          ></div>
          <div
            class="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent"
          ></div>
        </div>

        <!-- Content -->
        <div class="relative h-full flex flex-col justify-end pb-24 px-8 md:px-16 max-w-2xl">
          <h1 class="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">{{ item.title }}</h1>
          <div class="flex items-center gap-3 mb-4 text-sm">
            @if (item.voteAverage) {
              <span class="text-green-400 font-semibold"
                >{{ item.voteAverage * 10 | number: '1.0-0' }}% Match</span
              >
            }
            @if (item.releaseYear) {
              <span>{{ item.releaseYear }}</span>
            }
            <span class="border border-neutral-400 px-1.5 py-0.5 text-xs">{{
              item.maturityRating
            }}</span>
            @if (item.runtime) {
              <span>{{ formatRuntime(item.runtime) }}</span>
            }
          </div>

          <div class="flex gap-3 mb-4">
            <a
              [routerLink]="['/player', item.id]"
              class="flex items-center gap-2 px-6 py-2 bg-white text-black font-semibold rounded hover:bg-white/80 transition"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Play
            </a>
            <a
              [routerLink]="['/detail', item.id]"
              class="flex items-center gap-2 px-6 py-2 bg-neutral-600/70 text-white font-semibold rounded hover:bg-neutral-600 transition"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              More Info
            </a>
          </div>

          <!-- Genre tags -->
          <div class="flex gap-2 flex-wrap">
            @for (genre of item.genres; track genre.id) {
              <span class="text-xs text-neutral-400">{{ genre.name }}</span>
              @if (!$last) {
                <span class="text-xs text-neutral-600">|</span>
              }
            }
          </div>
        </div>

        <!-- Dots indicator -->
        @if (items().length > 1) {
          <div class="absolute bottom-8 right-8 flex gap-2">
            @for (item of items(); track item.id; let i = $index) {
              <button
                (click)="goTo(i)"
                class="w-2.5 h-2.5 rounded-full transition-colors"
                [class]="i === currentIndex() ? 'bg-white' : 'bg-white/40'"
                [attr.aria-label]="'Go to slide ' + (i + 1)"
              ></button>
            }
          </div>
        }
      </div>
    }
  `,
})
export class HeroBannerComponent implements OnInit, OnDestroy {
  items = input.required<ContentSummary[]>();
  currentIndex = signal(0);
  currentItem = computed(() => {
    const list = this.items();
    return list.length > 0 ? list[this.currentIndex()] : null;
  });

  private intervalId: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    if (this.items().length > 1) {
      this.intervalId = setInterval(() => {
        this.currentIndex.set((this.currentIndex() + 1) % this.items().length);
      }, 8000);
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  goTo(index: number): void {
    this.currentIndex.set(index);
  }

  formatRuntime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }
}
