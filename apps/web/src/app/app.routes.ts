import { Route } from '@angular/router';

export const appRoutes: Route[] = [
    {
        path: 'login',
        loadComponent: () => import('../app/pages/login/login').then((m) => m.Login),
    }
];
