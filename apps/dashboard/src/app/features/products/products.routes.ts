import { Route } from '@angular/router';

export const productsRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/products-list/products-list.component').then(
        (m) => m.ProductsListComponent
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/product-form/product-form.component').then(
        (m) => m.ProductFormComponent
      ),
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./pages/categories-list/categories-list.component').then(
        (m) => m.CategoriesListComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/product-form/product-form.component').then(
        (m) => m.ProductFormComponent
      ),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/product-form/product-form.component').then(
        (m) => m.ProductFormComponent
      ),
  },
];

