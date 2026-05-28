import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-(--color-dark)">
      <!-- Hero Section -->
      <header class="relative h-screen flex items-center justify-center text-center px-4">
        <div
          class="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-(--color-dark)"
        ></div>
        <div
          class="absolute inset-0 bg-[url('https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg')] bg-cover bg-center -z-10"
        ></div>

        <!-- Navigation -->
        <nav
          class="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-5 z-10"
        >
          <h1 class="text-3xl font-bold text-(--color-primary)">STREAMFLIX</h1>
          <a
            routerLink="/login"
            class="bg-(--color-primary) hover:bg-(--color-primary-hover) text-white px-6 py-2 rounded font-semibold transition-colors"
          >
            Sign In
          </a>
        </nav>

        <div class="relative z-10 max-w-3xl">
          <h2 class="text-5xl md:text-6xl font-bold mb-4">
            Unlimited movies, TV shows, and more
          </h2>
          <p class="text-xl md:text-2xl text-(--color-text-secondary) mb-8">
            Watch anywhere. Cancel anytime.
          </p>
          <a
            routerLink="/register"
            class="inline-block bg-(--color-primary) hover:bg-(--color-primary-hover) text-white text-xl px-10 py-4 rounded font-semibold transition-colors"
          >
            Get Started &raquo;
          </a>
        </div>
      </header>

      <!-- Features Section -->
      <section class="py-16 border-t-8 border-(--color-dark-surface)">
        <div class="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-12 text-center">
          <div>
            <div class="text-5xl mb-4">📺</div>
            <h3 class="text-xl font-semibold mb-2">Watch everywhere</h3>
            <p class="text-(--color-text-secondary)">
              Stream on your phone, tablet, laptop, and TV.
            </p>
          </div>
          <div>
            <div class="text-5xl mb-4">⬇️</div>
            <h3 class="text-xl font-semibold mb-2">Download your shows</h3>
            <p class="text-(--color-text-secondary)">
              Save your favourites and always have something to watch.
            </p>
          </div>
          <div>
            <div class="text-5xl mb-4">👤</div>
            <h3 class="text-xl font-semibold mb-2">Create profiles</h3>
            <p class="text-(--color-text-secondary)">
              Create profiles for different members of your household.
            </p>
          </div>
        </div>
      </section>

      <!-- Plans Section -->
      <section class="py-16 border-t-8 border-(--color-dark-surface)">
        <div class="max-w-4xl mx-auto px-4 text-center">
          <h2 class="text-3xl font-bold mb-10">Choose your plan</h2>
          <div class="grid md:grid-cols-3 gap-6">
            <div
              class="bg-(--color-dark-card) rounded-lg p-8 border border-(--color-dark-surface)"
            >
              <h3 class="text-xl font-semibold mb-2">Free</h3>
              <p class="text-3xl font-bold mb-4">$0<span class="text-sm text-(--color-text-secondary)">/mo</span></p>
              <ul class="text-(--color-text-secondary) space-y-2 text-left mb-6">
                <li>&#10003; 1 Profile</li>
                <li>&#10003; SD Quality</li>
                <li>&#10003; With Ads</li>
              </ul>
              <a
                routerLink="/register"
                class="block w-full bg-(--color-dark-surface) hover:bg-(--color-text-secondary)/20 text-white py-3 rounded font-semibold transition-colors"
              >
                Start Free
              </a>
            </div>
            <div
              class="bg-(--color-dark-card) rounded-lg p-8 border-2 border-(--color-primary) relative"
            >
              <span
                class="absolute -top-3 left-1/2 -translate-x-1/2 bg-(--color-primary) text-white text-sm px-3 py-1 rounded-full"
                >Popular</span
              >
              <h3 class="text-xl font-semibold mb-2">Basic</h3>
              <p class="text-3xl font-bold mb-4">$9.99<span class="text-sm text-(--color-text-secondary)">/mo</span></p>
              <ul class="text-(--color-text-secondary) space-y-2 text-left mb-6">
                <li>&#10003; 3 Profiles</li>
                <li>&#10003; HD Quality</li>
                <li>&#10003; No Ads</li>
              </ul>
              <a
                routerLink="/register"
                class="block w-full bg-(--color-primary) hover:bg-(--color-primary-hover) text-white py-3 rounded font-semibold transition-colors"
              >
                Get Basic
              </a>
            </div>
            <div
              class="bg-(--color-dark-card) rounded-lg p-8 border border-(--color-dark-surface)"
            >
              <h3 class="text-xl font-semibold mb-2">Premium</h3>
              <p class="text-3xl font-bold mb-4">$17.99<span class="text-sm text-(--color-text-secondary)">/mo</span></p>
              <ul class="text-(--color-text-secondary) space-y-2 text-left mb-6">
                <li>&#10003; 5 Profiles</li>
                <li>&#10003; 4K + HDR</li>
                <li>&#10003; No Ads</li>
              </ul>
              <a
                routerLink="/register"
                class="block w-full bg-(--color-dark-surface) hover:bg-(--color-text-secondary)/20 text-white py-3 rounded font-semibold transition-colors"
              >
                Get Premium
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="py-12 border-t-8 border-(--color-dark-surface)">
        <div class="max-w-6xl mx-auto px-4 text-center text-(--color-text-secondary)">
          <h1 class="text-2xl font-bold text-(--color-primary) mb-4">STREAMFLIX</h1>
          <p>&copy; 2026 StreamFlix. A portfolio project.</p>
        </div>
      </footer>
    </div>
  `,
})
export class LandingComponent {}
