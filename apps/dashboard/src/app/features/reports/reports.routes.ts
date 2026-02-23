import { Route } from '@angular/router';

export const reportsRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/reports-dashboard/reports-dashboard.component').then(
        (m) => m.ReportsDashboardComponent
      ),
  },
  {
    path: 'sales',
    loadComponent: () =>
      import('./pages/sales-report/sales-report.component').then(
        (m) => m.SalesReportComponent
      ),
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./pages/products-report/products-report.component').then(
        (m) => m.ProductsReportComponent
      ),
  },
];
