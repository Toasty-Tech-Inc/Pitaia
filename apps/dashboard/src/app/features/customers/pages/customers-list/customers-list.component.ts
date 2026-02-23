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
import { CustomersService } from '../../../../core/services/customers.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Customer } from '../../../../core/models/customer.model';

@Component({
  selector: 'app-customers-list',
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
        [breadcrumbs]="['Dashboard', 'Clientes']"
        [loading]="loading()"
        searchPlaceholder="Buscar clientes..."
        addLabel="Novo Cliente"
        (onSearchChange)="onSearch($event)"
        (onRefresh)="loadCustomers()"
        (onAdd)="navigateToCreate()"
      />

      <div class="customers-stats">
        <div tuiCardLarge class="stat-card">
          <tui-icon icon="@tui.users" />
          <div class="stat-content">
            <span class="stat-value">{{ total() }}</span>
            <span class="stat-label">Total de Clientes</span>
          </div>
        </div>
        <div tuiCardLarge class="stat-card">
          <tui-icon icon="@tui.user-check" />
          <div class="stat-content">
            <span class="stat-value">{{ activeCustomers() }}</span>
            <span class="stat-label">Clientes Ativos</span>
          </div>
        </div>
        <div tuiCardLarge class="stat-card">
          <tui-icon icon="@tui.award" />
          <div class="stat-content">
            <span class="stat-value">{{ totalLoyaltyPoints() }}</span>
            <span class="stat-label">Pontos de Fidelidade</span>
          </div>
        </div>
      </div>

      <app-data-table
        [data]="customers()"
        [columns]="columns"
        [actions]="actions"
        [loading]="loading()"
        [currentPage]="currentPage()"
        [pageSize]="pageSize()"
        [total]="total()"
        emptyMessage="Nenhum cliente encontrado"
        (onAction)="handleAction($event)"
        (onPageChange)="onPageChange($event)"
      />
    </app-layout>
  `,
  styles: [`
    .customers-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
    }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--tui-text-primary);
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--tui-text-secondary);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomersListComponent implements OnInit {
  private customersService = inject(CustomersService);
  private notificationService = inject(NotificationService);
  private dialogService = inject(TuiDialogService);
  private router = inject(Router);

  protected customers = signal<Customer[]>([]);
  protected loading = signal(false);
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected total = signal(0);
  protected activeCustomers = signal(0);
  protected totalLoyaltyPoints = signal(0);
  protected searchTerm = signal('');

  protected columns: TableColumn<Customer>[] = [
    {
      key: 'name',
      header: 'Nome',
    },
    {
      key: 'email',
      header: 'Email',
      render: (item) => item.email || '-',
    },
    {
      key: 'phone',
      header: 'Telefone',
    },
    {
      key: 'cpf',
      header: 'CPF',
      render: (item) => item.cpf ? this.formatCpf(item.cpf) : '-',
    },
    {
      key: 'loyaltyPoints',
      header: 'Pontos',
      render: (item) => item.loyaltyPoints.toString(),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (item) => item.isActive ? '✓ Ativo' : '✗ Inativo',
    },
  ];

  protected actions: TableAction<Customer>[] = [
    { icon: '@tui.eye', label: 'Ver', action: 'view' },
    { icon: '@tui.edit', label: 'Editar', action: 'edit' },
    { icon: '@tui.award', label: 'Pontos', action: 'loyalty' },
    { icon: '@tui.toggle-left', label: 'Desativar', action: 'toggle', condition: (item) => item.isActive },
    { icon: '@tui.toggle-right', label: 'Ativar', action: 'toggle', condition: (item) => !item.isActive },
    { icon: '@tui.trash', label: 'Excluir', action: 'delete', appearance: 'destructive' },
  ];

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading.set(true);
    this.customersService.getAll({
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchTerm() || undefined,
    }).subscribe({
      next: (response) => {
        this.customers.set(response.data);
        this.total.set(response.total);
        this.activeCustomers.set(response.data.filter(c => c.isActive).length);
        this.totalLoyaltyPoints.set(response.data.reduce((sum, c) => sum + c.loyaltyPoints, 0));
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.error('Erro ao carregar clientes');
        this.loading.set(false);
      },
    });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(1);
    this.loadCustomers();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadCustomers();
  }

  navigateToCreate(): void {
    this.router.navigate(['/customers/new']);
  }

  handleAction(event: { action: string; item: Customer }): void {
    const { action, item } = event;

    switch (action) {
      case 'view':
        this.router.navigate(['/customers', item.id]);
        break;
      case 'edit':
        this.router.navigate(['/customers', item.id, 'edit']);
        break;
      case 'loyalty':
        this.router.navigate(['/customers', item.id, 'loyalty']);
        break;
      case 'toggle':
        this.toggleCustomer(item);
        break;
      case 'delete':
        this.confirmDelete(item);
        break;
    }
  }

  private formatCpf(cpf: string): string {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  private toggleCustomer(customer: Customer): void {
    this.customersService.toggleActive(customer.id).subscribe({
      next: () => {
        this.notificationService.success(
          customer.isActive ? 'Cliente desativado' : 'Cliente ativado'
        );
        this.loadCustomers();
      },
      error: () => {
        this.notificationService.error('Erro ao alterar status do cliente');
      },
    });
  }

  private confirmDelete(customer: Customer): void {
    this.dialogService.open<boolean>(
      new PolymorpheusComponent(ConfirmDialogComponent),
      {
        data: {
          title: 'Excluir Cliente',
          message: `Tem certeza que deseja excluir o cliente "${customer.name}"?`,
          confirmLabel: 'Excluir',
          confirmAppearance: 'destructive',
        } as ConfirmDialogData,
      }
    ).subscribe((confirmed) => {
      if (confirmed) {
        this.deleteCustomer(customer);
      }
    });
  }

  private deleteCustomer(customer: Customer): void {
    this.customersService.delete(customer.id).subscribe({
      next: () => {
        this.notificationService.success('Cliente excluído com sucesso');
        this.loadCustomers();
      },
      error: () => {
        this.notificationService.error('Erro ao excluir cliente');
      },
    });
  }
}
