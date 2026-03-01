import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TuiButton, TuiDialogService, TuiIcon, TuiLoader } from '@taiga-ui/core';
import { TuiBadge, TuiAvatar } from '@taiga-ui/kit';
import { TuiCardLarge } from '@taiga-ui/layout';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { LayoutComponent } from '../../../../shared/components/layout/layout.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../../shared/components/data-table/data-table.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ProductsService } from '../../../../core/services/products.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { UserService } from '../../../../services/user.service';
import { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [
    CommonModule,
    LayoutComponent,
    PageHeaderComponent,
    DataTableComponent,
    TuiBadge,
    TuiAvatar,
    TuiButton,
    TuiCardLarge,
    TuiIcon,
    TuiLoader,
  ],
  template: `
    <app-layout>
      <app-page-header
        [breadcrumbs]="['Dashboard', 'Produtos']"
        [loading]="loading()"
        searchPlaceholder="Buscar produtos..."
        addLabel="Novo Produto"
        (SearchChange)="onSearch($event)"
        (Refresh)="loadProducts()"
        (Add)="navigateToCreate()"
      />

      <div class="products-stats">
        <div tuiCardLarge class="stat-card">
          <tui-icon icon="@tui.package" />
          <div class="stat-content">
            <span class="stat-value">{{ totalProducts() }}</span>
            <span class="stat-label">Total de Produtos</span>
          </div>
        </div>
        <div tuiCardLarge class="stat-card">
          <tui-icon icon="@tui.check-circle" />
          <div class="stat-content">
            <span class="stat-value">{{ activeProducts() }}</span>
            <span class="stat-label">Ativos</span>
          </div>
        </div>
        <div tuiCardLarge class="stat-card">
          <tui-icon icon="@tui.alert-triangle" />
          <div class="stat-content">
            <span class="stat-value">{{ lowStockProducts() }}</span>
            <span class="stat-label">Estoque Baixo</span>
          </div>
        </div>
      </div>

      <app-data-table
        [data]="products()"
        [columns]="columns"
        [actions]="actions"
        [loading]="loading()"
        [currentPage]="currentPage()"
        [pageSize]="pageSize()"
        [total]="totalProducts()"
        emptyMessage="Nenhum produto encontrado"
        (onAction)="handleAction($event)"
        (onPageChange)="onPageChange($event)"
      />
    </app-layout>
  `,
  styles: [`
    .products-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
    }

    .stat-card tui-icon {
      width: 2.5rem;
      height: 2.5rem;
      color: #FE3867;
      flex-shrink: 0;
    }

    .stat-content {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--tui-text-primary);
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--tui-text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    // Tablet
    @media (max-width: 1024px) {
      .products-stats {
        grid-template-columns: repeat(3, 1fr);
        gap: 0.75rem;
      }

      .stat-card {
        padding: 1rem;
        gap: 0.75rem;
      }

      .stat-card tui-icon {
        width: 2rem;
        height: 2rem;
      }

      .stat-value {
        font-size: 1.25rem;
      }

      .stat-label {
        font-size: 0.75rem;
      }
    }

    // Mobile
    @media (max-width: 768px) {
      .products-stats {
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
        margin-bottom: 1rem;
      }

      .stat-card {
        flex-direction: column;
        text-align: center;
        padding: 0.75rem;
        gap: 0.5rem;
      }

      .stat-card tui-icon {
        width: 1.5rem;
        height: 1.5rem;
      }

      .stat-value {
        font-size: 1.125rem;
      }

      .stat-label {
        font-size: 0.625rem;
      }
    }

    // Small mobile
    @media (max-width: 480px) {
      .stat-card {
        padding: 0.5rem;
      }

      .stat-value {
        font-size: 1rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsListComponent implements OnInit {
  private productsService = inject(ProductsService);
  private notificationService = inject(NotificationService);
  private userService = inject(UserService);
  private dialogService = inject(TuiDialogService);
  private router = inject(Router);

  protected products = signal<Product[]>([]);
  protected loading = signal(false);
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected totalProducts = signal(0);
  protected activeProducts = signal(0);
  protected lowStockProducts = signal(0);
  protected searchTerm = signal('');

  protected columns: TableColumn<Product>[] = [
    {
      key: 'name',
      header: 'Produto',
      render: (item) => item.name,
    },
    {
      key: 'category.name',
      header: 'Categoria',
    },
    {
      key: 'price',
      header: 'Preço',
      render: (item) => {
        const price = Number(item.price) || 0;
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
      },
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

  protected actions: TableAction<Product>[] = [
    { icon: '@tui.eye', label: 'Ver', action: 'view' },
    { icon: '@tui.edit', label: 'Editar', action: 'edit' },
    { icon: '@tui.toggle-left', label: 'Desativar', action: 'toggle', condition: (item) => item.isActive },
    { icon: '@tui.toggle-right', label: 'Ativar', action: 'toggle', condition: (item) => !item.isActive },
    { icon: '@tui.trash', label: 'Excluir', action: 'delete', appearance: 'destructive' },
  ];

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    const establishmentId = this.userService.getEstablishmentId();
    this.productsService.getAll({
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchTerm() || undefined,
      establishmentId: establishmentId || undefined,
    }).subscribe({
      next: (response) => {
        this.products.set(response.data);
        this.totalProducts.set(response.total);
        this.activeProducts.set(response.data.filter(p => p.isActive).length);
        this.lowStockProducts.set(response.data.filter(p => 
          p.trackInventory && p.minStock && (p.currentStock || 0) <= p.minStock
        ).length);
        this.loading.set(false);
      },
      error: (err) => {
        this.notificationService.error('Erro ao carregar produtos');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(1);
    this.loadProducts();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadProducts();
  }

  navigateToCreate(): void {
    this.router.navigate(['/products/new']);
  }

  handleAction(event: { action: string; item: Product }): void {
    const { action, item } = event;

    switch (action) {
      case 'view':
        this.router.navigate(['/products', item.id]);
        break;
      case 'edit':
        this.router.navigate(['/products', item.id, 'edit']);
        break;
      case 'toggle':
        this.toggleProduct(item);
        break;
      case 'delete':
        this.confirmDelete(item);
        break;
    }
  }

  private toggleProduct(product: Product): void {
    this.productsService.toggleAvailability(product.id).subscribe({
      next: () => {
        this.notificationService.success(
          product.isActive ? 'Produto desativado' : 'Produto ativado'
        );
        this.loadProducts();
      },
      error: () => {
        this.notificationService.error('Erro ao alterar status do produto');
      },
    });
  }

  private confirmDelete(product: Product): void {
    this.dialogService.open<boolean>(
      new PolymorpheusComponent(ConfirmDialogComponent),
      {
        data: {
          title: 'Excluir Produto',
          message: `Tem certeza que deseja excluir o produto "${product.name}"? Esta ação não pode ser desfeita.`,
          confirmLabel: 'Excluir',
          confirmAppearance: 'destructive',
        } as ConfirmDialogData,
      }
    ).subscribe((confirmed) => {
      if (confirmed) {
        this.deleteProduct(product);
      }
    });
  }

  private deleteProduct(product: Product): void {
    this.productsService.delete(product.id).subscribe({
      next: () => {
        this.notificationService.success('Produto excluído com sucesso');
        this.loadProducts();
      },
      error: () => {
        this.notificationService.error('Erro ao excluir produto');
      },
    });
  }
}
