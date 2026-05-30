import { Component, input, signal, ElementRef, viewChild } from '@angular/core';
import { ContentSummary } from '../../../core/models/content.model';
import { ContentCardComponent } from '../content-card/content-card.component';

@Component({
  selector: 'app-content-carousel',
  standalone: true,
  imports: [ContentCardComponent],
  template: `
    <div class="mb-8">
      <h2 class="text-xl font-bold mb-3 px-2">{{ title() }}</h2>
      <div class="relative group/carousel">
        <!-- Left arrow -->
        <button
          (click)="scroll(-1)"
          class="absolute left-0 top-0 bottom-0 z-10 w-10 bg-black/50 flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          aria-label="Scroll left"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <!-- Content row -->
        <div
          #scrollContainer
          class="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth px-2"
        >
          @for (item of items(); track item.id) {
            <app-content-card [item]="item" />
          }
        </div>

        <!-- Right arrow -->
        <button
          (click)="scroll(1)"
          class="absolute right-0 top-0 bottom-0 z-10 w-10 bg-black/50 flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          aria-label="Scroll right"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: `
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
  `,
})
export class ContentCarouselComponent {
  title = input.required<string>();
  items = input.required<ContentSummary[]>();

  scrollContainer = viewChild.required<ElementRef<HTMLDivElement>>('scrollContainer');

  scroll(direction: number): void {
    const container = this.scrollContainer().nativeElement;
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
  }
}
