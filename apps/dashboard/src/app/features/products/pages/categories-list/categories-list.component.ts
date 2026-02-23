import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TuiButton, TuiDialogService, TuiIcon } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { TuiCardLarge } from '@taiga-ui/layout';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { LayoutComponent } from '../../../../shared/components/layout/layout.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../../shared/components/data-table/data-table.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CategoriesService } from '../../../../core/services/products.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Category } from '../../../../core/models/product.model';
import { CategoryFormDialogComponent } from '../../components/category-form-dialog/category-form-dialog.component';

@Component({
  selector: 'app-categories-list',
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
  ],
  template: `
    <app-layout>
      <app-page-header
        [breadcrumbs]="['Dashboard', 'Produtos', 'Categorias']"
        [loading]="loading()"
        searchPlaceholder="Buscar categorias..."
        addLabel="Nova Categoria"
        (onSearchChange)="onSearch($event)"
        (onRefresh)="loadCategories()"
        (onAdd)="openCategoryDialog()"
      />

      <app-data-table
        [data]="categories()"
        [columns]="columns"
        [actions]="actions"
        [loading]="loading()"
        [currentPage]="currentPage()"
        [pageSize]="pageSize()"
        [total]="total()"
        emptyMessage="Nenhuma categoria encontrada"
        (onAction)="handleAction($event)"
        (onPageChange)="onPageChange($event)"
      />
    </app-layout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesListComponent implements OnInit {
  private categoriesService = inject(CategoriesService);
  private notificationService = inject(NotificationService);
  private dialogService = inject(TuiDialogService);
  private router = inject(Router);

  protected categories = signal<Category[]>([]);
  protected loading = signal(false);
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected total = signal(0);
  protected searchTerm = signal('');

  protected columns: TableColumn<Category>[] = [
    {
      key: 'name',
      header: 'Nome',
    },
    {
      key: 'description',
      header: 'Descrição',
      render: (item) => item.description || '-',
    },
    {
      key: 'sortOrder',
      header: 'Ordem',
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (item) => item.isActive ? '✓ Ativo' : '✗ Inativo',
    },
  ];

  protected actions: TableAction<Category>[] = [
    { icon: '@tui.edit', label: 'Editar', action: 'edit' },
    { icon: '@tui.toggle-left', label: 'Desativar', action: 'toggle', condition: (item) => item.isActive },
    { icon: '@tui.toggle-right', label: 'Ativar', action: 'toggle', condition: (item) => !item.isActive },
    { icon: '@tui.trash', label: 'Excluir', action: 'delete', appearance: 'destructive' },
  ];

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.categoriesService.getAll({
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchTerm() || undefined,
    }).subscribe({
      next: (response) => {
        this.categories.set(response.data);
        this.total.set(response.total);
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.error('Erro ao carregar categorias');
        this.loading.set(false);
      },
    });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(1);
    this.loadCategories();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadCategories();
  }

  openCategoryDialog(category?: Category): void {
    this.dialogService.open<Category | null>(
      new PolymorpheusComponent(CategoryFormDialogComponent),
      {
        data: { category },
        label: category ? 'Editar Categoria' : 'Nova Categoria',
      }
    ).subscribe((result) => {
      if (result) {
        this.loadCategories();
      }
    });
  }

  handleAction(event: { action: string; item: Category }): void {
    const { action, item } = event;

    switch (action) {
      case 'edit':
        this.openCategoryDialog(item);
        break;
      case 'toggle':
        this.toggleCategory(item);
        break;
      case 'delete':
        this.confirmDelete(item);
        break;
    }
  }

  private toggleCategory(category: Category): void {
    this.categoriesService.toggleActive(category.id).subscribe({
      next: () => {
        this.notificationService.success(
          category.isActive ? 'Categoria desativada' : 'Categoria ativada'
        );
        this.loadCategories();
      },
      error: () => {
        this.notificationService.error('Erro ao alterar status da categoria');
      },
    });
  }

  private confirmDelete(category: Category): void {
    this.dialogService.open<boolean>(
      new PolymorpheusComponent(ConfirmDialogComponent),
      {
        data: {
          title: 'Excluir Categoria',
          message: `Tem certeza que deseja excluir a categoria "${category.name}"?`,
          confirmLabel: 'Excluir',
          confirmAppearance: 'destructive',
        } as ConfirmDialogData,
      }
    ).subscribe((confirmed) => {
      if (confirmed) {
        this.deleteCategory(category);
      }
    });
  }

  private deleteCategory(category: Category): void {
    this.categoriesService.delete(category.id).subscribe({
      next: () => {
        this.notificationService.success('Categoria excluída com sucesso');
        this.loadCategories();
      },
      error: () => {
        this.notificationService.error('Erro ao excluir categoria');
      },
    });
  }
}
