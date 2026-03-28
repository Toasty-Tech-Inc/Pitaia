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
  styleUrls: ['./products-report.component.scss'],
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
