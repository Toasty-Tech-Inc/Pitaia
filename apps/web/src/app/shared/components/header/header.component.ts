import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiButton, TuiIcon, TuiLink } from '@taiga-ui/core';
import { TuiAvatar, TuiBadgeNotification } from '@taiga-ui/kit';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { EstablishmentService } from '../../../core/services/establishment.service';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    TuiButton,
    TuiIcon,
    TuiLink,
    TuiAvatar,
    TuiBadgeNotification,
  ],
  template: `
    <header class="header">
      <div class="header-content">
        <a routerLink="/" class="logo" aria-label="Página inicial">
          @if (establishment()?.logo) {
            <img [src]="establishment()!.logo" [alt]="establishment()!.name" class="logo-img" />
          } @else {
            <span class="logo-text">{{ establishment()?.name ?? 'Pitaia' }}</span>
          }
        </a>

        <nav class="nav" aria-label="Navegação principal">
          <a tuiLink routerLink="/menu" class="nav-link">Cardápio</a>
          @if (isAuthenticated()) {
            <a tuiLink routerLink="/orders" class="nav-link">Meus Pedidos</a>
          }
        </nav>

        <div class="header-actions">
          <a 
            routerLink="/cart" 
            tuiButton
            appearance="flat"
            size="m"
            class="cart-button"
            aria-label="Carrinho de compras"
          >
            <tui-icon icon="@tui.shopping-cart" />
            @if (cartItemCount() > 0) {
              <tui-badge-notification>
                {{ cartItemCount() }}
              </tui-badge-notification>
            }
          </a>

          @if (isAuthenticated()) {
            <a 
              routerLink="/profile" 
              tuiButton 
              appearance="flat"
              size="m"
              class="profile-button"
              [attr.aria-label]="'Perfil de ' + customerName()"
            >
              <tui-avatar
                [attr.text]="customerName()"
                [round]="true"
              />
            </a>
          } @else {
            <a routerLink="/login" tuiButton appearance="primary" size="m">
              Entrar
            </a>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: white;
      border-bottom: 1px solid var(--tui-border-normal);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0.75rem 1rem;
      gap: 1rem;
    }

    .logo {
      display: flex;
      align-items: center;
      text-decoration: none;
    }

    .logo-img {
      height: 40px;
      width: auto;
    }

    .logo-text {
      font-size: 1.5rem;
      font-weight: 700;
      color: #FE3867;
    }

    .nav {
      display: flex;
      gap: 1.5rem;
    }

    .nav-link {
      font-weight: 500;
      color: var(--tui-text-secondary);
      transition: color 0.2s;
    }

    .nav-link:hover {
      color: #FE3867;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .cart-button {
      position: relative;
    }

    @media (max-width: 768px) {
      .nav {
        display: none;
      }

      .header-content {
        padding: 0.5rem 1rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private establishmentService = inject(EstablishmentService);

  protected cartItemCount = this.cartService.itemCount;
  protected isAuthenticated = this.authService.isAuthenticated;
  protected customerName = this.authService.customerName;
  protected establishment = this.establishmentService.establishment;
}
