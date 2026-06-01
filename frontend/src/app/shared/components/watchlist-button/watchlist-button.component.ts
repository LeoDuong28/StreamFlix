import { Component, input, signal, effect, OnDestroy, computed } from '@angular/core';
import { Subscription } from 'rxjs';
import { WatchlistService } from '../../../core/services/watchlist.service';

@Component({
  selector: 'app-watchlist-button',
  standalone: true,
  template: `
    <button
      (click)="toggle($event)"
      [class]="buttonClass()"
      [title]="inWatchlist() ? 'Remove from My List' : 'Add to My List'"
      [disabled]="loading()"
    >
      @if (loading()) {
        <div
          class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
        ></div>
      } @else if (inWatchlist()) {
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      } @else {
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
      }
    </button>
  `,
})
export class WatchlistButtonComponent implements OnDestroy {
  contentId = input.required<number>();
  variant = input<'icon' | 'pill'>('icon');

  inWatchlist = signal(false);
  loading = signal(false);

  buttonClass = computed(() => {
    if (this.variant() === 'pill') {
      return `flex items-center justify-center gap-2 px-4 py-2 rounded transition text-sm font-medium ${
        this.inWatchlist()
          ? 'bg-neutral-700 hover:bg-neutral-600'
          : 'bg-neutral-800 hover:bg-neutral-700 border border-neutral-600'
      }`;
    }
    return `flex items-center justify-center w-9 h-9 rounded-full border-2 transition ${
      this.inWatchlist()
        ? 'border-white bg-white/20 hover:bg-white/30'
        : 'border-neutral-400 hover:border-white'
    }`;
  });

  private checkSub?: Subscription;
  private toggleSub?: Subscription;

  constructor(private watchlistService: WatchlistService) {
    effect(
      () => {
        const id = this.contentId();
        this.checkSub?.unsubscribe();
        this.checkSub = this.watchlistService.isInWatchlist(id).subscribe({
          next: (res) => {
            if (res.success && res.data !== undefined) {
              this.inWatchlist.set(res.data);
            }
          },
        });
      },
      { allowSignalWrites: true },
    );
  }

  ngOnDestroy(): void {
    this.checkSub?.unsubscribe();
    this.toggleSub?.unsubscribe();
  }

  toggle(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    if (this.loading()) return;

    this.loading.set(true);
    this.toggleSub?.unsubscribe();

    if (this.inWatchlist()) {
      this.toggleSub = this.watchlistService.removeFromWatchlist(this.contentId()).subscribe({
        next: () => {
          this.inWatchlist.set(false);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    } else {
      this.toggleSub = this.watchlistService.addToWatchlist(this.contentId()).subscribe({
        next: () => {
          this.inWatchlist.set(true);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    }
  }
}
