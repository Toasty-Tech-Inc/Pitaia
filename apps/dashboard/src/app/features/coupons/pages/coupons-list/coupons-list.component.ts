import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiButton, TuiDialogService, TuiIcon } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { TuiCardLarge } from '@taiga-ui/layout';
import { LayoutComponent } from '../../../../shared/components/layout/layout.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../../shared/components/data-table/data-table.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CouponsService } from '../../../../core/services/coupons.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Coupon, DiscountType } from '../../../../core/models/coupon.model';
import { CouponFormDialogComponent } from '../../components/coupon-form-dialog/coupon-form-dialog.component';

@Component({
  selector: 'app-coupons-list',
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
        [breadcrumbs]="['Dashboard', 'Promoções', 'Cupons']"
        [loading]="loading()"
        searchPlaceholder="Buscar cupons..."
        addLabel="Novo Cupom"
        (SearchChange)="onSearch($event)"
        (Refresh)="loadCoupons()"
        (Add)="openCouponDialog()"
      />

      <div class="coupons-stats">
        <div tuiCardLarge class="stat-card">
          <tui-icon icon="@tui.gift" />
          <div class="stat-content">
            <span class="stat-value">{{ total() }}</span>
            <span class="stat-label">Total de Cupons</span>
          </div>
        </div>
        <div tuiCardLarge class="stat-card">
          <tui-icon icon="@tui.check-circle" />
          <div class="stat-content">
            <span class="stat-value">{{ activeCoupons() }}</span>
            <span class="stat-label">Ativos</span>
          </div>
        </div>
        <div tuiCardLarge class="stat-card">
          <tui-icon icon="@tui.percent" />
          <div class="stat-content">
            <span class="stat-value">{{ totalUsed() }}</span>
            <span class="stat-label">Usos Totais</span>
          </div>
        </div>
      </div>

      <app-data-table
        [data]="coupons()"
        [columns]="columns"
        [actions]="actions"
        [loading]="loading()"
        [currentPage]="currentPage()"
        [pageSize]="pageSize()"
        [total]="total()"
        emptyMessage="Nenhum cupom encontrado"
        (onAction)="handleAction($event)"
        (onPageChange)="onPageChange($event)"
      />
    </app-layout>
  `,
  styles: [`
    .coupons-stats {
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
export class CouponsListComponent implements OnInit {
  private couponsService = inject(CouponsService);
  private notificationService = inject(NotificationService);
  private dialogService = inject(TuiDialogService);

  protected coupons = signal<Coupon[]>([]);
  protected loading = signal(false);
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected total = signal(0);
  protected activeCoupons = signal(0);
  protected totalUsed = signal(0);
  protected searchTerm = signal('');

  protected columns: TableColumn<Coupon>[] = [
    {
      key: 'code',
      header: 'Código',
      render: (item) => item.code.toUpperCase(),
    },
    {
      key: 'description',
      header: 'Descrição',
      render: (item) => item.description || '-',
    },
    {
      key: 'discountType',
      header: 'Desconto',
      render: (item) => item.discountType === DiscountType.PERCENTAGE 
        ? `${item.discountValue}%` 
        : `R$ ${item.discountValue.toFixed(2)}`,
    },
    {
      key: 'usedCount',
      header: 'Usos',
      render: (item) => item.usageLimit 
        ? `${item.usedCount}/${item.usageLimit}` 
        : item.usedCount.toString(),
    },
    {
      key: 'endDate',
      header: 'Validade',
      render: (item) => item.endDate 
        ? new Date(item.endDate).toLocaleDateString('pt-BR') 
        : 'Sem limite',
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (item) => item.isActive ? '✓ Ativo' : '✗ Inativo',
    },
  ];

  protected actions: TableAction<Coupon>[] = [
    { icon: '@tui.edit', label: 'Editar', action: 'edit' },
    { icon: '@tui.copy', label: 'Copiar', action: 'copy' },
    { icon: '@tui.toggle-left', label: 'Desativar', action: 'toggle', condition: (item) => item.isActive },
    { icon: '@tui.toggle-right', label: 'Ativar', action: 'toggle', condition: (item) => !item.isActive },
    { icon: '@tui.trash', label: 'Excluir', action: 'delete', appearance: 'destructive' },
  ];

  ngOnInit(): void {
    this.loadCoupons();
  }

  loadCoupons(): void {
    this.loading.set(true);
    this.couponsService.getAll({
      page: this.currentPage(),
      limit: this.pageSize(),
      code: this.searchTerm() || undefined,
    }).subscribe({
      next: (response) => {
        this.coupons.set(response.data);
        this.total.set(response.total);
        this.activeCoupons.set(response.data.filter(c => c.isActive).length);
        this.totalUsed.set(response.data.reduce((sum, c) => sum + c.usedCount, 0));
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.error('Erro ao carregar cupons');
        this.loading.set(false);
      },
    });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(1);
    this.loadCoupons();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadCoupons();
  }

  openCouponDialog(coupon?: Coupon): void {
    this.dialogService.open<Coupon | null>(
      new PolymorpheusComponent(CouponFormDialogComponent),
      {
        data: { coupon },
        label: coupon ? 'Editar Cupom' : 'Novo Cupom',
      }
    ).subscribe((result) => {
      if (result) {
        this.loadCoupons();
      }
    });
  }

  handleAction(event: { action: string; item: Coupon }): void {
    const { action, item } = event;

    switch (action) {
      case 'edit':
        this.openCouponDialog(item);
        break;
      case 'copy':
        this.copyCode(item);
        break;
      case 'toggle':
        this.toggleCoupon(item);
        break;
      case 'delete':
        this.confirmDelete(item);
        break;
    }
  }

  private copyCode(coupon: Coupon): void {
    navigator.clipboard.writeText(coupon.code).then(() => {
      this.notificationService.success('Código copiado!');
    });
  }

  private toggleCoupon(coupon: Coupon): void {
    this.couponsService.toggleActive(coupon.id).subscribe({
      next: () => {
        this.notificationService.success(
          coupon.isActive ? 'Cupom desativado' : 'Cupom ativado'
        );
        this.loadCoupons();
      },
      error: () => {
        this.notificationService.error('Erro ao alterar status do cupom');
      },
    });
  }

  private confirmDelete(coupon: Coupon): void {
    this.dialogService.open<boolean>(
      new PolymorpheusComponent(ConfirmDialogComponent),
      {
        data: {
          title: 'Excluir Cupom',
          message: `Tem certeza que deseja excluir o cupom "${coupon.code}"?`,
          confirmLabel: 'Excluir',
          confirmAppearance: 'destructive',
        } as ConfirmDialogData,
      }
    ).subscribe((confirmed) => {
      if (confirmed) {
        this.deleteCoupon(coupon);
      }
    });
  }

  private deleteCoupon(coupon: Coupon): void {
    this.couponsService.delete(coupon.id).subscribe({
      next: () => {
        this.notificationService.success('Cupom excluído com sucesso');
        this.loadCoupons();
      },
      error: () => {
        this.notificationService.error('Erro ao excluir cupom');
      },
    });
  }
}
