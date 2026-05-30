import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { ContentCardComponent } from '../../shared/components/content-card/content-card.component';
import { ContentService } from '../../core/services/content.service';
import { ContentSummary, Genre } from '../../core/models/content.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [NavbarComponent, ContentCardComponent, FormsModule],
  template: `
    <app-navbar />
    <div class="min-h-screen bg-neutral-950 pt-20 px-4 md:px-8">
      <!-- Search Input -->
      <div class="max-w-2xl mx-auto mb-8">
        <div class="relative">
          <svg
            class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400"
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
            (ngModelChange)="onQueryChange($event)"
            placeholder="Search titles, genres..."
            class="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-12 pr-4 py-3 text-white text-lg placeholder-neutral-500 focus:outline-none focus:border-red-600 transition-colors"
            autofocus
          />
          @if (searchQuery) {
            <button
              (click)="clearSearch()"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          }
        </div>
      </div>

      <!-- Filter Chips -->
      <div class="flex flex-wrap gap-2 mb-6 max-w-4xl mx-auto">
        <button
          (click)="setTypeFilter(null)"
          class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
          [class]="
            !activeTypeFilter()
              ? 'bg-white text-black'
              : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
          "
        >
          All
        </button>
        <button
          (click)="setTypeFilter('MOVIE')"
          class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
          [class]="
            activeTypeFilter() === 'MOVIE'
              ? 'bg-white text-black'
              : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
          "
        >
          Movies
        </button>
        <button
          (click)="setTypeFilter('SERIES')"
          class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
          [class]="
            activeTypeFilter() === 'SERIES'
              ? 'bg-white text-black'
              : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
          "
        >
          Series
        </button>

        @if (genres().length > 0) {
          <span class="w-px h-6 bg-neutral-700 self-center mx-1"></span>
          @for (genre of genres(); track genre.id) {
            <button
              (click)="toggleGenreFilter(genre.id)"
              class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              [class]="
                activeGenreFilter() === genre.id
                  ? 'bg-red-600 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              "
            >
              {{ genre.name }}
            </button>
          }
        }
      </div>

      <!-- Results -->
      @if (loading()) {
        <div class="flex justify-center py-20">
          <div
            class="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin"
          ></div>
        </div>
      } @else if (searchQuery.length >= 2 && results().length === 0) {
        <div class="text-center py-20">
          <p class="text-neutral-400 text-lg">No results found for "{{ searchQuery }}"</p>
          <p class="text-neutral-500 text-sm mt-2">Try adjusting your search or filters</p>
        </div>
      } @else if (results().length > 0) {
        <div
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 max-w-7xl mx-auto"
        >
          @for (item of filteredResults(); track item.id) {
            <app-content-card [item]="item" />
          }
        </div>

        @if (!isLastPage() && filteredResults().length > 0) {
          <div class="flex justify-center py-8">
            <button
              (click)="loadMore()"
              [disabled]="loadingMore()"
              class="bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {{ loadingMore() ? 'Loading...' : 'Load More' }}
            </button>
          </div>
        }
      } @else {
        <div class="text-center py-20">
          <p class="text-neutral-500 text-lg">Start typing to search for content</p>
        </div>
      }
    </div>
  `,
})
export class SearchComponent implements OnInit, OnDestroy {
  searchQuery = '';
  results = signal<ContentSummary[]>([]);
  filteredResults = signal<ContentSummary[]>([]);
  genres = signal<Genre[]>([]);
  loading = signal(false);
  loadingMore = signal(false);
  isLastPage = signal(true);
  activeTypeFilter = signal<string | null>(null);
  activeGenreFilter = signal<number | null>(null);

  private currentPage = 0;
  private searchSubject = new Subject<string>();
  private subs: Subscription[] = [];

  constructor(
    private contentService: ContentService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Load genres for filter chips
    this.subs.push(
      this.contentService.getAllGenres().subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.genres.set(res.data);
          }
        },
      }),
    );

    // Debounced search
    this.subs.push(
      this.searchSubject
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((query) => {
            if (query.trim().length < 2) {
              this.results.set([]);
              this.filteredResults.set([]);
              this.isLastPage.set(true);
              return of(null);
            }
            this.loading.set(true);
            this.currentPage = 0;
            return this.contentService.searchContent(query.trim(), 0, 24);
          }),
        )
        .subscribe({
          next: (res) => {
            this.loading.set(false);
            if (res && res.success && res.data) {
              this.results.set(res.data.content);
              this.isLastPage.set(res.data.last);
              this.applyFilters();
            }
          },
          error: () => {
            this.loading.set(false);
          },
        }),
    );

    // Check for query param from navbar search
    this.subs.push(
      this.route.queryParams.subscribe((params) => {
        if (params['q'] && params['q'] !== this.searchQuery) {
          this.searchQuery = params['q'];
          this.searchSubject.next(this.searchQuery);
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  onQueryChange(query: string): void {
    this.router.navigate([], {
      queryParams: query ? { q: query } : {},
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
    this.searchSubject.next(query);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.onQueryChange('');
  }

  setTypeFilter(type: string | null): void {
    this.activeTypeFilter.set(type);
    this.applyFilters();
  }

  toggleGenreFilter(genreId: number): void {
    this.activeGenreFilter.set(this.activeGenreFilter() === genreId ? null : genreId);
    this.applyFilters();
  }

  loadMore(): void {
    if (this.isLastPage() || this.loadingMore()) return;
    this.loadingMore.set(true);
    this.currentPage++;

    this.subs.push(
      this.contentService.searchContent(this.searchQuery.trim(), this.currentPage, 24).subscribe({
        next: (res) => {
          this.loadingMore.set(false);
          if (res.success && res.data) {
            this.results.set([...this.results(), ...res.data.content]);
            this.isLastPage.set(res.data.last);
            this.applyFilters();
          }
        },
        error: () => {
          this.loadingMore.set(false);
          this.currentPage--;
        },
      }),
    );
  }

  private applyFilters(): void {
    let filtered = this.results();
    const typeFilter = this.activeTypeFilter();
    const genreFilter = this.activeGenreFilter();

    if (typeFilter) {
      filtered = filtered.filter((item) => item.type === typeFilter);
    }
    if (genreFilter !== null) {
      filtered = filtered.filter(
        (item) =>
          item.genres && item.genres.length > 0 && item.genres.some((g) => g.id === genreFilter),
      );
    }
    this.filteredResults.set(filtered);
  }
}
