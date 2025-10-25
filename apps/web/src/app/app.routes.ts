import { Route } from '@angular/router';

export const appRoutes: Route[] = [
    {
        path: 'login',
        loadComponent: () => import('../app/pages/login/login').then((m) => m.Login),
    },
    {
        path: 'dashboard',
        loadComponent: () => import('../app/pages/dashboard/dashboard').then((m) => m.Dashboard),
    }
];
