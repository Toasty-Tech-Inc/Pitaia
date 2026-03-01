import { ChangeDetectionStrategy, Component, inject, signal, OnInit, OnDestroy, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { TuiButton, TuiIcon, TuiLoader } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { TuiCardLarge } from '@taiga-ui/layout';
import { interval, Subscription, switchMap, takeWhile } from 'rxjs';
import { LayoutComponent } from '../../../../shared/components/layout/layout.component';
import { OrdersService } from '../../../../core/services/orders.service';
import { Order, OrderStatus } from '../../../../core/models/order.model';

@Component({
  selector: 'app-order-detail-page',
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
      <section class="order-detail-page">
        <header class="page-header">
          <a routerLink="/orders" class="back-link" aria-label="Voltar aos pedidos">
            <tui-icon icon="@tui.arrow-left" />
          </a>
          <h1 class="page-title">
            @if (order()) {
              Pedido #{{ order()!.orderNumber }}
            } @else {
              Detalhes do Pedido
            }
          </h1>
        </header>

        @if (loading()) {
          <div class="loading-container" role="status">
            <tui-loader size="l" />
          </div>
        } @else if (!order()) {
          <div class="not-found" role="alert">
            <tui-icon icon="@tui.alert-circle" class="error-icon" />
            <h2>Pedido não encontrado</h2>
            <a routerLink="/orders" tuiButton appearance="primary">
              Ver meus pedidos
            </a>
          </div>
        } @else {
          <div class="order-content">
            <div class="main-content">
              <!-- Status Timeline -->
              <div tuiCardLarge class="status-card">
                <div class="status-header">
                  <h2>Acompanhe seu pedido</h2>
                  <tui-badge [appearance]="statusAppearance()" size="l">
                    {{ statusLabel() }}
                  </tui-badge>
                </div>

                <div class="status-timeline" role="list" aria-label="Status do pedido">
                  @for (step of statusSteps; track step.status; let i = $index) {
                    <div 
                      class="timeline-step"
                      [class.completed]="isStepCompleted(step.status)"
                      [class.current]="order()!.status === step.status"
                      role="listitem"
                    >
                      <div class="step-indicator">
                        @if (isStepCompleted(step.status)) {
                          <tui-icon icon="@tui.check" />
                        } @else {
                          <span>{{ i + 1 }}</span>
                        }
                      </div>
                      <div class="step-content">
                        <span class="step-label">{{ step.label }}</span>
                        <span class="step-description">{{ step.description }}</span>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Order Items -->
              <div tuiCardLarge class="items-card">
                <h2>Itens do pedido</h2>
                <div class="items-list">
                  @for (item of order()!.items; track item.id) {
                    <div class="order-item">
                      <div class="item-info">
                        <span class="item-quantity">{{ item.quantity }}x</span>
                        <span class="item-name">{{ item.product?.name ?? 'Produto' }}</span>
                      </div>
                      <span class="item-price">
                        {{ item.total | currency: 'BRL' : 'symbol' : '1.2-2' }}
                      </span>
                    </div>
                  }
                </div>
              </div>

              <!-- Delivery Info -->
              @if (order()!.type === 'DELIVERY' && deliveryAddress()) {
                <div tuiCardLarge class="delivery-card">
                  <h2>
                    <tui-icon icon="@tui.map-pin" />
                    Endereço de entrega
                  </h2>
                  <address class="delivery-address">
                    {{ deliveryAddress()!.street }}, {{ deliveryAddress()!.number }}
                    @if (deliveryAddress()!.complement) {
                      - {{ deliveryAddress()!.complement }}
                    }
                    <br />
                    {{ deliveryAddress()!.neighborhood }} - 
                    {{ deliveryAddress()!.city }}/{{ deliveryAddress()!.state }}
                    <br />
                    CEP: {{ deliveryAddress()!.zipCode }}
                    @if (deliveryAddress()!.reference) {
                      <br />
                      <em>Referência: {{ deliveryAddress()!.reference }}</em>
                    }
                  </address>
                </div>
              }
            </div>

            <!-- Order Summary -->
            <aside class="order-summary">
              <div tuiCardLarge>
                <h2>Resumo</h2>
                
                <div class="summary-info">
                  <div class="info-row">
                    <span>Data</span>
                    <span>{{ order()!.createdAt | date: 'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                  <div class="info-row">
                    <span>Tipo</span>
                    <span>{{ order()!.type === 'DELIVERY' ? 'Entrega' : 'Retirada' }}</span>
                  </div>
                </div>

                <div class="summary-lines">
                  <div class="line">
                    <span>Subtotal</span>
                    <span>{{ order()!.subtotal | currency: 'BRL' }}</span>
                  </div>
                  @if (order()!.discount > 0) {
                    <div class="line discount">
                      <span>Desconto</span>
                      <span>-{{ order()!.discount | currency: 'BRL' }}</span>
                    </div>
                  }
                  @if (order()!.deliveryFee > 0) {
                    <div class="line">
                      <span>Taxa de entrega</span>
                      <span>{{ order()!.deliveryFee | currency: 'BRL' }}</span>
                    </div>
                  }
                </div>

                <div class="total-line">
                  <span>Total</span>
                  <span class="total-value">{{ order()!.total | currency: 'BRL' }}</span>
                </div>

                @if (order()!.notes) {
                  <div class="order-notes">
                    <strong>Observações:</strong>
                    <p>{{ order()!.notes }}</p>
                  </div>
                }
              </div>
            </aside>
          </div>
        }
      </section>
    </app-layout>
  `,
  styles: [`
    .order-detail-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .back-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      background: var(--tui-background-neutral-1);
      color: var(--tui-text-secondary);
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
    }

    .loading-container,
    .not-found {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem;
    }

    .error-icon {
      width: 4rem;
      height: 4rem;
      color: var(--tui-status-negative);
      margin-bottom: 1rem;
    }

    .order-content {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 2rem;
      align-items: start;
    }

    .main-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .status-card,
    .items-card,
    .delivery-card {
      padding: 1.5rem;
    }

    .status-card h2,
    .items-card h2,
    .delivery-card h2 {
      margin: 0 0 1.5rem;
      font-size: 1.125rem;
    }

    .status-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .status-header h2 {
      margin: 0;
    }

    .status-timeline {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .timeline-step {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 0.75rem;
      border-radius: 8px;
      opacity: 0.5;
    }

    .timeline-step.completed {
      opacity: 1;
    }

    .timeline-step.current {
      opacity: 1;
      background: var(--tui-background-neutral-1);
    }

    .step-indicator {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--tui-background-neutral-2);
      color: var(--tui-text-secondary);
      font-weight: 600;
      flex-shrink: 0;
    }

    .timeline-step.completed .step-indicator {
      background: var(--tui-status-positive);
      color: white;
    }

    .timeline-step.current .step-indicator {
      background: #FE3867;
      color: white;
    }

    .step-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .step-label {
      font-weight: 600;
    }

    .step-description {
      font-size: 0.875rem;
      color: var(--tui-text-secondary);
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .order-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--tui-border-normal);
    }

    .order-item:last-child {
      border-bottom: none;
    }

    .item-info {
      display: flex;
      gap: 0.5rem;
    }

    .item-quantity {
      color: var(--tui-text-secondary);
      font-weight: 500;
    }

    .item-name {
      font-weight: 500;
    }

    .item-price {
      color: var(--tui-text-secondary);
    }

    .delivery-card h2 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .delivery-address {
      font-style: normal;
      line-height: 1.6;
      color: var(--tui-text-secondary);
    }

    .order-summary {
      position: sticky;
      top: 80px;
    }

    .order-summary h2 {
      margin: 0 0 1rem;
      font-size: 1.125rem;
    }

    .summary-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding-bottom: 1rem;
      margin-bottom: 1rem;
      border-bottom: 1px solid var(--tui-border-normal);
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
      color: var(--tui-text-secondary);
    }

    .summary-lines {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--tui-border-normal);
    }

    .line {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
      color: var(--tui-text-secondary);
    }

    .line.discount {
      color: var(--tui-status-positive);
    }

    .total-line {
      display: flex;
      justify-content: space-between;
      padding-top: 1rem;
      font-weight: 600;
    }

    .total-value {
      font-size: 1.25rem;
      color: #FE3867;
    }

    .order-notes {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--tui-border-normal);
    }

    .order-notes p {
      margin: 0.5rem 0 0;
      color: var(--tui-text-secondary);
    }

    @media (max-width: 1024px) {
      .order-content {
        grid-template-columns: 1fr;
      }

      .order-summary {
        position: static;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private ordersService = inject(OrdersService);

  protected loading = signal(true);
  protected order = signal<Order | null>(null);
  private pollingSubscription?: Subscription;

  protected deliveryAddress = computed(() => this.order()?.deliveryAddress ?? null);

  protected statusSteps = [
    { status: OrderStatus.PENDING, label: 'Pendente', description: 'Aguardando confirmação' },
    { status: OrderStatus.CONFIRMED, label: 'Confirmado', description: 'Pedido aceito pelo estabelecimento' },
    { status: OrderStatus.PREPARING, label: 'Preparando', description: 'Seu pedido está sendo preparado' },
    { status: OrderStatus.READY, label: 'Pronto', description: 'Pedido pronto para retirada/entrega' },
    { status: OrderStatus.COMPLETED, label: 'Finalizado', description: 'Pedido entregue' },
  ];

  protected statusLabel = computed(() => {
    const currentOrder = this.order();
    if (!currentOrder) return '';
    const step = this.statusSteps.find((s) => s.status === currentOrder.status);
    if (step) return step.label;
    if (currentOrder.status === OrderStatus.CANCELLED) return 'Cancelado';
    if (currentOrder.status === OrderStatus.DELIVERING) return 'Em entrega';
    return currentOrder.status;
  });

  protected statusAppearance = computed(() => {
    const status = this.order()?.status;
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
  });

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrder(orderId);
      this.startPolling(orderId);
    } else {
      this.loading.set(false);
    }
  }

  ngOnDestroy(): void {
    this.pollingSubscription?.unsubscribe();
  }

  private loadOrder(id: string): void {
    this.ordersService.getById(id).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading order:', err);
        this.loading.set(false);
      },
    });
  }

  private startPolling(orderId: string): void {
    this.pollingSubscription = interval(30000)
      .pipe(
        switchMap(() => this.ordersService.getById(orderId)),
        takeWhile((order) => 
          ![OrderStatus.COMPLETED, OrderStatus.CANCELLED].includes(order.status),
          true
        )
      )
      .subscribe({
        next: (order) => this.order.set(order),
        error: (err) => console.error('Polling error:', err),
      });
  }

  protected isStepCompleted(status: OrderStatus): boolean {
    const order = this.order();
    if (!order) return false;
    const currentIndex = this.statusSteps.findIndex((s) => s.status === order.status);
    const stepIndex = this.statusSteps.findIndex((s) => s.status === status);
    return stepIndex < currentIndex;
  }
}
