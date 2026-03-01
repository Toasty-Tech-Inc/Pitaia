import { Route } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const appRoutes: Route[] = [
  // Rotas públicas - não requerem autenticação
  {
    path: '',
    loadChildren: () =>
      import('./features/home/home.routes').then((m) => m.homeRoutes),
  },
  {
    path: 'menu',
    loadChildren: () =>
      import('./features/menu/menu.routes').then((m) => m.menuRoutes),
  },
  {
    path: 'cart',
    loadChildren: () =>
      import('./features/cart/cart.routes').then((m) => m.cartRoutes),
  },
  
  // Rotas de autenticação
  {
    path: 'login',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/pages/register-page/register-page.component').then(
        (m) => m.RegisterPageComponent
      ),
  },

  // Checkout - permite usuários não autenticados (cadastro durante o processo)
  {
    path: 'checkout',
    loadChildren: () =>
      import('./features/checkout/checkout.routes').then((m) => m.checkoutRoutes),
  },

  // Confirmação de pedido - público (para quem fez pedido sem login)
  {
    path: 'order-confirmation/:id',
    loadComponent: () =>
      import('./features/checkout/pages/order-confirmation-page/order-confirmation-page.component').then(
        (m) => m.OrderConfirmationPageComponent
      ),
  },

  // Rotas protegidas - requerem autenticação
  {
    path: 'orders',
    loadChildren: () =>
      import('./features/orders/orders.routes').then((m) => m.ordersRoutes),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./features/profile/profile.routes').then((m) => m.profileRoutes),
    canActivate: [authGuard],
  },

  // Rota de estabelecimento por slug - deve ficar antes do fallback
  // Ex: /restaurante-pitaia carrega o estabelecimento com slug "restaurante-pitaia"
  {
    path: 'store/:slug',
    loadChildren: () =>
      import('./features/store/store.routes').then((m) => m.storeRoutes),
  },

  // Fallback
  {
    path: '**',
    redirectTo: '',
  },
];
