import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiButton, TuiIcon, TuiLoader } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { TuiCardLarge } from '@taiga-ui/layout';
import { LayoutComponent } from '../../../../shared/components/layout/layout.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../../../shared/components/data-table/data-table.component';
import { ProductsService } from '../../../../core/services/products.service';
import { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-products-report',
  standalone: true,
  imports: [
    CommonModule,
    LayoutComponent,
    PageHeaderComponent,
    DataTableComponent,
    TuiBadge,
    TuiButton,
    TuiCardLarge,
    TuiIcon,
    TuiLoader,
  ],
  template: `
    <app-layout>
      <app-page-header
        [breadcrumbs]="['Dashboard', 'Relatórios', 'Produtos']"
        [loading]="loading()"
        [showSearch]="false"
        [showFilter]="false"
        [showAdd]="false"
        (onRefresh)="loadReport()"
      />

      @if (loading()) {
        <div class="loading-container">
          <tui-loader [showLoader]="true" />
        </div>
      } @else {
        <!-- Summary Cards -->
        <div class="summary-grid">
          <div tuiCardLarge class="summary-card">
            <tui-icon icon="@tui.package" />
            <div class="summary-content">
              <span class="summary-value">{{ totalProducts() }}</span>
              <span class="summary-label">Total de Produtos</span>
            </div>
          </div>
          <div tuiCardLarge class="summary-card">
            <tui-icon icon="@tui.check-circle" />
            <div class="summary-content">
              <span class="summary-value">{{ activeProducts() }}</span>
              <span class="summary-label">Produtos Ativos</span>
            </div>
          </div>
          <div tuiCardLarge class="summary-card">
            <tui-icon icon="@tui.alert-triangle" />
            <div class="summary-content">
              <span class="summary-value">{{ lowStockProducts() }}</span>
              <span class="summary-label">Estoque Baixo</span>
            </div>
          </div>
          <div tuiCardLarge class="summary-card">
            <tui-icon icon="@tui.star" />
            <div class="summary-content">
              <span class="summary-value">{{ featuredProducts() }}</span>
              <span class="summary-label">Em Destaque</span>
            </div>
          </div>
        </div>

        <!-- Top Products -->
        <div class="charts-grid">
          <div tuiCardLarge class="chart-card">
            <h4>Produtos em Destaque</h4>
            <div class="products-list">
              @for (product of topProducts(); track product.id; let i = $index) {
                <div class="product-item">
                  <span class="product-rank">{{ i + 1 }}</span>
                  <div class="product-info">
                    <span class="product-name">{{ product.name }}</span>
                    <span class="product-category">{{ product.category?.name || 'Sem categoria' }}</span>
                  </div>
                  <span class="product-price">{{ formatCurrency(product.price) }}</span>
                </div>
              } @empty {
                <p class="empty-text">Nenhum produto em destaque</p>
              }
            </div>
          </div>

          <div tuiCardLarge class="chart-card">
            <h4>Produtos com Estoque Baixo</h4>
            <div class="products-list">
              @for (product of lowStockList(); track product.id) {
                <div class="product-item low-stock">
                  <tui-icon icon="@tui.alert-triangle" />
                  <div class="product-info">
                    <span class="product-name">{{ product.name }}</span>
                    <span class="product-stock">
                      Estoque: {{ product.currentStock || 0 }} / Mínimo: {{ product.minStock || 0 }}
                    </span>
                  </div>
                </div>
              } @empty {
                <p class="empty-text">Nenhum produto com estoque baixo 👍</p>
              }
            </div>
          </div>
        </div>

        <!-- Products Table -->
        <h3 class="section-title">Todos os Produtos</h3>
        <app-data-table
          [data]="products()"
          [columns]="columns"
          [loading]="loading()"
          [currentPage]="currentPage()"
          [pageSize]="pageSize()"
          [total]="totalProducts()"
          emptyMessage="Nenhum produto encontrado"
          (onPageChange)="onPageChange($event)"
        />
      }
    </app-layout>
  `,
  styles: [`
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

    .products-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .product-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      background: var(--tui-background-neutral-1);
      border-radius: 0.5rem;
    }

    .product-item.low-stock {
      background: rgba(254, 56, 103, 0.05);
    }

    .product-item.low-stock tui-icon {
      color: #FE3867;
      width: 1.25rem;
      height: 1.25rem;
    }

    .product-rank {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      background: linear-gradient(135deg, #FE3867 0%, #FF6B8A 100%);
      color: white;
      border-radius: 50%;
      font-weight: 700;
      font-size: 0.875rem;
    }

    .product-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .product-name {
      font-weight: 500;
    }

    .product-category,
    .product-stock {
      font-size: 0.75rem;
      color: var(--tui-text-secondary);
    }

    .product-price {
      font-weight: 600;
      color: #38D9A9;
    }

    .empty-text {
      text-align: center;
      color: var(--tui-text-secondary);
      padding: 1rem;
      margin: 0;
    }

    .section-title {
      margin: 0 0 1rem;
      font-size: 1.125rem;
      font-weight: 600;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsReportComponent implements OnInit {
  private productsService = inject(ProductsService);

  protected loading = signal(false);
  protected products = signal<Product[]>([]);
  protected topProducts = signal<Product[]>([]);
  protected lowStockList = signal<Product[]>([]);

  protected totalProducts = signal(0);
  protected activeProducts = signal(0);
  protected lowStockProducts = signal(0);
  protected featuredProducts = signal(0);

  protected currentPage = signal(1);
  protected pageSize = signal(10);

  protected columns: TableColumn<Product>[] = [
    {
      key: 'name',
      header: 'Produto',
    },
    {
      key: 'category.name',
      header: 'Categoria',
    },
    {
      key: 'price',
      header: 'Preço',
      render: (item) => this.formatCurrency(item.price),
    },
    {
      key: 'currentStock',
      header: 'Estoque',
      render: (item) => item.trackInventory ? `${item.currentStock || 0} ${item.unit || 'un'}` : 'N/A',
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (item) => item.isActive ? '✓ Ativo' : '✗ Inativo',
    },
  ];

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {
    this.loading.set(true);

    this.productsService.getAll({
      page: this.currentPage(),
      limit: this.pageSize(),
    }).subscribe({
      next: (response) => {
        this.products.set(response.data);
        this.totalProducts.set(response.total);
        this.activeProducts.set(response.data.filter(p => p.isActive).length);
        this.lowStockProducts.set(response.data.filter(p =>
          p.trackInventory && p.minStock && (p.currentStock || 0) <= p.minStock
        ).length);
        this.featuredProducts.set(response.data.filter(p => p.isFeatured).length);

        this.topProducts.set(response.data.filter(p => p.isFeatured).slice(0, 5));
        this.lowStockList.set(response.data.filter(p =>
          p.trackInventory && p.minStock && (p.currentStock || 0) <= p.minStock
        ).slice(0, 5));

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadReport();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }
}
