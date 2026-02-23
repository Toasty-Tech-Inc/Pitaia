import { Route } from '@angular/router';

export const tablesRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/tables-list/tables-list.component').then(
        (m) => m.TablesListComponent
      ),
  },
];

