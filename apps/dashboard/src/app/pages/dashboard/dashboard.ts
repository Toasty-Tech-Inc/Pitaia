import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiPopup } from '@taiga-ui/core';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { TuiAvatar, TuiBadge, TuiChip, TuiDrawer, TuiTabs } from '@taiga-ui/kit';
import { TuiButton, TuiDataList, TuiDropdown, TuiIcon } from '@taiga-ui/core';
import { TuiTable, TuiTableFilters } from '@taiga-ui/addon-table';

interface Order {
  id: string;
  customer: string;
  date: string;
  amount: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: number;
}

interface Stat {
  label: string;
  value: string;
  change: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TuiCardLarge,
    TuiHeader,
    TuiAvatar,
    TuiBadge,
    TuiChip,
    TuiButton,
    TuiDataList,
    TuiDropdown,
    TuiIcon,
    TuiTable,
    TuiTableFilters,
    TuiDrawer,
    TuiTabs,
    TuiPopup,
  ],
  template: `
      <div class="dashboard">
        <!-- Header -->
        <header class="header">
          <div class="header-content">
            <div class="header-left">
              <div class="logo">
                <tui-avatar
                  
                  [src]="null"
                  [size]="'l'"
                  class="logo-avatar"
                />
              </div>
              <div class="header-title">
                <h1>Dashboard de Pedidos</h1>
                <p>Gerencie seus pedidos em tempo real</p>
              </div>
            </div>
            
            <div class="header-right">
              <button
                tuiButton
                appearance="secondary"
                size="m"
                [iconStart]="'@tui.search'"
              >
                Buscar
              </button>
              
              <button
                tuiIconButton
                appearance="secondary"
                size="m"
                class="notification-btn"
              >
                <tui-icon>@tui.bell</tui-icon>
                <span class="notification-dot"></span>
              </button>
              
              <tui-avatar
                [src]="null"
                [size]="'m'"
                class="user-avatar"
              />
            </div>
          </div>
        </header>

        <!-- Main Content -->
        <main class="main-content">
          <!-- Filters -->
          <div class="filters">
            <button
              tuiButton
              appearance="secondary"
              size="s"
              [iconEnd]="'@tui.chevron-down'"
            >
              {{ selectedPeriod }}
            </button>
            
            <button
              tuiButton
              appearance="secondary"
              size="s"
              [iconStart]="'@tui.filter'"
              [iconEnd]="'@tui.chevron-down'"
            >
              {{ selectedStatus }}
            </button>
            
            <button
              tuiButton
              appearance="primary"
              size="s"
              [iconStart]="'@tui.download'"
              class="primary-btn"
            >
              Exportar
            </button>
          </div>

          <!-- Stats Cards -->
          <div class="stats-grid">
            <div tuiCardLarge *ngFor="let stat of stats" class="stat-card">
              <div class="stat-content">
                <div class="stat-icon" [ngClass]="stat.color">
                  <tui-icon [icon]="stat.icon" class="icon"></tui-icon>
                </div>
                <div class="stat-details">
                  <p class="stat-label">{{ stat.label }}</p>
                  <h3 class="stat-value">{{ stat.value }}</h3>
                  <tui-badge
                    [class.status]="'success'"
                    size="m"
                  >{{ stat.change }}</tui-badge>
                </div>
              </div>
            </div>
          </div>

          <!-- Charts and Tables Row -->
          <div class="content-grid">
            <!-- Recent Orders Table -->
            <div tuiCardLarge class="orders-card">
              <header tuiheader="h2">
                <h3>Pedidos Recentes</h3>
              </header>
              
              <div class="table-container">
                <table class="orders-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Cliente</th>
                      <th>Data</th>
                      <th>Valor</th>
                      <th>Itens</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let order of recentOrders">
                      <td class="order-id">{{ order.id }}</td>
                      <td>
                        <div class="customer-cell">
                          <tui-avatar
                            [size]="'s'"
                            (click)="open.set(!open())"
                          />
                          <span>{{ order.customer }}</span>
                        </div>
                      </td>
                      <td>{{ order.date }}</td>
                      <td class="amount">{{ order.amount }}</td>
                      <td>{{ order.items }}</td>
                      <td>
                        <tui-badge
                          [class.status]="getStatusType(order.status)"
                          size="m"
                        >
                          {{ order.status }}
                    </tui-badge>
                      </td>
                      <td>
                        <button
                          tuiIconButton
                          appearance="secondary"
                          size="xs"
                        >
                        <tui-icon>@tui.eye</tui-icon>
                    </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <tui-drawer *tuiPopup="open()">
    <header>
        <h2 tuiHeader>
            <div tuiTitle>
                <span tuiCaption>Caption・caption</span>
                <span>
                    Drawer title
                    <tui-badge>Label</tui-badge>
                </span>
                <span tuiSubtitle>
                    In publishing and graphic design, Lorem ipsum is a placeholder text commonly used.
                </span>
            </div>
 
            <div tuiAccessories>
                <button
                    iconStart="@tui.search"
                    tuiButton
                    type="button"
                >
                    More info
                </button>
                <button
                    iconStart="@tui.ellipsis"
                    tuiIconButton
                    type="button"
                >
                    Actions
                </button>
                <button
                    appearance="icon"
                    iconStart="@tui.x"
                    tuiIconButton
                    type="button"
                    (click)="open.set(false)"
                >
                    Close
                </button>
            </div>
        </h2>
        <div>
            <button
                tuiButton
                type="button"
            >
                Action 1
            </button>
            <a
                appearance="action"
                href="#"
                tuiButton
            >
                Action 2
            </a>
            <button
                tuiLink
                type="button"
            >
                Action 3
            </button>
        </div>
        <nav tuiNavigationNav>
            <tui-tabs>
                <button
                    tuiTab
                    type="button"
                >
                    Default view
                </button>
                <button
                    tuiTab
                    type="button"
                >
                    Details
                </button>
                <button
                    tuiTab
                    type="button"
                >
                    Followers
                </button>
            </tui-tabs>
            <hr />
            <button
                size="xs"
                tuiButton
                type="button"
            >
                Primary
            </button>
            <button
                appearance="secondary"
                iconStart="@tui.ellipsis"
                size="xs"
                tuiIconButton
                type="button"
            >
                More
            </button>
        </nav>
    </header>
    <p *tuiRepeatTimes="let index of 15">Content</p>
    <footer>
        <button
            size="m"
            tuiButton
            type="button"
            [style.margin-inline-end]="'auto'"
        >
            Tertiary action
        </button>
        <button
            size="m"
            tuiButton
            type="button"
        >
            Secondary action
        </button>
        <button
            appearance="primary"
            size="m"
            tuiButton
            type="button"
        >
            Primary action
        </button>
    </footer>
</tui-drawer>
            <!-- Top Products -->
            <div tuiCardLarge class="products-card">
              <header tuiHeader="h2">
                <h3>Produtos Mais Vendidos</h3>
              </header>
              
              <div class="products-list">
                <div *ngFor="let product of topProducts; let i = index" class="product-item">
                  <div class="product-rank">{{ i + 1 }}</div>
                  <div class="product-info">
                    <p class="product-name">{{ product.name }}</p>
                    <div class="product-stats">
                      <span class="sales">{{ product.sales }} vendas</span>
                      <span class="separator">•</span>
                      <span class="revenue">{{ product.revenue }}</span>
                    </div>
                  </div>
                  <tui-chip
                    [size]="'s'"
                    class="trend-chip"
                  >
                  {{ product.trend }}
                </tui-chip>
                </div>
              </div>
            </div>
          </div>

          <!-- Sales Chart -->
          <div tuiCardLarge class="chart-card">
            <header tuiHeader="h2">
              <h3>Vendas dos Últimos 7 Dias</h3>
            </header>
            
            <div class="chart-container">
              <div class="chart-placeholder">
                <tui-icon icon="@tui.bar-chart" class="chart-icon"></tui-icon>
                <div class="mock-chart">
                  <div class="bar" style="height: 60%"></div>
                  <div class="bar" style="height: 80%"></div>
                  <div class="bar" style="height: 45%"></div>
                  <div class="bar" style="height: 90%"></div>
                  <div class="bar" style="height: 70%"></div>
                  <div class="bar" style="height: 85%"></div>
                  <div class="bar" style="height: 95%"></div>
                </div>
              </div>
            </div>
            </div>
        </main>
      </div>
  `,
  styles: [`
    :host ::ng-deep {
      --tui-primary: #FE3867;
      --tui-primary-hover: #E52F5C;
      --tui-primary-active: #CC2951;
    }

    .dashboard {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
    }

    .header {
      background: white;
      border-bottom: 1px solid #e5e7eb;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logo-avatar::ng-deep [tuiAvatar] {
      background: #FE3867 !important;
    }

    .header-title h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }

    .header-title p {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .notification-btn {
      position: relative;
    }

    .notification-dot {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 8px;
      height: 8px;
      background: #FE3867;
      border-radius: 50%;
      border: 2px solid white;
    }

    .user-avatar::ng-deep [tuiAvatar] {
      background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%) !important;
    }

    .main-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .filters {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .primary-btn::ng-deep button {
      background: #FE3867 !important;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }

    .stat-content {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon.blue { background: #dbeafe; }
    .stat-icon.green { background: #d1fae5; }
    .stat-icon.purple { background: #e9d5ff; }
    .stat-icon.orange { background: #fed7aa; }

    .stat-icon .icon {
      font-size: 1.5rem;
    }

    .stat-icon.blue .icon { color: #3b82f6; }
    .stat-icon.green .icon { color: #10b981; }
    .stat-icon.purple .icon { color: #a855f7; }
    .stat-icon.orange .icon { color: #f97316; }

    .stat-details {
      flex: 1;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0 0 0.25rem 0;
    }

    .stat-value {
      font-size: 1.875rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 0.5rem 0;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    @media (max-width: 1024px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
    }

    .orders-card, .products-card, .chart-card {
      overflow: hidden;
    }

    .table-container {
      overflow-x: auto;
      margin-top: 1rem;
    }

    .orders-table {
      width: 100%;
      border-collapse: collapse;
    }

    .orders-table th {
      text-align: left;
      padding: 0.75rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: #6b7280;
      border-bottom: 2px solid #e5e7eb;
    }

    .orders-table td {
      padding: 0.75rem;
      border-bottom: 1px solid #f3f4f6;
    }

    .orders-table tr:hover {
      background: #f9fafb;
    }

    .order-id {
      font-family: monospace;
      font-weight: 600;
      color: #FE3867;
    }

    .customer-cell {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .amount {
      font-weight: 600;
      color: #10b981;
    }

    .products-list {
      margin-top: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .product-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      border-radius: 8px;
      background: #f9fafb;
      transition: background 0.2s;
    }

    .product-item:hover {
      background: #f3f4f6;
    }

    .product-rank {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: #FE3867;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.875rem;
    }

    .product-info {
      flex: 1;
    }

    .product-name {
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 0.25rem 0;
    }

    .product-stats {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .separator {
      margin: 0 0.5rem;
    }

    .trend-chip {
      color: #10b981;
      font-weight: 600;
    }

    .chart-container {
      margin-top: 1rem;
      height: 300px;
    }

    .chart-placeholder {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      color: #6b7280;
    }

    .chart-icon {
      font-size: 3rem;
      color: #FE3867;
    }

    .mock-chart {
      display: flex;
      align-items: flex-end;
      gap: 0.5rem;
      height: 150px;
      margin-top: 1rem;
    }

    .bar {
      width: 40px;
      background: linear-gradient(to top, #FE3867, #ff6b8e);
      border-radius: 4px 4px 0 0;
      transition: all 0.3s;
    }

    .bar:hover {
      opacity: 0.8;
      transform: scaleY(1.05);
    }
  `]
})
export class Dashboard {
  selectedPeriod = 'Hoje';
  selectedStatus = 'Todos';

  stats: Stat[] = [
    { label: 'Total de Pedidos', value: '1,234', change: '+12.5%', icon: '@tui.shopping-cart', color: 'blue' },
    { label: 'Receita Total', value: 'R$ 45.678', change: '+8.2%', icon: '@tui.dollar-sign', color: 'green' },
    { label: 'Clientes Ativos', value: '892', change: '+5.3%', icon: '@tui.users', color: 'purple' },
    { label: 'Taxa de Conversão', value: '68.4%', change: '+2.1%', icon: '@tui.trending-up', color: 'orange' }
  ];

  recentOrders: Order[] = [
    { id: '#12345', customer: 'João Silva', date: '25/10/2025', amount: 'R$ 234,50', status: 'pending', items: 3 },
    { id: '#12346', customer: 'Maria Santos', date: '25/10/2025', amount: 'R$ 567,80', status: 'processing', items: 5 },
    { id: '#12347', customer: 'Pedro Costa', date: '25/10/2025', amount: 'R$ 123,45', status: 'shipped', items: 2 },
    { id: '#12348', customer: 'Ana Oliveira', date: '24/10/2025', amount: 'R$ 890,00', status: 'delivered', items: 7 },
    { id: '#12349', customer: 'Carlos Ferreira', date: '24/10/2025', amount: 'R$ 456,30', status: 'processing', items: 4 },
    { id: '#12350', customer: 'Juliana Lima', date: '24/10/2025', amount: 'R$ 678,90', status: 'pending', items: 6 }
  ];

  topProducts = [
    { name: 'Produto Premium A', sales: 245, revenue: 'R$ 12.345', trend: '+15%' },
    { name: 'Produto Especial B', sales: 198, revenue: 'R$ 9.876', trend: '+8%' },
    { name: 'Produto Destaque C', sales: 156, revenue: 'R$ 7.654', trend: '+12%' },
    { name: 'Produto Luxo D', sales: 134, revenue: 'R$ 6.543', trend: '+5%' }
  ];

  protected readonly open = signal(false);

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      processing: 'Processando',
      shipped: 'Enviado',
      delivered: 'Entregue',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  }

  getStatusType(status: string): 'warning' | 'info' | 'success' | 'error' | 'neutral' {
    const types: Record<string, 'warning' | 'info' | 'success' | 'error' | 'neutral'> = {
      pending: 'warning',
      processing: 'info',
      shipped: 'info',
      delivered: 'success',
      cancelled: 'error'
    };
    return types[status] || 'neutral';
  }
}