import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { TmdbImagePipe } from '../../../shared/pipes/tmdb-image.pipe';
import { ContentService } from '../../../core/services/content.service';
import { AdminContentService } from '../../../core/services/admin-content.service';
import { ContentSummary } from '../../../core/models/content.model';

@Component({
  selector: 'app-content-mgmt',
  standalone: true,
  imports: [NavbarComponent, FormsModule, TmdbImagePipe, DecimalPipe],
  template: `
    <app-navbar />
    <div class="pt-20 px-4 md:px-8 pb-16 max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold">Content Management</h1>
        <button
          (click)="showImport.set(!showImport())"
          class="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition text-sm font-semibold"
        >
          {{ showImport() ? 'Close Import' : 'Import from TMDB' }}
        </button>
      </div>

      <!-- TMDB Import Panel -->
      @if (showImport()) {
        <div class="bg-neutral-800 rounded-lg p-6 mb-8">
          <h2 class="text-xl font-bold mb-4">Import from TMDB</h2>
          <div class="flex gap-4 mb-4">
            <select [(ngModel)]="importType" class="bg-neutral-700 rounded px-3 py-2 text-sm">
              <option value="movie">Movie</option>
              <option value="series">Series</option>
            </select>
            <div class="flex-1 flex gap-2">
              <input
                type="text"
                [(ngModel)]="tmdbSearchQuery"
                (keydown.enter)="searchTmdb()"
                placeholder="Search TMDB..."
                class="flex-1 bg-neutral-700 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                (click)="searchTmdb()"
                class="px-4 py-2 bg-neutral-600 rounded hover:bg-neutral-500 transition text-sm"
              >
                Search
              </button>
            </div>
          </div>

          <!-- TMDB search results -->
          @if (tmdbResults().length > 0) {
            <div
              class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto"
            >
              @for (result of tmdbResults(); track result.id) {
                <div
                  class="flex gap-3 p-3 bg-neutral-700/50 rounded hover:bg-neutral-700 transition"
                >
                  <img
                    [src]="result.poster_path | tmdbImage: 'w92'"
                    [alt]="result.title || result.name"
                    class="w-12 h-18 object-cover rounded flex-shrink-0"
                  />
                  <div class="flex-1 min-w-0">
                    <p class="font-semibold text-sm truncate">{{ result.title || result.name }}</p>
                    <p class="text-xs text-neutral-400">
                      {{ (result.release_date || result.first_air_date)?.substring(0, 4) }}
                      @if (result.vote_average) {
                        | {{ result.vote_average | number: '1.1-1' }}
                      }
                    </p>
                  </div>
                  <button
                    (click)="importFromTmdb(result.id)"
                    [disabled]="importing()"
                    class="self-center px-3 py-1 bg-red-600 rounded text-xs hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {{ importing() ? '...' : 'Import' }}
                  </button>
                </div>
              }
            </div>
          }

          <!-- Sync genres button -->
          <div class="mt-4 pt-4 border-t border-neutral-700">
            <button
              (click)="syncGenres()"
              [disabled]="syncing()"
              class="px-4 py-2 bg-neutral-600 rounded hover:bg-neutral-500 transition text-sm disabled:opacity-50"
            >
              {{ syncing() ? 'Syncing...' : 'Sync Genres from TMDB' }}
            </button>
          </div>
        </div>
      }

      <!-- Status messages -->
      @if (statusMessage()) {
        <div
          class="mb-4 px-4 py-3 rounded text-sm"
          [class]="
            statusSuccess() ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
          "
        >
          {{ statusMessage() }}
        </div>
      }

      <!-- Content table -->
      <div class="bg-neutral-800/50 rounded-lg overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-neutral-800">
            <tr>
              <th class="text-left px-4 py-3 font-semibold">Title</th>
              <th class="text-left px-4 py-3 font-semibold hidden md:table-cell">Type</th>
              <th class="text-left px-4 py-3 font-semibold hidden lg:table-cell">Rating</th>
              <th class="text-left px-4 py-3 font-semibold hidden lg:table-cell">Premium</th>
              <th class="text-left px-4 py-3 font-semibold hidden lg:table-cell">Genre</th>
              <th class="text-right px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (item of contentList(); track item.id) {
              <tr class="border-t border-neutral-700/50 hover:bg-neutral-800/50 transition">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <img
                      [src]="item.posterPath | tmdbImage: 'w92'"
                      [alt]="item.title"
                      class="w-10 h-14 object-cover rounded hidden sm:block"
                    />
                    <span class="font-medium truncate max-w-[200px]">{{ item.title }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 hidden md:table-cell">
                  <span class="text-xs uppercase bg-neutral-700 px-2 py-1 rounded">{{
                    item.type
                  }}</span>
                </td>
                <td class="px-4 py-3 hidden lg:table-cell text-green-400">
                  {{ item.voteAverage | number: '1.1-1' }}
                </td>
                <td class="px-4 py-3 hidden lg:table-cell">
                  @if (item.isPremium) {
                    <span class="text-yellow-500">Yes</span>
                  } @else {
                    <span class="text-neutral-500">No</span>
                  }
                </td>
                <td class="px-4 py-3 hidden lg:table-cell">
                  {{ item.genres[0]?.name || '-' }}
                </td>
                <td class="px-4 py-3 text-right">
                  <button
                    (click)="deleteContent(item.id)"
                    class="text-red-400 hover:text-red-300 text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="px-4 py-8 text-center text-neutral-500">
                  No content found. Import some from TMDB!
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      @if (totalPages() > 1) {
        <div class="flex items-center justify-center gap-2 mt-6">
          <button
            (click)="loadPage(currentPage() - 1)"
            [disabled]="currentPage() === 0"
            class="px-3 py-1.5 bg-neutral-700 rounded text-sm disabled:opacity-50 hover:bg-neutral-600 transition"
          >
            Previous
          </button>
          <span class="text-sm text-neutral-400">
            Page {{ currentPage() + 1 }} of {{ totalPages() }}
          </span>
          <button
            (click)="loadPage(currentPage() + 1)"
            [disabled]="currentPage() >= totalPages() - 1"
            class="px-3 py-1.5 bg-neutral-700 rounded text-sm disabled:opacity-50 hover:bg-neutral-600 transition"
          >
            Next
          </button>
        </div>
      }
    </div>
  `,
})
export class ContentMgmtComponent implements OnInit, OnDestroy {
  contentList = signal<ContentSummary[]>([]);
  currentPage = signal(0);
  totalPages = signal(0);
  showImport = signal(false);
  tmdbSearchQuery = '';
  importType = 'movie';
  tmdbResults = signal<any[]>([]);
  importing = signal(false);
  syncing = signal(false);
  statusMessage = signal<string | null>(null);
  statusSuccess = signal(true);

  private activeSub?: import('rxjs').Subscription;
  private statusTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private contentService: ContentService,
    private adminContentService: AdminContentService,
  ) {}

  ngOnInit(): void {
    this.loadPage(0);
  }

  ngOnDestroy(): void {
    this.activeSub?.unsubscribe();
    if (this.statusTimer) clearTimeout(this.statusTimer);
  }

  loadPage(page: number): void {
    this.activeSub?.unsubscribe();
    this.activeSub = this.contentService
      .getContent({ page, size: 20, sortBy: 'newest' })
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.contentList.set(res.data.content);
            this.currentPage.set(res.data.page);
            this.totalPages.set(res.data.totalPages);
          }
        },
        error: () => this.showStatus('Failed to load content', false),
      });
  }

  searchTmdb(): void {
    if (!this.tmdbSearchQuery.trim()) return;
    const search$ =
      this.importType === 'movie'
        ? this.adminContentService.searchTmdbMovies(this.tmdbSearchQuery)
        : this.adminContentService.searchTmdbSeries(this.tmdbSearchQuery);

    search$.subscribe({
      next: (res) => {
        if (res.success && res.data) this.tmdbResults.set(res.data);
      },
      error: () => this.showStatus('TMDB search failed', false),
    });
  }

  importFromTmdb(tmdbId: number): void {
    this.importing.set(true);
    const import$ =
      this.importType === 'movie'
        ? this.adminContentService.importMovie(tmdbId)
        : this.adminContentService.importSeries(tmdbId);

    import$.subscribe({
      next: (res) => {
        if (res.success) {
          this.showStatus('Content imported successfully!', true);
          this.loadPage(0);
        }
        this.importing.set(false);
      },
      error: (err) => {
        this.showStatus(err.error?.message || 'Import failed', false);
        this.importing.set(false);
      },
    });
  }

  syncGenres(): void {
    this.syncing.set(true);
    this.adminContentService.syncGenres().subscribe({
      next: () => {
        this.showStatus('Genres synced successfully!', true);
        this.syncing.set(false);
      },
      error: () => {
        this.showStatus('Failed to sync genres', false);
        this.syncing.set(false);
      },
    });
  }

  deleteContent(id: number): void {
    if (!confirm('Are you sure you want to delete this content?')) return;
    this.adminContentService.deleteContent(id).subscribe({
      next: () => {
        this.showStatus('Content deleted', true);
        this.loadPage(this.currentPage());
      },
      error: () => this.showStatus('Failed to delete content', false),
    });
  }

  private showStatus(message: string, success: boolean): void {
    this.statusMessage.set(message);
    this.statusSuccess.set(success);
    if (this.statusTimer) clearTimeout(this.statusTimer);
    this.statusTimer = setTimeout(() => this.statusMessage.set(null), 4000);
  }
}
