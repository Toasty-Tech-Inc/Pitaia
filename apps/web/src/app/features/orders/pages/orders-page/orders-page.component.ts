import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { TuiButton, TuiIcon, TuiLoader } from '@taiga-ui/core';
import { TuiBadge, TuiTabs } from '@taiga-ui/kit';
import { TuiCardLarge } from '@taiga-ui/layout';
import { LayoutComponent } from '../../../../shared/components/layout/layout.component';
import { OrdersService } from '../../../../core/services/orders.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Order, OrderStatus } from '../../../../core/models/order.model';

@Component({
  selector: 'app-orders-page',
  imports: [
    RouterLink,
    DatePipe,
    CurrencyPipe,
    LayoutComponent,
    TuiButton,
    TuiIcon,
    TuiLoader,
    TuiBadge,
    TuiTabs,
    TuiCardLarge,
  ],
  template: `
    <app-layout>
      <section class="orders-page">
        <header class="orders-header">
          <h1 class="orders-title">Meus Pedidos</h1>
        </header>

        @if (!isAuthenticated()) {
          <div class="login-required" role="alert">
            <tui-icon icon="@tui.lock" class="lock-icon" />
            <h2>Faça login para ver seus pedidos</h2>
            <p>Você precisa estar logado para acompanhar seus pedidos.</p>
            <a routerLink="/login" tuiButton appearance="primary">
              Fazer Login
            </a>
          </div>
        } @else if (loading()) {
          <div class="loading-container" role="status">
            <tui-loader size="l" />
          </div>
        } @else if (orders().length === 0) {
          <div class="empty-orders">
            <tui-icon icon="@tui.package" class="empty-icon" />
            <h2>Nenhum pedido encontrado</h2>
            <p>Você ainda não fez nenhum pedido.</p>
            <a routerLink="/menu" tuiButton appearance="primary">
              Ver Cardápio
            </a>
          </div>
        } @else {
          <tui-tabs [(activeItemIndex)]="selectedTabIndex">
            <button tuiTab>Todos</button>
            <button tuiTab>Em andamento</button>
            <button tuiTab>Finalizados</button>
          </tui-tabs>

          <div class="orders-list" role="list">
            @for (order of filteredOrders(); track order.id) {
              <article tuiCardLarge class="order-card" role="listitem">
                <div class="order-header">
                  <div class="order-info">
                    <span class="order-number">Pedido #{{ order.orderNumber }}</span>
                    <time class="order-date">
                      {{ order.createdAt | date: 'dd/MM/yyyy HH:mm' }}
                    </time>
                  </div>
                  <tui-badge [appearance]="getStatusAppearance(order.status)">
                    {{ getStatusLabel(order.status) }}
                  </tui-badge>
                </div>

                <div class="order-items">
                  @for (item of order.items; track item.id; let last = $last) {
                    <span>{{ item.quantity }}x {{ item.product?.name ?? 'Produto' }}</span>
                    @if (!last) {
                      <span class="item-separator">, </span>
                    }
                  }
                </div>

                <div class="order-footer">
                  <span class="order-total">
                    {{ order.total | currency: 'BRL' : 'symbol' : '1.2-2' }}
                  </span>
                  <a 
                    [routerLink]="['/orders', order.id]" 
                    tuiButton 
                    appearance="outline" 
                    size="s"
                  >
                    Ver detalhes
                  </a>
                </div>
              </article>
            }
          </div>
        }
      </section>
    </app-layout>
  `,
  styles: [`
    .orders-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .orders-title {
      font-size: 2rem;
      font-weight: 700;
      margin: 0;
    }

    .login-required,
    .empty-orders {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 4rem 2rem;
      text-align: center;
    }

    .lock-icon,
    .empty-icon {
      width: 4rem;
      height: 4rem;
      color: var(--tui-text-tertiary);
      margin-bottom: 1rem;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 4rem;
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .order-card {
      padding: 1.25rem;
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
    }

    .order-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .order-number {
      font-weight: 600;
      font-size: 1rem;
    }

    .order-date {
      font-size: 0.875rem;
      color: var(--tui-text-secondary);
    }

    .order-items {
      font-size: 0.875rem;
      color: var(--tui-text-secondary);
      margin-bottom: 1rem;
      line-height: 1.5;
    }

    .item-separator {
      color: var(--tui-text-tertiary);
    }

    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 0.75rem;
      border-top: 1px solid var(--tui-border-normal);
    }

    .order-total {
      font-size: 1.125rem;
      font-weight: 700;
      color: #FE3867;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersPageComponent implements OnInit {
  private ordersService = inject(OrdersService);
  private authService = inject(AuthService);

  protected isAuthenticated = this.authService.isAuthenticated;
  protected loading = signal(true);
  protected orders = signal<Order[]>([]);
  protected selectedTabIndex = 0;

  protected filteredOrders = () => {
    const allOrders = this.orders();
    switch (this.selectedTabIndex) {
      case 1: // Em andamento
        return allOrders.filter((o) =>
          [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.DELIVERING].includes(o.status)
        );
      case 2: // Finalizados
        return allOrders.filter((o) =>
          [OrderStatus.COMPLETED, OrderStatus.CANCELLED].includes(o.status)
        );
      default:
        return allOrders;
    }
  };

  ngOnInit(): void {
    if (this.isAuthenticated()) {
      this.loadOrders();
    } else {
      this.loading.set(false);
    }
  }

  private loadOrders(): void {
    this.loading.set(true);
    this.ordersService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.loading.set(false);
      },
    });
  }

  protected getStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'Pendente',
      [OrderStatus.CONFIRMED]: 'Confirmado',
      [OrderStatus.PREPARING]: 'Preparando',
      [OrderStatus.READY]: 'Pronto',
      [OrderStatus.DELIVERING]: 'Em entrega',
      [OrderStatus.COMPLETED]: 'Finalizado',
      [OrderStatus.CANCELLED]: 'Cancelado',
    };
    return labels[status] ?? status;
  }

  protected getStatusAppearance(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.COMPLETED:
        return 'success';
      case OrderStatus.CANCELLED:
        return 'error';
      case OrderStatus.PREPARING:
      case OrderStatus.READY:
      case OrderStatus.DELIVERING:
        return 'warning';
      default:
        return 'info';
    }
  }
}
