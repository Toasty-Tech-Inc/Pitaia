import { Route } from '@angular/router';

export const couponsRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/coupons-list/coupons-list.component').then(
        (m) => m.CouponsListComponent
      ),
  },
];
