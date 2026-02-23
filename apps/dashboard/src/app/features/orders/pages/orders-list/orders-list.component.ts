import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TuiButton, TuiIcon, TuiAppearance, TuiDropdown, TuiLoader } from '@taiga-ui/core';
import { TuiBadge, TuiTabs } from '@taiga-ui/kit';
import { TuiCardLarge } from '@taiga-ui/layout';

import { LayoutComponent } from '../../../../shared/components/layout/layout.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { KanbanColumnComponent, KanbanColumn } from '../../components/kanban-column/kanban-column.component';
import { OrdersService } from '../../../../core/services/orders.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Order, OrderStatus, OrderType } from '../../../../core/models/order.model';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    TuiButton,
    TuiIcon,
    TuiAppearance,
    TuiBadge,
    TuiTabs,
    TuiCardLarge,
    TuiDropdown,
    TuiLoader,
    LayoutComponent,
    PageHeaderComponent,
    KanbanColumnComponent,
  ],
  template: `
    <app-layout>
      <app-page-header
        title="Pedidos"
        subtitle="Gerencie os pedidos do seu estabelecimento"
        [showSearch]="false"
      >
        <ng-container actions>
          <button
            tuiButton
            appearance="primary"
            size="m"
            (click)="createOrder()"
          >
            <tui-icon icon="@tui.plus" />
            Novo Pedido
          </button>
        </ng-container>
      </app-page-header>

      <div class="orders-container">
        <!-- Stats -->
        <div class="stats-grid">
          <div tuiCardLarge tuiAppearance="floating" class="stat-card">
            <div class="stat-icon pending">
              <tui-icon icon="@tui.clock" />
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ pendingCount() }}</span>
              <span class="stat-label">Pendentes</span>
            </div>
          </div>

          <div tuiCardLarge tuiAppearance="floating" class="stat-card">
            <div class="stat-icon preparing">
              <tui-icon icon="@tui.chef-hat" />
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ preparingCount() }}</span>
              <span class="stat-label">Preparando</span>
            </div>
          </div>

          <div tuiCardLarge tuiAppearance="floating" class="stat-card">
            <div class="stat-icon ready">
              <tui-icon icon="@tui.check" />
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ readyCount() }}</span>
              <span class="stat-label">Prontos</span>
            </div>
          </div>

          <div tuiCardLarge tuiAppearance="floating" class="stat-card">
            <div class="stat-icon completed">
              <tui-icon icon="@tui.check-circle" />
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ completedCount() }}</span>
              <span class="stat-label">Finalizados Hoje</span>
            </div>
          </div>
        </div>

        <!-- View Toggle -->
        <div class="view-controls">
          <tui-tabs [(activeItemIndex)]="activeTabIndex">
            <button tuiTab>Kanban</button>
            <button tuiTab>Lista</button>
          </tui-tabs>

          <div class="filters">
            <button
              tuiButton
              appearance="outline"
              size="s"
              [class.active]="selectedType() === null"
              (click)="filterByType(null)"
            >
              Todos
            </button>
            <button
              tuiButton
              appearance="outline"
              size="s"
              [class.active]="selectedType() === OrderType.DINE_IN"
              (click)="filterByType(OrderType.DINE_IN)"
            >
              <tui-icon icon="@tui.grid" />
              Mesa
            </button>
            <button
              tuiButton
              appearance="outline"
              size="s"
              [class.active]="selectedType() === OrderType.TAKEOUT"
              (click)="filterByType(OrderType.TAKEOUT)"
            >
              <tui-icon icon="@tui.shopping-bag" />
              Retirada
            </button>
            <button
              tuiButton
              appearance="outline"
              size="s"
              [class.active]="selectedType() === OrderType.DELIVERY"
              (click)="filterByType(OrderType.DELIVERY)"
            >
              <tui-icon icon="@tui.truck" />
              Delivery
            </button>
          </div>
        </div>

        @if (loading()) {
          <div class="loading-container">
            <tui-loader size="l" />
          </div>
        } @else {
          <!-- Kanban View -->
          @if (activeTabIndex === 0) {
            <div class="kanban-board" cdkDropListGroup>
              @for (column of columns(); track column.id) {
                <app-kanban-column
                  [column]="column"
                  (onDrop)="onDrop($event, column)"
                  (onOrderView)="viewOrder($event)"
                  (onOrderPrint)="printOrder($event)"
                />
              }
            </div>
          }

          <!-- List View -->
          @if (activeTabIndex === 1) {
            <div tuiCardLarge tuiAppearance="floating" class="list-view">
              <table class="orders-table">
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Cliente</th>
                    <th>Tipo</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Hora</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  @for (order of allOrders(); track order.id) {
                    <tr>
                      <td class="order-number">#{{ order.orderNumber }}</td>
                      <td>{{ order.customer?.name || 'Cliente não identificado' }}</td>
                      <td>
                        <div class="type-badge" [class]="order.type.toLowerCase()">
                          <tui-icon [icon]="getTypeIcon(order.type)" />
                          {{ getTypeLabel(order.type) }}
                        </div>
                      </td>
                      <td>
                        <tui-badge
                          [appearance]="getStatusAppearance(order.status)"
                        >
                          {{ getStatusLabel(order.status) }}
                        </tui-badge>
                      </td>
                      <td class="total">{{ order.total | currency:'BRL':'symbol':'1.2-2' }}</td>
                      <td>{{ formatTime(order.createdAt) }}</td>
                      <td>
                        <div class="actions">
                          <button
                            tuiButton
                            appearance="outline"
                            size="xs"
                            (click)="viewOrder(order)"
                          >
                            <tui-icon icon="@tui.eye" />
                          </button>
                          <button
                            tuiButton
                            appearance="outline"
                            size="xs"
                            (click)="printOrder(order)"
                          >
                            <tui-icon icon="@tui.printer" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="7" class="empty-state">
                        Nenhum pedido encontrado
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        }
      </div>
    </app-layout>
  `,
  styles: [`
    .orders-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      &.pending {
        background: rgba(255, 193, 7, 0.15);
        color: #ffc107;
      }

      &.preparing {
        background: rgba(33, 150, 243, 0.15);
        color: #2196f3;
      }

      &.ready {
        background: rgba(76, 175, 80, 0.15);
        color: #4caf50;
      }

      &.completed {
        background: rgba(156, 39, 176, 0.15);
        color: #9c27b0;
      }
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      line-height: 1.2;
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--tui-text-secondary);
    }

    .view-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .filters {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;

      button.active {
        background: var(--tui-primary);
        color: var(--tui-primary-text);
      }
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 4rem;
    }

    .kanban-board {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
      min-height: 500px;
    }

    .list-view {
      padding: 0;
      overflow: hidden;
    }

    .orders-table {
      width: 100%;
      border-collapse: collapse;

      th, td {
        padding: 1rem;
        text-align: left;
        border-bottom: 1px solid var(--tui-border-normal);
      }

      th {
        font-weight: 600;
        background: var(--tui-background-base-alt);
      }

      tr:hover {
        background: var(--tui-background-neutral-1);
      }

      .order-number {
        font-weight: 600;
        color: var(--tui-primary);
      }

      .total {
        font-weight: 600;
      }

      .empty-state {
        text-align: center;
        padding: 3rem;
        color: var(--tui-text-secondary);
      }
    }

    .type-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;

      &.dine_in {
        background: rgba(33, 150, 243, 0.15);
        color: #2196f3;
      }

      &.takeout {
        background: rgba(255, 152, 0, 0.15);
        color: #ff9800;
      }

      &.delivery {
        background: rgba(156, 39, 176, 0.15);
        color: #9c27b0;
      }

      tui-icon {
        font-size: 0.875rem;
      }
    }

    .actions {
      display: flex;
      gap: 0.5rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersListComponent implements OnInit {
  private ordersService = inject(OrdersService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  protected readonly OrderType = OrderType;

  loading = signal(true);
  allOrders = signal<Order[]>([]);
  columns = signal<KanbanColumn[]>([]);
  selectedType = signal<OrderType | null>(null);

  activeTabIndex = 0;

  // Stats computed from orders
  pendingCount = signal(0);
  preparingCount = signal(0);
  readyCount = signal(0);
  completedCount = signal(0);

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    const params: { establishmentId?: string; type?: OrderType } = {
      establishmentId: 'current', // TODO: Get from UserService
    };

    const currentType = this.selectedType();
    if (currentType) {
      params.type = currentType;
    }

    this.ordersService.getAll(params).subscribe({
      next: (response) => {
        const orders = response.data;
        this.allOrders.set(orders);
        this.updateColumns(orders);
        this.updateStats(orders);
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.error('Erro ao carregar pedidos');
        this.loading.set(false);
      },
    });
  }

  private updateColumns(orders: Order[]): void {
    const statusColumns: Record<string, { title: string; color: string; statuses: OrderStatus[] }> = {
      pending: {
        title: 'Pendentes',
        color: '#ffc107',
        statuses: [OrderStatus.PENDING],
      },
      confirmed: {
        title: 'Confirmados',
        color: '#2196f3',
        statuses: [OrderStatus.CONFIRMED],
      },
      preparing: {
        title: 'Preparando',
        color: '#ff9800',
        statuses: [OrderStatus.PREPARING],
      },
      ready: {
        title: 'Prontos',
        color: '#4caf50',
        statuses: [OrderStatus.READY, OrderStatus.DELIVERING],
      },
    };

    const columns: KanbanColumn[] = Object.entries(statusColumns).map(([id, config]) => ({
      id,
      title: config.title,
      color: config.color,
      orders: orders.filter(o => config.statuses.includes(o.status)),
    }));

    this.columns.set(columns);
  }

  private updateStats(orders: Order[]): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.pendingCount.set(orders.filter(o => o.status === OrderStatus.PENDING).length);
    this.preparingCount.set(orders.filter(o =>
      o.status === OrderStatus.CONFIRMED || o.status === OrderStatus.PREPARING
    ).length);
    this.readyCount.set(orders.filter(o =>
      o.status === OrderStatus.READY || o.status === OrderStatus.DELIVERING
    ).length);
    this.completedCount.set(orders.filter(o =>
      o.status === OrderStatus.COMPLETED && new Date(o.updatedAt) >= today
    ).length);
  }

  filterByType(type: OrderType | null): void {
    this.selectedType.set(type);
    this.loadOrders();
  }

  createOrder(): void {
    this.router.navigate(['/orders/new']);
  }

  viewOrder(order: Order): void {
    this.router.navigate(['/orders', order.id]);
  }

  printOrder(order: Order): void {
    // TODO: Implement print functionality
    this.notificationService.info(`Imprimindo pedido #${order.orderNumber}...`);
  }

  onDrop(event: CdkDragDrop<Order[]>, column: KanbanColumn): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const order = event.previousContainer.data[event.previousIndex];
      const newStatus = this.getStatusForColumn(column.id);

      if (newStatus) {
        this.ordersService.updateStatus(order.id, newStatus).subscribe({
          next: () => {
            transferArrayItem(
              event.previousContainer.data,
              event.container.data,
              event.previousIndex,
              event.currentIndex
            );
            this.notificationService.success(`Pedido #${order.orderNumber} atualizado`);
          },
          error: () => {
            this.notificationService.error('Erro ao atualizar status do pedido');
          },
        });
      }
    }
  }

  private getStatusForColumn(columnId: string): OrderStatus | null {
    const statusMap: Record<string, OrderStatus> = {
      pending: OrderStatus.PENDING,
      confirmed: OrderStatus.CONFIRMED,
      preparing: OrderStatus.PREPARING,
      ready: OrderStatus.READY,
    };
    return statusMap[columnId] || null;
  }

  protected formatTime(date: Date): string {
    const d = new Date(date);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
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
