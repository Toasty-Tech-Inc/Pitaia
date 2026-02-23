import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TuiButton, TuiIcon, TuiAppearance, TuiLoader, TuiDialogService } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { TuiCardLarge } from '@taiga-ui/layout';

import { LayoutComponent } from '../../../../shared/components/layout/layout.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { OrdersService } from '../../../../core/services/orders.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Order, OrderStatus, OrderType, OrderSource } from '../../../../core/models/order.model';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    TuiButton,
    TuiIcon,
    TuiAppearance,
    TuiBadge,
    TuiCardLarge,
    TuiLoader,
    LayoutComponent,
    PageHeaderComponent,
  ],
  template: `
    <app-layout>
      <app-page-header
        [title]="'Pedido #' + (order()?.orderNumber || '')"
        [breadcrumbs]="['Pedidos', 'Detalhes']"
        [showSearch]="false"
      >
        <ng-container actions>
          <button
            tuiButton
            appearance="outline"
            size="m"
            (click)="printOrder()"
          >
            <tui-icon icon="@tui.printer" />
            Imprimir
          </button>
          @if (canCancel()) {
            <button
              tuiButton
              appearance="outline"
              size="m"
              class="cancel-btn"
              (click)="confirmCancel()"
            >
              <tui-icon icon="@tui.x" />
              Cancelar
            </button>
          }
        </ng-container>
      </app-page-header>

      @if (loading()) {
        <div class="loading-container">
          <tui-loader size="l" />
        </div>
      } @else if (order()) {
        <div class="order-detail-container">
          <!-- Order Info & Actions -->
          <div class="main-section">
            <!-- Status Card -->
            <div tuiCardLarge tuiAppearance="floating" class="status-card">
              <div class="status-header">
                <h3>Status do Pedido</h3>
                <tui-badge
                  [appearance]="getStatusAppearance(order()!.status)"
                  size="l"
                >
                  {{ getStatusLabel(order()!.status) }}
                </tui-badge>
              </div>

              <div class="status-actions">
                @for (action of getAvailableActions(); track action.status) {
                  <button
                    tuiButton
                    [appearance]="action.appearance"
                    size="m"
                    (click)="updateStatus(action.status)"
                  >
                    <tui-icon [icon]="action.icon" />
                    {{ action.label }}
                  </button>
                }
              </div>

              <div class="status-timeline">
                @for (step of statusTimeline; track step.status) {
                  <div class="timeline-step" [class.completed]="isStatusCompleted(step.status)" [class.current]="order()!.status === step.status">
                    <div class="step-indicator">
                      @if (isStatusCompleted(step.status)) {
                        <tui-icon icon="@tui.check" />
                      }
                    </div>
                    <span class="step-label">{{ step.label }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Items -->
            <div tuiCardLarge tuiAppearance="floating" class="items-card">
              <h3>Itens do Pedido</h3>
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qtd</th>
                    <th>Preço Unit.</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of order()!.items || []; track item.id) {
                    <tr>
                      <td>
                        <div class="item-info">
                          <span class="item-name">{{ item.product?.name || 'Produto' }}</span>
                          @if (item.notes) {
                            <span class="item-notes">{{ item.notes }}</span>
                          }
                        </div>
                      </td>
                      <td>{{ item.quantity }}x</td>
                      <td>{{ item.unitPrice | currency:'BRL':'symbol':'1.2-2' }}</td>
                      <td>{{ item.total | currency:'BRL':'symbol':'1.2-2' }}</td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="4" class="empty">Nenhum item no pedido</td>
                    </tr>
                  }
                </tbody>
              </table>

              <div class="totals">
                <div class="total-row">
                  <span>Subtotal</span>
                  <span>{{ order()!.subtotal | currency:'BRL':'symbol':'1.2-2' }}</span>
                </div>
                @if (order()!.discount > 0) {
                  <div class="total-row discount">
                    <span>Desconto</span>
                    <span>-{{ order()!.discount | currency:'BRL':'symbol':'1.2-2' }}</span>
                  </div>
                }
                @if (order()!.deliveryFee > 0) {
                  <div class="total-row">
                    <span>Taxa de Entrega</span>
                    <span>{{ order()!.deliveryFee | currency:'BRL':'symbol':'1.2-2' }}</span>
                  </div>
                }
                @if (order()!.serviceFee > 0) {
                  <div class="total-row">
                    <span>Taxa de Serviço</span>
                    <span>{{ order()!.serviceFee | currency:'BRL':'symbol':'1.2-2' }}</span>
                  </div>
                }
                <div class="total-row grand-total">
                  <span>Total</span>
                  <span>{{ order()!.total | currency:'BRL':'symbol':'1.2-2' }}</span>
                </div>
              </div>
            </div>

            <!-- Notes -->
            @if (order()!.notes || order()!.kitchenNotes) {
              <div tuiCardLarge tuiAppearance="floating" class="notes-card">
                <h3>Observações</h3>
                @if (order()!.notes) {
                  <div class="note-section">
                    <span class="note-label">Cliente:</span>
                    <p>{{ order()!.notes }}</p>
                  </div>
                }
                @if (order()!.kitchenNotes) {
                  <div class="note-section">
                    <span class="note-label">Cozinha:</span>
                    <p>{{ order()!.kitchenNotes }}</p>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Sidebar Info -->
          <div class="sidebar-section">
            <!-- Order Info -->
            <div tuiCardLarge tuiAppearance="floating" class="info-card">
              <h3>Informações</h3>
              <div class="info-grid">
                <div class="info-item">
                  <tui-icon icon="@tui.calendar" />
                  <div>
                    <span class="info-label">Data</span>
                    <span class="info-value">{{ order()!.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                </div>

                <div class="info-item">
                  <tui-icon [icon]="getTypeIcon(order()!.type)" />
                  <div>
                    <span class="info-label">Tipo</span>
                    <span class="info-value">{{ getTypeLabel(order()!.type) }}</span>
                  </div>
                </div>

                <div class="info-item">
                  <tui-icon icon="@tui.smartphone" />
                  <div>
                    <span class="info-label">Origem</span>
                    <span class="info-value">{{ getSourceLabel(order()!.source) }}</span>
                  </div>
                </div>

                @if (order()!.table) {
                  <div class="info-item">
                    <tui-icon icon="@tui.grid" />
                    <div>
                      <span class="info-label">Mesa</span>
                      <span class="info-value">{{ order()!.table.name }}</span>
                    </div>
                  </div>
                }

                @if (order()!.waiter) {
                  <div class="info-item">
                    <tui-icon icon="@tui.user" />
                    <div>
                      <span class="info-label">Garçom</span>
                      <span class="info-value">{{ order()!.waiter.name }}</span>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Customer Info -->
            @if (order()!.customer) {
              <div tuiCardLarge tuiAppearance="floating" class="info-card">
                <h3>Cliente</h3>
                <div class="customer-info">
                  <div class="customer-avatar">
                    <tui-icon icon="@tui.user" />
                  </div>
                  <div class="customer-details">
                    <span class="customer-name">{{ order()!.customer.name }}</span>
                    @if (order()!.customer.phone) {
                      <span class="customer-contact">
                        <tui-icon icon="@tui.phone" />
                        {{ order()!.customer.phone }}
                      </span>
                    }
                    @if (order()!.customer.email) {
                      <span class="customer-contact">
                        <tui-icon icon="@tui.mail" />
                        {{ order()!.customer.email }}
                      </span>
                    }
                  </div>
                </div>
              </div>
            }

            <!-- Delivery Address -->
            @if (order()!.type === OrderType.DELIVERY && order()!.deliveryAddress) {
              <div tuiCardLarge tuiAppearance="floating" class="info-card">
                <h3>Endereço de Entrega</h3>
                <div class="address-info">
                  <tui-icon icon="@tui.map-pin" />
                  <div>
                    <p>{{ order()!.deliveryAddress.street }}, {{ order()!.deliveryAddress.number }}</p>
                    @if (order()!.deliveryAddress.complement) {
                      <p>{{ order()!.deliveryAddress.complement }}</p>
                    }
                    <p>{{ order()!.deliveryAddress.neighborhood }}</p>
                    <p>{{ order()!.deliveryAddress.city }} - {{ order()!.deliveryAddress.state }}</p>
                    @if (order()!.deliveryAddress.reference) {
                      <p class="reference">Ref: {{ order()!.deliveryAddress.reference }}</p>
                    }
                  </div>
                </div>
              </div>
            }

            <!-- Coupon -->
            @if (order()!.coupon) {
              <div tuiCardLarge tuiAppearance="floating" class="info-card coupon-card">
                <h3>Cupom Aplicado</h3>
                <div class="coupon-info">
                  <tui-icon icon="@tui.tag" />
                  <span class="coupon-code">{{ order()!.coupon.code }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="error-state">
          <tui-icon icon="@tui.alert-circle" />
          <p>Pedido não encontrado</p>
          <button tuiButton appearance="primary" (click)="goBack()">
            Voltar para Pedidos
          </button>
        </div>
      }
    </app-layout>
  `,
  styles: [`
    .loading-container, .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem;
      gap: 1rem;

      tui-icon {
        font-size: 3rem;
        color: var(--tui-text-secondary);
      }
    }

    .order-detail-container {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 1.5rem;

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
      }
    }

    .main-section, .sidebar-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    h3 {
      margin: 0 0 1rem;
      font-size: 1.125rem;
      font-weight: 600;
    }

    .status-card {
      padding: 1.5rem;
    }

    .status-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .status-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-bottom: 1.5rem;
    }

    .status-timeline {
      display: flex;
      justify-content: space-between;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        top: 12px;
        left: 24px;
        right: 24px;
        height: 2px;
        background: var(--tui-border-normal);
      }
    }

    .timeline-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      position: relative;
      z-index: 1;

      .step-indicator {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: var(--tui-background-base);
        border: 2px solid var(--tui-border-normal);
        display: flex;
        align-items: center;
        justify-content: center;

        tui-icon {
          font-size: 0.75rem;
        }
      }

      .step-label {
        font-size: 0.75rem;
        color: var(--tui-text-secondary);
      }

      &.completed .step-indicator {
        background: var(--tui-status-positive);
        border-color: var(--tui-status-positive);
        color: white;
      }

      &.current .step-indicator {
        border-color: var(--tui-primary);
        border-width: 3px;
      }

      &.current .step-label {
        color: var(--tui-primary);
        font-weight: 600;
      }
    }

    .items-card {
      padding: 1.5rem;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1.5rem;

      th, td {
        padding: 0.75rem;
        text-align: left;
        border-bottom: 1px solid var(--tui-border-normal);
      }

      th {
        font-weight: 600;
        font-size: 0.875rem;
        color: var(--tui-text-secondary);
      }

      .empty {
        text-align: center;
        color: var(--tui-text-secondary);
        padding: 2rem;
      }
    }

    .item-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .item-name {
      font-weight: 500;
    }

    .item-notes {
      font-size: 0.75rem;
      color: var(--tui-text-secondary);
    }

    .totals {
      border-top: 1px solid var(--tui-border-normal);
      padding-top: 1rem;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;

      &.discount {
        color: var(--tui-status-positive);
      }

      &.grand-total {
        font-size: 1.25rem;
        font-weight: 700;
        border-top: 1px solid var(--tui-border-normal);
        padding-top: 1rem;
        margin-top: 0.5rem;
      }
    }

    .notes-card {
      padding: 1.5rem;
    }

    .note-section {
      margin-bottom: 1rem;

      &:last-child {
        margin-bottom: 0;
      }

      .note-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--tui-text-secondary);
      }

      p {
        margin: 0.25rem 0 0;
      }
    }

    .info-card {
      padding: 1.5rem;
    }

    .info-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .info-item {
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;

      tui-icon {
        color: var(--tui-text-secondary);
        margin-top: 0.125rem;
      }

      > div {
        display: flex;
        flex-direction: column;
      }

      .info-label {
        font-size: 0.75rem;
        color: var(--tui-text-secondary);
      }

      .info-value {
        font-weight: 500;
      }
    }

    .customer-info {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .customer-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--tui-background-neutral-1);
      display: flex;
      align-items: center;
      justify-content: center;

      tui-icon {
        font-size: 1.5rem;
        color: var(--tui-text-secondary);
      }
    }

    .customer-details {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .customer-name {
      font-weight: 600;
    }

    .customer-contact {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--tui-text-secondary);

      tui-icon {
        font-size: 0.875rem;
      }
    }

    .address-info {
      display: flex;
      gap: 0.75rem;

      tui-icon {
        color: var(--tui-primary);
        margin-top: 0.125rem;
      }

      p {
        margin: 0 0 0.25rem;
        font-size: 0.875rem;

        &.reference {
          color: var(--tui-text-secondary);
          font-style: italic;
        }
      }
    }

    .coupon-card .coupon-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      tui-icon {
        color: var(--tui-status-positive);
      }

      .coupon-code {
        font-weight: 600;
        font-size: 1.125rem;
      }
    }

    .cancel-btn {
      color: var(--tui-status-negative);
      border-color: var(--tui-status-negative);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ordersService = inject(OrdersService);
  private notificationService = inject(NotificationService);
  private dialogService = inject(TuiDialogService);

  protected readonly OrderType = OrderType;

  loading = signal(true);
  order = signal<Order | null>(null);

  statusTimeline = [
    { status: OrderStatus.PENDING, label: 'Pendente' },
    { status: OrderStatus.CONFIRMED, label: 'Confirmado' },
    { status: OrderStatus.PREPARING, label: 'Preparando' },
    { status: OrderStatus.READY, label: 'Pronto' },
    { status: OrderStatus.COMPLETED, label: 'Finalizado' },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrder(id);
    } else {
      this.loading.set(false);
    }
  }

  loadOrder(id: string): void {
    this.loading.set(true);
    this.ordersService.getById(id).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.error('Erro ao carregar pedido');
        this.loading.set(false);
      },
    });
  }

  updateStatus(status: OrderStatus): void {
    const order = this.order();
    if (!order) return;

    this.ordersService.updateStatus(order.id, status).subscribe({
      next: (updated) => {
        this.order.set(updated);
        this.notificationService.success('Status atualizado com sucesso');
      },
      error: () => {
        this.notificationService.error('Erro ao atualizar status');
      },
    });
  }

  confirmCancel(): void {
    this.dialogService.open(
      new PolymorpheusComponent(ConfirmDialogComponent),
      {
        data: {
          title: 'Cancelar Pedido',
          message: `Tem certeza que deseja cancelar o pedido #${this.order()?.orderNumber}? Esta ação não pode ser desfeita.`,
          confirmText: 'Cancelar Pedido',
          cancelText: 'Voltar',
          type: 'danger',
        },
        dismissible: true,
        size: 's',
      }
    ).subscribe((confirmed) => {
      if (confirmed) {
        this.cancelOrder();
      }
    });
  }

  private cancelOrder(): void {
    const order = this.order();
    if (!order) return;

    this.ordersService.cancel(order.id).subscribe({
      next: (updated) => {
        this.order.set(updated);
        this.notificationService.success('Pedido cancelado');
      },
      error: () => {
        this.notificationService.error('Erro ao cancelar pedido');
      },
    });
  }

  printOrder(): void {
    this.notificationService.info(`Imprimindo pedido #${this.order()?.orderNumber}...`);
    // TODO: Implement print functionality
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }

  canCancel(): boolean {
    const order = this.order();
    if (!order) return false;
    return ![OrderStatus.COMPLETED, OrderStatus.CANCELLED].includes(order.status);
  }

  isStatusCompleted(status: OrderStatus): boolean {
    const order = this.order();
    if (!order) return false;

    const statusOrder = [
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.PREPARING,
      OrderStatus.READY,
      OrderStatus.COMPLETED,
    ];

    const currentIndex = statusOrder.indexOf(order.status);
    const checkIndex = statusOrder.indexOf(status);

    return checkIndex < currentIndex;
  }

  getAvailableActions(): { status: OrderStatus; label: string; icon: string; appearance: string }[] {
    const order = this.order();
    if (!order) return [];

    const nextActions: Record<OrderStatus, { status: OrderStatus; label: string; icon: string; appearance: string }[]> = {
      [OrderStatus.PENDING]: [
        { status: OrderStatus.CONFIRMED, label: 'Confirmar', icon: '@tui.check', appearance: 'primary' },
      ],
      [OrderStatus.CONFIRMED]: [
        { status: OrderStatus.PREPARING, label: 'Iniciar Preparo', icon: '@tui.chef-hat', appearance: 'primary' },
      ],
      [OrderStatus.PREPARING]: [
        { status: OrderStatus.READY, label: 'Marcar Pronto', icon: '@tui.check-circle', appearance: 'primary' },
      ],
      [OrderStatus.READY]: [
        { status: OrderStatus.COMPLETED, label: 'Finalizar', icon: '@tui.check-circle', appearance: 'primary' },
        ...(order.type === OrderType.DELIVERY ? [
          { status: OrderStatus.DELIVERING, label: 'Saiu p/ Entrega', icon: '@tui.truck', appearance: 'outline' as const },
        ] : []),
      ],
      [OrderStatus.DELIVERING]: [
        { status: OrderStatus.COMPLETED, label: 'Entregue', icon: '@tui.check-circle', appearance: 'primary' },
      ],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    return nextActions[order.status] || [];
  }

  protected getTypeIcon(type: OrderType): string {
    const icons: Record<OrderType, string> = {
      [OrderType.DINE_IN]: '@tui.grid',
      [OrderType.TAKEOUT]: '@tui.shopping-bag',
      [OrderType.DELIVERY]: '@tui.truck',
      [OrderType.CUSTOM]: '@tui.shopping-cart',
    };
    return icons[type] || '@tui.shopping-cart';
  }

  protected getTypeLabel(type: OrderType): string {
    const labels: Record<OrderType, string> = {
      [OrderType.DINE_IN]: 'Mesa',
      [OrderType.TAKEOUT]: 'Retirada',
      [OrderType.DELIVERY]: 'Delivery',
      [OrderType.CUSTOM]: 'Personalizado',
    };
    return labels[type] || type;
  }

  protected getSourceLabel(source: OrderSource): string {
    const labels: Record<OrderSource, string> = {
      [OrderSource.POS]: 'PDV',
      [OrderSource.ONLINE]: 'Online',
      [OrderSource.MOBILE]: 'App',
      [OrderSource.IFOOD]: 'iFood',
      [OrderSource.RAPPI]: 'Rappi',
      [OrderSource.WHATSAPP]: 'WhatsApp',
      [OrderSource.PHONE]: 'Telefone',
    };
    return labels[source] || source;
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
    return appearances[status] || 'neutral';
  }

  protected getStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'Pendente',
      [OrderStatus.CONFIRMED]: 'Confirmado',
      [OrderStatus.PREPARING]: 'Preparando',
      [OrderStatus.READY]: 'Pronto',
      [OrderStatus.DELIVERING]: 'Entregando',
      [OrderStatus.COMPLETED]: 'Finalizado',
      [OrderStatus.CANCELLED]: 'Cancelado',
    };
    return labels[status] || status;
  }
}
