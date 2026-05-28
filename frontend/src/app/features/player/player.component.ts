import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import Hls from 'hls.js';
import { StreamingService } from '../../core/services/streaming.service';
import { WatchHistoryService } from '../../core/services/watch-history.service';
import { ContentService } from '../../core/services/content.service';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div
      class="relative w-full h-screen bg-black"
      (mousemove)="showControls()"
      (click)="togglePlay()"
    >
      <video
        #videoPlayer
        class="w-full h-full object-contain"
        (timeupdate)="onTimeUpdate()"
        (loadedmetadata)="onMetadataLoaded()"
        (ended)="onEnded()"
        (waiting)="buffering.set(true)"
        (playing)="buffering.set(false)"
        playsinline
      ></video>

      <!-- Buffering spinner -->
      @if (buffering()) {
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            class="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"
          ></div>
        </div>
      }

      <!-- Loading / error state -->
      @if (error()) {
        <div class="absolute inset-0 flex items-center justify-center bg-black/80">
          <div class="text-center">
            <p class="text-red-500 text-lg mb-4">{{ error() }}</p>
            <a
              routerLink="/browse"
              class="px-6 py-2 bg-neutral-800 rounded hover:bg-neutral-700 transition"
              >Back to Browse</a
            >
          </div>
        </div>
      }

      <!-- Controls overlay -->
      @if (controlsVisible() && !error()) {
        <div class="absolute inset-0 pointer-events-none" (click)="$event.stopPropagation()">
          <!-- Top bar -->
          <div
            class="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-auto"
          >
            <div class="flex items-center gap-4">
              <a
                [routerLink]="['/detail', contentId()]"
                class="flex items-center gap-2 hover:text-neutral-300 transition"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back
              </a>
              <h2 class="text-lg font-semibold truncate">{{ title() }}</h2>
            </div>
          </div>

          <!-- Bottom controls -->
          <div
            class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-auto"
          >
            <!-- Progress bar -->
            <div
              class="group relative w-full h-1 bg-neutral-600 rounded cursor-pointer mb-3 hover:h-2 transition-all"
              (click)="seek($event)"
              #progressBar
            >
              <div
                class="absolute top-0 left-0 h-full bg-red-600 rounded"
                [style.width.%]="progressPercent()"
              ></div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <!-- Play/Pause -->
                <button
                  (click)="togglePlay(); $event.stopPropagation()"
                  class="hover:scale-110 transition"
                >
                  @if (playing()) {
                    <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  } @else {
                    <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  }
                </button>

                <!-- Volume -->
                <div class="flex items-center gap-2">
                  <button
                    (click)="toggleMute(); $event.stopPropagation()"
                    class="hover:scale-110 transition"
                  >
                    @if (muted() || volume() === 0) {
                      <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path
                          d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"
                        />
                      </svg>
                    } @else {
                      <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path
                          d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
                        />
                      </svg>
                    }
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    [value]="volume()"
                    (input)="onVolumeChange($event)"
                    (click)="$event.stopPropagation()"
                    class="w-20 accent-red-600"
                  />
                </div>

                <!-- Time display -->
                <span class="text-sm text-neutral-300">
                  {{ formatTime(currentTime()) }} / {{ formatTime(duration()) }}
                </span>
              </div>

              <div class="flex items-center gap-4">
                <!-- Fullscreen -->
                <button
                  (click)="toggleFullscreen(); $event.stopPropagation()"
                  class="hover:scale-110 transition"
                >
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    input[type='range'] {
      -webkit-appearance: none;
      appearance: none;
      height: 4px;
      border-radius: 2px;
      background: #525252;
    }
    input[type='range']::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #dc2626;
      cursor: pointer;
    }
  `,
})
export class PlayerComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('videoPlayer') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('progressBar') progressBarRef!: ElementRef<HTMLDivElement>;

  contentId = signal(0);
  title = signal('');
  playing = signal(false);
  buffering = signal(false);
  muted = signal(false);
  volume = signal(1);
  currentTime = signal(0);
  duration = signal(0);
  progressPercent = signal(0);
  controlsVisible = signal(true);
  error = signal<string | null>(null);

  private hls: Hls | null = null;
  private routeSub?: Subscription;
  private progressSub?: Subscription;
  private contentSub?: Subscription;
  private streamSub?: Subscription;
  private controlsTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private route: ActivatedRoute,
    private streamingService: StreamingService,
    private watchHistoryService: WatchHistoryService,
    private contentService: ContentService,
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (!isNaN(id) && id > 0) {
        this.contentId.set(id);
        this.loadStream(id);
      } else {
        this.error.set('Invalid content ID');
      }
    });
  }

  ngAfterViewInit(): void {
    this.startControlsTimer();
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.progressSub?.unsubscribe();
    this.contentSub?.unsubscribe();
    this.streamSub?.unsubscribe();
    this.saveProgress();
    this.destroyHls();
    if (this.controlsTimer) clearTimeout(this.controlsTimer);
  }

  private loadStream(contentId: number): void {
    this.destroyHls();
    this.progressSub?.unsubscribe();
    this.contentSub?.unsubscribe();
    this.streamSub?.unsubscribe();

    // Load content title
    this.contentSub = this.contentService.getContentById(contentId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.title.set(res.data.title);
        }
      },
    });

    this.streamSub = this.streamingService.getStreamToken(contentId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.initPlayer(res.data.streamUrl);
        } else {
          this.error.set('Failed to get stream token');
        }
      },
      error: (err) => {
        if (err.status === 403) {
          this.error.set('Premium subscription required to stream this content');
        } else {
          this.error.set('Failed to load stream. Please try again.');
        }
      },
    });
  }

  private initPlayer(streamUrl: string): void {
    const video = this.videoRef?.nativeElement;
    if (!video) return;

    if (streamUrl.endsWith('.m3u8') && Hls.isSupported()) {
      this.hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
      });
      this.hls.loadSource(streamUrl);
      this.hls.attachMedia(video);
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      this.hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          this.error.set('Stream playback error. Please try again.');
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = streamUrl;
      video.play().catch(() => {});
    } else {
      // Fallback for non-HLS URLs
      video.src = streamUrl;
      video.play().catch(() => {});
    }

    // Save progress every 10 seconds
    this.progressSub = interval(10000).subscribe(() => this.saveProgress());
  }

  private destroyHls(): void {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
  }

  togglePlay(): void {
    const video = this.videoRef?.nativeElement;
    if (!video) return;
    if (video.paused) {
      video
        .play()
        .then(() => this.playing.set(true))
        .catch(() => this.playing.set(false));
    } else {
      video.pause();
      this.playing.set(false);
    }
  }

  toggleMute(): void {
    const video = this.videoRef?.nativeElement;
    if (!video) return;
    video.muted = !video.muted;
    this.muted.set(video.muted);
  }

  onVolumeChange(event: Event): void {
    const video = this.videoRef?.nativeElement;
    if (!video) return;
    const val = parseFloat((event.target as HTMLInputElement).value);
    video.volume = val;
    this.volume.set(val);
    if (val > 0 && video.muted) {
      video.muted = false;
      this.muted.set(false);
    }
  }

  onTimeUpdate(): void {
    const video = this.videoRef?.nativeElement;
    if (!video) return;
    const time = video.currentTime;
    const isPlaying = !video.paused;
    // Only set signals when values actually change to avoid unnecessary change detection
    if (this.currentTime() !== time) this.currentTime.set(time);
    if (this.playing() !== isPlaying) this.playing.set(isPlaying);
    if (video.duration > 0) {
      const pct = (time / video.duration) * 100;
      if (Math.abs(this.progressPercent() - pct) > 0.1) this.progressPercent.set(pct);
    }
  }

  onMetadataLoaded(): void {
    const video = this.videoRef?.nativeElement;
    if (!video) return;
    this.duration.set(video.duration);
  }

  onEnded(): void {
    this.playing.set(false);
    this.saveProgress();
  }

  seek(event: MouseEvent): void {
    event.stopPropagation();
    const bar = this.progressBarRef?.nativeElement;
    const video = this.videoRef?.nativeElement;
    if (!bar || !video || !video.duration) return;
    const rect = bar.getBoundingClientRect();
    const pos = (event.clientX - rect.left) / rect.width;
    video.currentTime = pos * video.duration;
  }

  toggleFullscreen(): void {
    const container = this.videoRef?.nativeElement.parentElement;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      container.requestFullscreen().catch(() => {});
    }
  }

  showControls(): void {
    this.controlsVisible.set(true);
    this.startControlsTimer();
  }

  private startControlsTimer(): void {
    if (this.controlsTimer) clearTimeout(this.controlsTimer);
    this.controlsTimer = setTimeout(() => {
      if (this.playing()) {
        this.controlsVisible.set(false);
      }
    }, 3000);
  }

  private saveProgress(): void {
    const video = this.videoRef?.nativeElement;
    if (!video || !video.currentTime || video.paused || !this.contentId()) return;
    this.watchHistoryService
      .updateProgress({
        contentId: this.contentId(),
        progressSeconds: Math.floor(video.currentTime),
        durationSeconds: Math.floor(video.duration || 0),
      })
      .subscribe();
  }

  formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
  }
}
