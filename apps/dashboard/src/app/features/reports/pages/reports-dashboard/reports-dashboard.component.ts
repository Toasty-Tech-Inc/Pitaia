import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { TuiCardLarge } from '@taiga-ui/layout';
import { LayoutComponent } from '../../../../shared/components/layout/layout.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { OrdersService } from '../../../../core/services/orders.service';
import { CustomersService } from '../../../../core/services/customers.service';
import { ProductsService } from '../../../../core/services/products.service';

interface ReportCard {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    LayoutComponent,
    PageHeaderComponent,
    TuiButton,
    TuiCardLarge,
    TuiIcon,
  ],
  template: `
    <app-layout>
      <app-page-header
        [breadcrumbs]="['Dashboard', 'Relatórios']"
        [showSearch]="false"
        [showFilter]="false"
        [showRefresh]="false"
        [showAdd]="false"
      />

      <!-- Overview Stats -->
      <div class="overview-grid">
        <div tuiCardLarge class="overview-card">
          <div class="overview-icon sales">
            <tui-icon icon="@tui.dollar-sign" />
          </div>
          <div class="overview-content">
            <span class="overview-value">{{ formatCurrency(totalSales()) }}</span>
            <span class="overview-label">Vendas Hoje</span>
            <span class="overview-trend positive">+12% vs ontem</span>
          </div>
        </div>

        <div tuiCardLarge class="overview-card">
          <div class="overview-icon orders">
            <tui-icon icon="@tui.shopping-bag" />
          </div>
          <div class="overview-content">
            <span class="overview-value">{{ totalOrders() }}</span>
            <span class="overview-label">Pedidos Hoje</span>
            <span class="overview-trend positive">+8% vs ontem</span>
          </div>
        </div>

        <div tuiCardLarge class="overview-card">
          <div class="overview-icon ticket">
            <tui-icon icon="@tui.receipt" />
          </div>
          <div class="overview-content">
            <span class="overview-value">{{ formatCurrency(averageTicket()) }}</span>
            <span class="overview-label">Ticket Médio</span>
            <span class="overview-trend negative">-3% vs ontem</span>
          </div>
        </div>

        <div tuiCardLarge class="overview-card">
          <div class="overview-icon customers">
            <tui-icon icon="@tui.users" />
          </div>
          <div class="overview-content">
            <span class="overview-value">{{ totalCustomers() }}</span>
            <span class="overview-label">Total de Clientes</span>
            <span class="overview-trend positive">+5 novos</span>
          </div>
        </div>
      </div>

      <!-- Report Cards -->
      <h3 class="section-title">Relatórios Disponíveis</h3>

      <div class="reports-grid">
        @for (report of reports; track report.route) {
          <div 
            tuiCardLarge 
            class="report-card"
            (click)="navigateToReport(report.route)"
          >
            <div class="report-icon" [style.background]="report.color">
              <tui-icon [icon]="report.icon" />
            </div>
            <div class="report-content">
              <h4>{{ report.title }}</h4>
              <p>{{ report.description }}</p>
            </div>
            <tui-icon icon="@tui.chevron-right" class="arrow-icon" />
          </div>
        }
      </div>
    </app-layout>
  `,
  styles: [`
    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .overview-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
    }

    .overview-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 3rem;
      height: 3rem;
      border-radius: 0.75rem;
    }

    .overview-icon tui-icon {
      width: 1.5rem;
      height: 1.5rem;
      color: white;
    }

    .overview-icon.sales { background: linear-gradient(135deg, #38D9A9 0%, #20C997 100%); }
    .overview-icon.orders { background: linear-gradient(135deg, #FE3867 0%, #FF6B8A 100%); }
    .overview-icon.ticket { background: linear-gradient(135deg, #748FFC 0%, #5C7CFA 100%); }
    .overview-icon.customers { background: linear-gradient(135deg, #FFC107 0%, #FFB300 100%); }

    .overview-content {
      display: flex;
      flex-direction: column;
    }

    .overview-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--tui-text-primary);
    }

    .overview-label {
      font-size: 0.875rem;
      color: var(--tui-text-secondary);
    }

    .overview-trend {
      font-size: 0.75rem;
      font-weight: 500;
      margin-top: 0.25rem;
    }

    .overview-trend.positive { color: #38D9A9; }
    .overview-trend.negative { color: #FE3867; }

    .section-title {
      margin: 0 0 1rem;
      font-size: 1.125rem;
      font-weight: 600;
    }

    .reports-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1rem;
    }

    .report-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .report-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .report-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 3rem;
      height: 3rem;
      border-radius: 0.75rem;
      flex-shrink: 0;
    }

    .report-icon tui-icon {
      width: 1.5rem;
      height: 1.5rem;
      color: white;
    }

    .report-content {
      flex: 1;
    }

    .report-content h4 {
      margin: 0 0 0.25rem;
      font-size: 1rem;
      font-weight: 600;
    }

    .report-content p {
      margin: 0;
      font-size: 0.875rem;
      color: var(--tui-text-secondary);
    }

    .arrow-icon {
      color: var(--tui-text-secondary);
      width: 1.25rem;
      height: 1.25rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsDashboardComponent implements OnInit {
  private router = inject(Router);
  private ordersService = inject(OrdersService);
  private customersService = inject(CustomersService);
  private productsService = inject(ProductsService);

  protected totalSales = signal(0);
  protected totalOrders = signal(0);
  protected averageTicket = signal(0);
  protected totalCustomers = signal(0);

  protected reports: ReportCard[] = [
    {
      title: 'Relatório de Vendas',
      description: 'Análise detalhada de vendas por período, forma de pagamento e canal',
      icon: '@tui.trending-up',
      route: '/reports/sales',
      color: 'linear-gradient(135deg, #38D9A9 0%, #20C997 100%)',
    },
    {
      title: 'Relatório de Produtos',
      description: 'Produtos mais vendidos, estoque e margem de lucro',
      icon: '@tui.package',
      route: '/reports/products',
      color: 'linear-gradient(135deg, #748FFC 0%, #5C7CFA 100%)',
    },
    {
      title: 'Relatório de Clientes',
      description: 'Análise de clientes, fidelidade e ticket médio por cliente',
      icon: '@tui.users',
      route: '/reports/customers',
      color: 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)',
    },
    {
      title: 'Relatório de Pedidos',
      description: 'Análise de pedidos por status, tempo de preparo e entrega',
      icon: '@tui.file-text',
      route: '/reports/orders',
      color: 'linear-gradient(135deg, #FE3867 0%, #FF6B8A 100%)',
    },
    {
      title: 'Relatório de Caixa',
      description: 'Movimentações de caixa, entradas, saídas e fechamentos',
      icon: '@tui.dollar-sign',
      route: '/cashier',
      color: 'linear-gradient(135deg, #69DB7C 0%, #51CF66 100%)',
    },
    {
      title: 'Relatório de Cupons',
      description: 'Uso de cupons, descontos aplicados e impacto nas vendas',
      icon: '@tui.gift',
      route: '/reports/coupons',
      color: 'linear-gradient(135deg, #FF922B 0%, #FD7E14 100%)',
    },
  ];

  ngOnInit(): void {
    this.loadOverviewData();
  }

  private loadOverviewData(): void {
    // Simulated data - replace with actual API calls
    this.totalSales.set(4580.50);
    this.totalOrders.set(47);
    this.averageTicket.set(97.46);
    
    this.customersService.getAll({ limit: 1 }).subscribe({
      next: (response) => {
        this.totalCustomers.set(response.total);
      },
    });
  }

  navigateToReport(route: string): void {
    this.router.navigate([route]);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }
}
