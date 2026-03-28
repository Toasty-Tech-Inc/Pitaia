import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TuiCardLarge } from '@taiga-ui/layout';
import { LayoutComponent } from '../../../../shared/components/layout/layout.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { OrdersService } from '../../../../core/services/orders.service';
import { CustomersService } from '../../../../core/services/customers.service';
import { ProductsService } from '../../../../core/services/products.service';
import { TuiIcon } from '@taiga-ui/core';

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
            (keydown.enter)="navigateToReport(report.route)"
            tabindex="0"
            (keyup.enter)="navigateToReport(report.route)"
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
  styleUrls: ['./reports-dashboard.component.scss'],
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
