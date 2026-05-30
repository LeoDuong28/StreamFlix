import { Component } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [NavbarComponent],
  template: `<app-navbar /><div class="pt-20 px-8"><h1 class="text-3xl font-bold mb-4">Subscription Plans</h1><p class="text-(--color-text-secondary)">Coming in Phase 5.</p></div>`,
})
export class SubscriptionComponent {}
