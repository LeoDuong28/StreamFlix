import { Routes } from '@angular/router';
import { authGuard, adminGuard, premiumGuard, profileGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'browse',
    loadComponent: () =>
      import('./features/browse/browse.component').then((m) => m.BrowseComponent),
    canActivate: [authGuard, profileGuard],
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./features/search/search.component').then((m) => m.SearchComponent),
    canActivate: [authGuard, profileGuard],
  },
  {
    path: 'watchlist',
    loadComponent: () =>
      import('./features/watchlist/watchlist.component').then((m) => m.WatchlistComponent),
    canActivate: [authGuard, profileGuard],
  },
  {
    path: 'profiles',
    loadComponent: () =>
      import('./features/profile/profile-select/profile-select.component').then(
        (m) => m.ProfileSelectComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'detail/:id',
    loadComponent: () =>
      import('./features/detail/detail.component').then((m) => m.DetailComponent),
    canActivate: [authGuard, profileGuard],
  },
  {
    path: 'player/:id',
    loadComponent: () =>
      import('./features/player/player.component').then((m) => m.PlayerComponent),
    canActivate: [authGuard, profileGuard, premiumGuard],
  },
  {
    path: 'subscription',
    loadComponent: () =>
      import('./features/subscription/subscription.component').then((m) => m.SubscriptionComponent),
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'content',
        loadComponent: () =>
          import('./features/admin/content-mgmt/content-mgmt.component').then(
            (m) => m.ContentMgmtComponent,
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/user-mgmt/user-mgmt.component').then((m) => m.UserMgmtComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
