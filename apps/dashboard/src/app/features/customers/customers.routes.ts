import { Route } from '@angular/router';

export const customersRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/customers-list/customers-list.component').then(
        (m) => m.CustomersListComponent
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/customer-form/customer-form.component').then(
        (m) => m.CustomerFormComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/customer-form/customer-form.component').then(
        (m) => m.CustomerFormComponent
      ),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/customer-form/customer-form.component').then(
        (m) => m.CustomerFormComponent
      ),
  },
];

