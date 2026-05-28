import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-(--color-dark) px-4">
      <div class="absolute top-0 left-0 p-6">
        <a routerLink="/" class="text-3xl font-bold text-(--color-primary)">STREAMFLIX</a>
      </div>

      <div class="bg-black/75 p-16 rounded-lg w-full max-w-md">
        <h1 class="text-3xl font-bold mb-8">Sign Up</h1>

        @if (errorMessage()) {
          <div class="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
            {{ errorMessage() }}
          </div>
        }

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="mb-4">
            <input
              type="text"
              formControlName="fullName"
              placeholder="Full name"
              class="w-full px-4 py-4 rounded bg-(--color-dark-surface) text-white border border-(--color-dark-surface) focus:border-(--color-text-secondary) focus:outline-none"
            />
            @if (
              registerForm.get('fullName')?.touched &&
              registerForm.get('fullName')?.errors?.['required']
            ) {
              <p class="text-red-500 text-sm mt-1">Full name is required</p>
            }
            @if (
              registerForm.get('fullName')?.touched &&
              registerForm.get('fullName')?.errors?.['minlength']
            ) {
              <p class="text-red-500 text-sm mt-1">Name must be at least 2 characters</p>
            }
          </div>

          <div class="mb-4">
            <input
              type="email"
              formControlName="email"
              placeholder="Email address"
              class="w-full px-4 py-4 rounded bg-(--color-dark-surface) text-white border border-(--color-dark-surface) focus:border-(--color-text-secondary) focus:outline-none"
            />
            @if (
              registerForm.get('email')?.touched && registerForm.get('email')?.errors?.['required']
            ) {
              <p class="text-red-500 text-sm mt-1">Email is required</p>
            }
            @if (
              registerForm.get('email')?.touched && registerForm.get('email')?.errors?.['email']
            ) {
              <p class="text-red-500 text-sm mt-1">Enter a valid email</p>
            }
          </div>

          <div class="mb-6">
            <input
              type="password"
              formControlName="password"
              placeholder="Password (min 8 characters)"
              class="w-full px-4 py-4 rounded bg-(--color-dark-surface) text-white border border-(--color-dark-surface) focus:border-(--color-text-secondary) focus:outline-none"
            />
            @if (
              registerForm.get('password')?.touched &&
              registerForm.get('password')?.errors?.['required']
            ) {
              <p class="text-red-500 text-sm mt-1">Password is required</p>
            }
            @if (
              registerForm.get('password')?.touched &&
              registerForm.get('password')?.errors?.['minlength']
            ) {
              <p class="text-red-500 text-sm mt-1">Password must be at least 8 characters</p>
            }
          </div>

          <button
            type="submit"
            [disabled]="isLoading()"
            class="w-full bg-(--color-primary) hover:bg-(--color-primary-hover) text-white py-4 rounded font-semibold text-lg transition-colors disabled:opacity-50"
          >
            {{ isLoading() ? 'Creating account...' : 'Sign Up' }}
          </button>
        </form>

        <p class="text-(--color-text-secondary) mt-6">
          Already have an account?
          <a routerLink="/login" class="text-white hover:underline">Sign in</a>.
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService
      .register(this.registerForm.value)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => this.router.navigate(['/browse']),
        error: (err) =>
          this.errorMessage.set(err.error?.message || 'Registration failed. Please try again.'),
      });
  }
}
