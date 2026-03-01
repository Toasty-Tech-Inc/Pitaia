import { Route } from '@angular/router';

export const storeRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/store-page/store-page.component').then(
        (m) => m.StorePageComponent
      ),
  },
];
