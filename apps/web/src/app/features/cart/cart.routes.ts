import { Routes } from '@angular/router';

export const cartRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/cart-page/cart-page.component').then((m) => m.CartPageComponent),
  },
];
