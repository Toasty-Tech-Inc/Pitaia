import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard para rotas que requerem autenticação
 * Redireciona para login se não estiver autenticado
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Salva a URL que o usuário tentou acessar para redirecionar depois do login
  const returnUrl = state.url;
  router.navigate(['/login'], { queryParams: { returnUrl } });
  return false;
};

/**
 * Guard para checkout que permite usuários não autenticados
 * mas exibe o formulário de cadastro durante o processo
 */
export const checkoutGuard: CanActivateFn = () => {
  // Checkout não requer autenticação prévia
  // O usuário pode se cadastrar durante o processo
  return true;
};
