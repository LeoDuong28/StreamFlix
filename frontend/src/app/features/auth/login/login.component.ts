import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-(--color-dark) px-4">
      <div class="absolute top-0 left-0 p-6">
        <a routerLink="/" class="text-3xl font-bold text-(--color-primary)">STREAMFLIX</a>
      </div>

      <div class="bg-black/75 p-16 rounded-lg w-full max-w-md">
        <h1 class="text-3xl font-bold mb-8">Sign In</h1>

        @if (errorMessage()) {
          <div class="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
            {{ errorMessage() }}
          </div>
        }

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="mb-4">
            <input
              type="email"
              formControlName="email"
              placeholder="Email address"
              class="w-full px-4 py-4 rounded bg-(--color-dark-surface) text-white border border-(--color-dark-surface) focus:border-(--color-text-secondary) focus:outline-none"
            />
            @if (loginForm.get('email')?.touched && loginForm.get('email')?.errors?.['required']) {
              <p class="text-red-500 text-sm mt-1">Email is required</p>
            }
            @if (loginForm.get('email')?.touched && loginForm.get('email')?.errors?.['email']) {
              <p class="text-red-500 text-sm mt-1">Enter a valid email</p>
            }
          </div>

          <div class="mb-6">
            <input
              type="password"
              formControlName="password"
              placeholder="Password"
              class="w-full px-4 py-4 rounded bg-(--color-dark-surface) text-white border border-(--color-dark-surface) focus:border-(--color-text-secondary) focus:outline-none"
            />
            @if (
              loginForm.get('password')?.touched && loginForm.get('password')?.errors?.['required']
            ) {
              <p class="text-red-500 text-sm mt-1">Password is required</p>
            }
          </div>

          <button
            type="submit"
            [disabled]="isLoading()"
            class="w-full bg-(--color-primary) hover:bg-(--color-primary-hover) text-white py-4 rounded font-semibold text-lg transition-colors disabled:opacity-50"
          >
            {{ isLoading() ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <p class="text-(--color-text-secondary) mt-6">
          New to StreamFlix?
          <a routerLink="/register" class="text-white hover:underline">Sign up now</a>.
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService
      .login(this.loginForm.value)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => this.router.navigate(['/browse']),
        error: (err) => this.errorMessage.set(err.error?.message || 'Invalid email or password'),
      });
  }
}
