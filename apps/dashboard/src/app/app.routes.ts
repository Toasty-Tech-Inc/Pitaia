import { Route } from '@angular/router';
import { isUserLogged } from './pages/login/is-user-logged.can-activate.guard';

export const appRoutes: Route[] = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register').then((m) => m.Register),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [isUserLogged],
  },
  {
    path: 'orders',
    loadChildren: () =>
      import('./features/orders/orders.routes').then((m) => m.ordersRoutes),
    canActivate: [isUserLogged],
  },
  {
    path: 'products',
    loadChildren: () =>
      import('./features/products/products.routes').then((m) => m.productsRoutes),
    canActivate: [isUserLogged],
  },
  {
    path: 'customers',
    loadChildren: () =>
      import('./features/customers/customers.routes').then((m) => m.customersRoutes),
    canActivate: [isUserLogged],
  },
  {
    path: 'tables',
    loadChildren: () =>
      import('./features/tables/tables.routes').then((m) => m.tablesRoutes),
    canActivate: [isUserLogged],
  },
  {
    path: 'coupons',
    loadChildren: () =>
      import('./features/coupons/coupons.routes').then((m) => m.couponsRoutes),
    canActivate: [isUserLogged],
  },
  {
    path: 'cashier',
    loadChildren: () =>
      import('./features/cashier/cashier.routes').then((m) => m.cashierRoutes),
    canActivate: [isUserLogged],
  },
  {
    path: 'reports',
    loadChildren: () =>
      import('./features/reports/reports.routes').then((m) => m.reportsRoutes),
    canActivate: [isUserLogged],
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];