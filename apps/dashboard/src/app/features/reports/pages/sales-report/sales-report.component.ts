import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TuiButton, TuiIcon, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { TuiCardLarge } from '@taiga-ui/layout';
import { LayoutComponent } from '../../../../shared/components/layout/layout.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../../../shared/components/data-table/data-table.component';
import { OrdersService } from '../../../../core/services/orders.service';
import { Order, OrderStatus, OrderType } from '../../../../core/models/order.model';

interface SalesSummary {
  totalSales: number;
  totalOrders: number;
  averageTicket: number;
  salesByType: Record<string, number>;
  salesByStatus: Record<string, number>;
}

@Component({
  selector: 'app-sales-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LayoutComponent,
    PageHeaderComponent,
    DataTableComponent,
    TuiBadge,
    TuiButton,
    TuiCardLarge,
    TuiIcon,
    TuiLoader,
    TuiTextfield,
  ],
  template: `
    <app-layout>
      <app-page-header
        [breadcrumbs]="['Dashboard', 'Relatórios', 'Vendas']"
        [loading]="loading()"
        [showSearch]="false"
        [showAdd]="false"
        (onRefresh)="loadReport()"
      />

      <!-- Date Filters -->
      <div tuiCardLarge class="filters-card">
        <div class="filter-group">
          <label>Data Inicial</label>
          <tui-textfield>
            <input
              tuiTextfield
              type="date"
              [(ngModel)]="startDate"
            />
          </tui-textfield>
        </div>
        <div class="filter-group">
          <label>Data Final</label>
          <tui-textfield>
            <input
              tuiTextfield
              type="date"
              [(ngModel)]="endDate"
            />
          </tui-textfield>
        </div>
        <button
          tuiButton
          class="pitaia-primary-btn"
          (click)="loadReport()"
          [disabled]="loading()"
        >
          Filtrar
        </button>
        <button
          tuiButton
          appearance="secondary"
          iconStart="@tui.download"
          (click)="exportReport()"
        >
          Exportar
        </button>
      </div>

      @if (loading()) {
        <div class="loading-container">
          <tui-loader [showLoader]="true" />
        </div>
      } @else {
        <!-- Summary Cards -->
        <div class="summary-grid">
          <div tuiCardLarge class="summary-card">
            <tui-icon icon="@tui.dollar-sign" />
            <div class="summary-content">
              <span class="summary-value">{{ formatCurrency(summary().totalSales) }}</span>
              <span class="summary-label">Total de Vendas</span>
            </div>
          </div>
          <div tuiCardLarge class="summary-card">
            <tui-icon icon="@tui.shopping-bag" />
            <div class="summary-content">
              <span class="summary-value">{{ summary().totalOrders }}</span>
              <span class="summary-label">Total de Pedidos</span>
            </div>
          </div>
          <div tuiCardLarge class="summary-card">
            <tui-icon icon="@tui.receipt" />
            <div class="summary-content">
              <span class="summary-value">{{ formatCurrency(summary().averageTicket) }}</span>
              <span class="summary-label">Ticket Médio</span>
            </div>
          </div>
          <div tuiCardLarge class="summary-card">
            <tui-icon icon="@tui.check-circle" />
            <div class="summary-content">
              <span class="summary-value">{{ completedOrders() }}</span>
              <span class="summary-label">Pedidos Concluídos</span>
            </div>
          </div>
        </div>

        <!-- Sales by Type -->
        <div class="charts-grid">
          <div tuiCardLarge class="chart-card">
            <h4>Vendas por Tipo</h4>
            <div class="chart-bars">
              @for (type of salesByTypeEntries(); track type[0]) {
                <div class="bar-item">
                  <div class="bar-label">{{ getTypeLabel(type[0]) }}</div>
                  <div class="bar-container">
                    <div 
                      class="bar-fill" 
                      [style.width.%]="getBarWidth(type[1])"
                    ></div>
                  </div>
                  <div class="bar-value">{{ formatCurrency(type[1]) }}</div>
                </div>
              }
            </div>
          </div>

          <div tuiCardLarge class="chart-card">
            <h4>Pedidos por Status</h4>
            <div class="status-grid">
              @for (status of statusEntries(); track status[0]) {
                <div class="status-item">
                  <tui-badge [appearance]="getStatusAppearance(status[0])">
                    {{ getStatusLabel(status[0]) }}
                  </tui-badge>
                  <span class="status-count">{{ status[1] }}</span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Orders Table -->
        <h3 class="section-title">Últimos Pedidos</h3>
        <app-data-table
          [data]="orders()"
          [columns]="columns"
          [loading]="loading()"
          [showPagination]="false"
          emptyMessage="Nenhum pedido encontrado no período"
        />
      }
    </app-layout>
  `,
  styles: [`
    .filters-card {
      display: flex;
      align-items: flex-end;
      gap: 1rem;
      padding: 1rem 1.5rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-group label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--tui-text-secondary);
    }

    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 300px;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .summary-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
    }

    .summary-card tui-icon {
      width: 2.5rem;
      height: 2.5rem;
      color: #FE3867;
    }

    .summary-content {
      display: flex;
      flex-direction: column;
    }

    .summary-value {
      font-size: 1.5rem;
      font-weight: 700;
    }

    .summary-label {
      font-size: 0.875rem;
      color: var(--tui-text-secondary);
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .chart-card {
      padding: 1.5rem;
    }

    .chart-card h4 {
      margin: 0 0 1.25rem;
      font-size: 1rem;
      font-weight: 600;
    }

    .chart-bars {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .bar-item {
      display: grid;
      grid-template-columns: 100px 1fr 80px;
      align-items: center;
      gap: 1rem;
    }

    .bar-label {
      font-size: 0.875rem;
      font-weight: 500;
    }

    .bar-container {
      height: 0.5rem;
      background: var(--tui-background-neutral-1);
      border-radius: 0.25rem;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      background: linear-gradient(135deg, #FE3867 0%, #FF6B8A 100%);
      border-radius: 0.25rem;
      transition: width 0.3s ease;
    }

    .bar-value {
      font-size: 0.875rem;
      font-weight: 600;
      text-align: right;
    }

    .status-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .status-count {
      font-weight: 600;
    }

    .section-title {
      margin: 0 0 1rem;
      font-size: 1.125rem;
      font-weight: 600;
    }

    .pitaia-primary-btn {
      background: linear-gradient(135deg, #FE3867 0%, #FF6B8A 100%);
      color: white;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesReportComponent implements OnInit {
  private ordersService = inject(OrdersService);

  protected loading = signal(false);
  protected orders = signal<Order[]>([]);
  protected summary = signal<SalesSummary>({
    totalSales: 0,
    totalOrders: 0,
    averageTicket: 0,
    salesByType: {},
    salesByStatus: {},
  });

  protected startDate = this.getDefaultStartDate();
  protected endDate = this.getDefaultEndDate();

  protected completedOrders = signal(0);
  protected salesByTypeEntries = signal<[string, number][]>([]);
  protected statusEntries = signal<[string, number][]>([]);
  protected maxSaleValue = signal(0);

  protected columns: TableColumn<Order>[] = [
    {
      key: 'orderNumber',
      header: '#',
      render: (item) => `#${item.orderNumber}`,
    },
    {
      key: 'createdAt',
      header: 'Data',
      render: (item) => new Date(item.createdAt).toLocaleDateString('pt-BR'),
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (item) => this.getTypeLabel(item.type),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => this.getStatusLabel(item.status),
    },
    {
      key: 'total',
      header: 'Total',
      render: (item) => this.formatCurrency(item.total),
    },
  ];

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {
    this.loading.set(true);
    
    this.ordersService.getAll({ limit: 100 }).subscribe({
      next: (response) => {
        this.orders.set(response.data);
        this.calculateSummary(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private calculateSummary(orders: Order[]): void {
    const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

    const salesByType: Record<string, number> = {};
    const salesByStatus: Record<string, number> = {};

    orders.forEach(order => {
      salesByType[order.type] = (salesByType[order.type] || 0) + order.total;
      salesByStatus[order.status] = (salesByStatus[order.status] || 0) + 1;
    });

    this.summary.set({
      totalSales,
      totalOrders,
      averageTicket,
      salesByType,
      salesByStatus,
    });

    this.completedOrders.set(
      orders.filter(o => o.status === OrderStatus.COMPLETED).length
    );

    this.salesByTypeEntries.set(Object.entries(salesByType));
    this.statusEntries.set(Object.entries(salesByStatus));
    this.maxSaleValue.set(Math.max(...Object.values(salesByType), 1));
  }

  getBarWidth(value: number): number {
    return (value / this.maxSaleValue()) * 100;
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      [OrderType.DINE_IN]: 'Consumo Local',
      [OrderType.TAKEOUT]: 'Retirada',
      [OrderType.DELIVERY]: 'Delivery',
      [OrderType.CUSTOM]: 'Personalizado',
    };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      [OrderStatus.PENDING]: 'Pendente',
      [OrderStatus.CONFIRMED]: 'Confirmado',
      [OrderStatus.PREPARING]: 'Preparando',
      [OrderStatus.READY]: 'Pronto',
      [OrderStatus.DELIVERING]: 'Em Entrega',
      [OrderStatus.COMPLETED]: 'Concluído',
      [OrderStatus.CANCELLED]: 'Cancelado',
    };
    return labels[status] || status;
  }

  getStatusAppearance(status: string): string {
    const appearances: Record<string, string> = {
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

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  exportReport(): void {
    // TODO: Implement export functionality
    console.log('Exporting report...');
  }

  private getDefaultStartDate(): string {
    const date = new Date();
    date.setDate(1); // First day of month
    return date.toISOString().split('T')[0];
  }

  private getDefaultEndDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}
