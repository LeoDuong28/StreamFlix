import { Component, input, output, signal, computed, effect } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  template: `
    <div class="flex items-center gap-1">
      @for (star of stars; track star) {
        <button
          (click)="onStarClick(star)"
          (mouseenter)="hoverRating.set(star)"
          (mouseleave)="hoverRating.set(0)"
          class="transition-transform hover:scale-125 focus:outline-none"
          [class.cursor-pointer]="!readonly()"
          [class.cursor-default]="readonly()"
          [attr.aria-label]="star + ' star' + (star > 1 ? 's' : '')"
        >
          <svg
            class="w-6 h-6"
            [class.w-5]="size() === 'sm'"
            [class.h-5]="size() === 'sm'"
            [class.w-7]="size() === 'lg'"
            [class.h-7]="size() === 'lg'"
            [class.text-yellow-400]="star <= displayRating()"
            [class.text-neutral-600]="star > displayRating()"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            />
          </svg>
        </button>
      }
      @if (showLabel() && currentRating()) {
        <span class="ml-2 text-sm text-neutral-400">{{ currentRating() }}/5</span>
      }
    </div>
  `,
})
export class StarRatingComponent {
  rating = input<number | null>(null);
  readonly = input(false);
  size = input<'sm' | 'md' | 'lg'>('md');
  showLabel = input(true);

  ratingChange = output<number>();

  stars = [1, 2, 3, 4, 5];
  currentRating = signal(0);
  hoverRating = signal(0);
  displayRating = computed(() => this.hoverRating() || this.currentRating());

  constructor() {
    effect(
      () => {
        this.currentRating.set(this.rating() ?? 0);
      },
      { allowSignalWrites: true },
    );
  }

  onStarClick(star: number): void {
    if (this.readonly()) return;
    if (star === this.currentRating()) {
      this.currentRating.set(0);
    } else {
      this.currentRating.set(star);
    }
    this.ratingChange.emit(this.currentRating());
  }
}
