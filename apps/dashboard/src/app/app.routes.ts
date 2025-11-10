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
            import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
        canActivate: [isUserLogged],
    },
    {
        path: '**',
        redirectTo: 'login',
        pathMatch: 'full'
    }
];