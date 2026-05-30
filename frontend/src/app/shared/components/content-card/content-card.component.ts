import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ContentSummary } from '../../../core/models/content.model';
import { TmdbImagePipe } from '../../pipes/tmdb-image.pipe';

@Component({
  selector: 'app-content-card',
  standalone: true,
  imports: [RouterLink, TmdbImagePipe, DecimalPipe],
  template: `
    <a
      [routerLink]="['/detail', item().id]"
      class="group relative block flex-shrink-0 w-[180px] cursor-pointer transition-transform duration-300 hover:scale-110 hover:z-10"
    >
      <img
        [src]="item().posterPath | tmdbImage"
        [alt]="item().title"
        class="w-full aspect-[2/3] object-cover rounded-md"
        loading="lazy"
      />
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md flex flex-col justify-end p-3"
      >
        <h3 class="text-sm font-semibold line-clamp-2">{{ item().title }}</h3>
        <div class="flex items-center gap-2 mt-1 text-xs text-neutral-400">
          @if (item().releaseYear) {
            <span>{{ item().releaseYear }}</span>
          }
          @if (item().voteAverage) {
            <span class="text-green-400">{{ item().voteAverage | number: '1.1-1' }}</span>
          }
          <span class="uppercase text-[10px] border border-neutral-500 px-1 rounded">{{
            item().maturityRating
          }}</span>
        </div>
        @if (item().isPremium) {
          <span
            class="mt-1 inline-block text-[10px] bg-yellow-600 text-white px-1.5 py-0.5 rounded w-fit"
            >PREMIUM</span
          >
        }
      </div>
    </a>
  `,
})
export class ContentCardComponent {
  item = input.required<ContentSummary>();
}
