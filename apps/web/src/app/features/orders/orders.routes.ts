import { Routes } from '@angular/router';

export const ordersRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/orders-page/orders-page.component').then((m) => m.OrdersPageComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/order-detail-page/order-detail-page.component').then((m) => m.OrderDetailPageComponent),
  },
];
