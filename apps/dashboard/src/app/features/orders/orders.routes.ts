import { Route } from '@angular/router';

export const ordersRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/orders-list/orders-list.component').then(
        (m) => m.OrdersListComponent
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/order-form/order-form.component').then(
        (m) => m.OrderFormComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/order-detail/order-detail.component').then(
        (m) => m.OrderDetailComponent
      ),
  },
];

