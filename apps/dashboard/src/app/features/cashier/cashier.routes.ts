import { Route } from '@angular/router';

export const cashierRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/cashier-page/cashier-page.component').then(
        (m) => m.CashierPageComponent
      ),
  },
];
