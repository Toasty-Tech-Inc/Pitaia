import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { TuiButton, TuiIcon, TuiLoader } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { TuiCardLarge } from '@taiga-ui/layout';
import { LayoutComponent } from '../../../../shared/components/layout/layout.component';
import { OrdersService } from '../../../../core/services/orders.service';
import { Order, OrderStatus } from '../../../../core/models/order.model';

@Component({
  selector: 'app-order-confirmation-page',
  imports: [
    RouterLink,
    DatePipe,
    CurrencyPipe,
    LayoutComponent,
    TuiButton,
    TuiIcon,
    TuiLoader,
    TuiBadge,
    TuiCardLarge,
  ],
  template: `
    <app-layout>
      <section class="confirmation-page">
        @if (loading()) {
          <div class="loading-container" role="status">
            <tui-loader size="l" />
          </div>
        } @else if (error()) {
          <div class="error-container" role="alert">
            <tui-icon icon="@tui.alert-circle" class="error-icon" />
            <h2>Pedido não encontrado</h2>
            <p>Não foi possível localizar este pedido.</p>
            <a routerLink="/menu" tuiButton appearance="primary">
              Voltar ao Cardápio
            </a>
          </div>
        } @else if (order()) {
          <div class="success-header">
            <div class="success-icon-container">
              <tui-icon icon="@tui.check-circle" class="success-icon" />
            </div>
            <h1 class="success-title">Pedido Confirmado!</h1>
            <p class="success-subtitle">
              Seu pedido #{{ order()!.orderNumber }} foi recebido com sucesso.
            </p>
          </div>

          <div tuiCardLarge class="order-details">
            <header class="details-header">
              <div>
                <h2>Pedido #{{ order()!.orderNumber }}</h2>
                <time class="order-date">
                  {{ order()!.createdAt | date: 'dd/MM/yyyy HH:mm' }}
                </time>
              </div>
              <tui-badge [appearance]="getStatusAppearance(order()!.status)">
                {{ getStatusLabel(order()!.status) }}
              </tui-badge>
            </header>

            <div class="items-section">
              <h3>Itens do Pedido</h3>
              <ul class="items-list">
                @for (item of order()!.items; track item.id) {
                  <li class="order-item">
                    <span class="item-qty">{{ item.quantity }}x</span>
                    <span class="item-name">{{ item.product?.name ?? 'Produto' }}</span>
                    <span class="item-price">{{ item.total | currency: 'BRL' }}</span>
                  </li>
                }
              </ul>
            </div>

            <div class="totals-section">
              <div class="total-line">
                <span>Subtotal</span>
                <span>{{ order()!.subtotal | currency: 'BRL' }}</span>
              </div>
              @if (order()!.discount > 0) {
                <div class="total-line discount">
                  <span>Desconto</span>
                  <span>-{{ order()!.discount | currency: 'BRL' }}</span>
                </div>
              }
              @if (order()!.deliveryFee > 0) {
                <div class="total-line">
                  <span>Taxa de Entrega</span>
                  <span>{{ order()!.deliveryFee | currency: 'BRL' }}</span>
                </div>
              }
              <div class="total-line total">
                <span>Total</span>
                <span>{{ order()!.total | currency: 'BRL' }}</span>
              </div>
            </div>

            @if (order()!.deliveryAddress) {
              <div class="address-section">
                <h3>Endereço de Entrega</h3>
                <address>
                  {{ order()!.deliveryAddress!.street }}, {{ order()!.deliveryAddress!.number }}
                  @if (order()!.deliveryAddress!.complement) {
                    - {{ order()!.deliveryAddress!.complement }}
                  }
                  <br />
                  {{ order()!.deliveryAddress!.neighborhood }} - 
                  {{ order()!.deliveryAddress!.city }}/{{ order()!.deliveryAddress!.state }}
                </address>
              </div>
            }
          </div>

          <div class="actions">
            <a routerLink="/menu" tuiButton appearance="primary" size="l">
              Fazer Novo Pedido
            </a>
            <a routerLink="/register" tuiButton appearance="outline">
              Criar conta para acompanhar pedidos
            </a>
          </div>

          <p class="info-text">
            <tui-icon icon="@tui.info" />
            Guarde o número do seu pedido para acompanhamento.
            Crie uma conta para ver o histórico completo.
          </p>
        }
      </section>
    </app-layout>
  `,
  styles: [`
    .confirmation-page {
      display: flex;
      flex-direction: column;
      align-items: center;
      max-width: 600px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .loading-container,
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 4rem 2rem;
      text-align: center;
    }

    .error-icon {
      width: 4rem;
      height: 4rem;
      color: var(--tui-status-negative);
      margin-bottom: 1rem;
    }

    .success-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .success-icon-container {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: var(--tui-status-positive-pale);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
    }

    .success-icon {
      width: 48px;
      height: 48px;
      color: var(--tui-status-positive);
    }

    .success-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--tui-text-primary);
      margin: 0 0 0.5rem;
    }

    .success-subtitle {
      font-size: 1rem;
      color: var(--tui-text-secondary);
      margin: 0;
    }

    .order-details {
      width: 100%;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .details-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--tui-border-normal);
      margin-bottom: 1rem;
    }

    .details-header h2 {
      margin: 0;
      font-size: 1.25rem;
    }

    .order-date {
      font-size: 0.875rem;
      color: var(--tui-text-secondary);
    }

    .items-section,
    .address-section {
      padding: 1rem 0;
      border-bottom: 1px solid var(--tui-border-normal);
    }

    .items-section h3,
    .address-section h3 {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--tui-text-secondary);
      text-transform: uppercase;
      margin: 0 0 0.75rem;
    }

    .items-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .order-item {
      display: flex;
      gap: 0.5rem;
      padding: 0.5rem 0;
    }

    .item-qty {
      color: var(--tui-text-secondary);
      min-width: 2rem;
    }

    .item-name {
      flex: 1;
    }

    .item-price {
      font-weight: 500;
    }

    .totals-section {
      padding: 1rem 0;
    }

    .total-line {
      display: flex;
      justify-content: space-between;
      padding: 0.25rem 0;
      color: var(--tui-text-secondary);
    }

    .total-line.discount {
      color: var(--tui-status-positive);
    }

    .total-line.total {
      font-size: 1.25rem;
      font-weight: 700;
      color: #FE3867;
      padding-top: 0.75rem;
      border-top: 1px solid var(--tui-border-normal);
      margin-top: 0.5rem;
    }

    .address-section address {
      font-style: normal;
      line-height: 1.6;
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: 100%;
      margin-bottom: 1.5rem;
    }

    .info-text {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--tui-text-secondary);
      text-align: center;
      padding: 1rem;
      background: var(--tui-background-neutral-1);
      border-radius: 8px;
      margin: 0;
    }

    .info-text tui-icon {
      flex-shrink: 0;
      color: var(--tui-status-info);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderConfirmationPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private ordersService = inject(OrdersService);

  protected loading = signal(true);
  protected error = signal(false);
  protected order = signal<Order | null>(null);

  ngOnInit(): void {
    const orderId = this.route.snapshot.params['id'];
    if (orderId) {
      this.loadOrder(orderId);
    } else {
      this.error.set(true);
      this.loading.set(false);
    }
  }

  private loadOrder(id: string): void {
    this.ordersService.trackOrder(id).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading order:', err);
        this.error.set(true);
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
      [OrderStatus.DELIVERING]: 'Saiu para entrega',
      [OrderStatus.COMPLETED]: 'Entregue',
      [OrderStatus.CANCELLED]: 'Cancelado',
    };
    return labels[status] ?? status;
  }

  protected getStatusAppearance(status: OrderStatus): string {
    const appearances: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'warning',
      [OrderStatus.CONFIRMED]: 'info',
      [OrderStatus.PREPARING]: 'info',
      [OrderStatus.READY]: 'success',
      [OrderStatus.DELIVERING]: 'info',
      [OrderStatus.COMPLETED]: 'success',
      [OrderStatus.CANCELLED]: 'error',
    };
    return appearances[status] ?? 'neutral';
  }
}
