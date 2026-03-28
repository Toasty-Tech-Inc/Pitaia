import { UserService } from '../../../../services/user.service';
import { ChangeDetectionStrategy, Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiButton, TuiDialogService, TuiIcon, TuiLoader } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { TuiCardLarge } from '@taiga-ui/layout';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { LayoutComponent } from '../../../../shared/components/layout/layout.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../../../shared/components/data-table/data-table.component';
import { CashierService } from '../../../../core/services/cashier.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Cashier, CashMovement, MovementType } from '../../../../core/models/cashier.model';
import { OpenCashierDialogComponent } from '../../components/open-cashier-dialog/open-cashier-dialog.component';
import { CloseCashierDialogComponent } from '../../components/close-cashier-dialog/close-cashier-dialog.component';
import { CashMovementDialogComponent } from '../../components/cash-movement-dialog/cash-movement-dialog.component';

@Component({
  selector: 'app-cashier-page',
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
        [breadcrumbs]="['Dashboard', 'Caixa']"
        [loading]="loading()"
        [showSearch]="false"
        [showFilter]="false"
        [showAdd]="false"
        (onRefresh)="loadCashier()"
      />

      @if (loading()) {
        <div class="loading-container">
          <tui-loader [showLoader]="true" />
        </div>
      } @else if (!currentCashier()) {
        <div tuiCardLarge class="no-cashier">
          <tui-icon icon="@tui.dollar-sign" />
          <h2>Nenhum caixa aberto</h2>
          <p>Abra o caixa para começar a registrar vendas e movimentações.</p>
          <button
            tuiButton
            class="pitaia-primary-btn"
            (click)="openCashierDialog()"
          >
            Abrir Caixa
          </button>
        </div>
      } @else {
        <div class="cashier-content">
          <div class="cashier-header">
            <div tuiCardLarge class="cashier-info">
              <div class="cashier-status">
                <tui-badge appearance="success">Caixa Aberto</tui-badge>
                <span class="opened-at">
                  Aberto em {{ formatDate(currentCashier()!.openedAt) }}
                </span>
              </div>
              <div class="cashier-balance">
                <span class="balance-label">Saldo Atual</span>
                <span class="balance-value">{{ formatCurrency(currentBalance()) }}</span>
              </div>
            </div>

            <div class="cashier-actions">
              <button
                tuiButton
                appearance="secondary"
                iconStart="@tui.plus"
                (click)="openMovementDialog(MovementType.DEPOSIT)"
              >
                Entrada
              </button>
              <button
                tuiButton
                appearance="secondary"
                iconStart="@tui.minus"
                (click)="openMovementDialog(MovementType.WITHDRAWAL)"
              >
                Sangria
              </button>
              <button
                tuiButton
                appearance="destructive"
                iconStart="@tui.x"
                (click)="openCloseCashierDialog()"
              >
                Fechar Caixa
              </button>
            </div>
          </div>

          <div class="cashier-summary">
            <div tuiCardLarge class="summary-card">
              <tui-icon icon="@tui.arrow-down-circle" />
              <div class="summary-content">
                <span class="summary-value positive">{{ formatCurrency(totalDeposits()) }}</span>
                <span class="summary-label">Entradas</span>
              </div>
            </div>
            <div tuiCardLarge class="summary-card">
              <tui-icon icon="@tui.arrow-up-circle" />
              <div class="summary-content">
                <span class="summary-value negative">{{ formatCurrency(totalWithdrawals()) }}</span>
                <span class="summary-label">Saídas</span>
              </div>
            </div>
            <div tuiCardLarge class="summary-card">
              <tui-icon icon="@tui.shopping-cart" />
              <div class="summary-content">
                <span class="summary-value">{{ formatCurrency(totalSales()) }}</span>
                <span class="summary-label">Vendas</span>
              </div>
            </div>
            <div tuiCardLarge class="summary-card">
              <tui-icon icon="@tui.rotate-ccw" />
              <div class="summary-content">
                <span class="summary-value negative">{{ formatCurrency(totalRefunds()) }}</span>
                <span class="summary-label">Estornos</span>
              </div>
            </div>
          </div>

          <h3 class="section-title">Movimentações</h3>

          <app-data-table
            [data]="movements()"
            [columns]="movementColumns"
            [loading]="loadingMovements()"
            [showPagination]="false"
            emptyMessage="Nenhuma movimentação registrada"
          />
        </div>
      }
    </app-layout>
  `,
  styleUrls: ['./cashier-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashierPageComponent implements OnInit {
  private cashierService = inject(CashierService);
  private userService = inject(UserService)
  private notificationService = inject(NotificationService);
  private dialogService = inject(TuiDialogService);

  protected MovementType = MovementType;
  protected loading = signal(false);
  protected establishment = this.userService.getEstablishment();
  protected loadingMovements = signal(false);
  protected currentCashier = signal<Cashier | null>(null);
  protected movements = signal<CashMovement[]>([]);

  protected currentBalance = computed(() => {
    const cashier = this.currentCashier();
    if (!cashier) return 0;
    return cashier.openingAmount + this.totalSales() + this.totalDeposits() - this.totalWithdrawals() - this.totalRefunds();
  });

  protected totalSales = computed(() => 
    this.movements().filter(m => m.type === MovementType.SALE).reduce((sum, m) => sum + m.amount, 0)
  );

  protected totalRefunds = computed(() => 
    this.movements().filter(m => m.type === MovementType.REFUND).reduce((sum, m) => sum + m.amount, 0)
  );

  protected totalDeposits = computed(() => 
    this.movements().filter(m => m.type === MovementType.DEPOSIT).reduce((sum, m) => sum + m.amount, 0)
  );

  protected totalWithdrawals = computed(() => 
    this.movements().filter(m => m.type === MovementType.WITHDRAWAL).reduce((sum, m) => sum + m.amount, 0)
  );

  protected movementColumns: TableColumn<CashMovement>[] = [
    {
      key: 'createdAt',
      header: 'Data/Hora',
      render: (item) => this.formatDate(item.createdAt),
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (item) => this.getMovementTypeLabel(item.type),
    },
    {
      key: 'description',
      header: 'Descrição',
      render: (item) => item.description || '-',
    },
    {
      key: 'paymentMethod',
      header: 'Forma de Pagamento',
      render: (item) => item.paymentMethod || '-',
    },
    {
      key: 'amount',
      header: 'Valor',
      render: (item) => {
        const isNegative = [MovementType.WITHDRAWAL, MovementType.REFUND].includes(item.type as MovementType);
        return (isNegative ? '-' : '+') + this.formatCurrency(item.amount);
      },
    },
  ];

  ngOnInit(): void {
    this.loadCashier();
  }

  loadCashier(): void {
    this.loading.set(true);

    this.cashierService.getActiveSession().subscribe({
      next: (cashier) => {
        this.currentCashier.set(cashier);
        if (cashier) {
          this.loadMovements(cashier.id);
        }
        this.loading.set(false);
      },
      error: () => {
        this.currentCashier.set(null);
        this.loading.set(false);
      },
    });
  }

  private loadMovements(cashierId: string): void {
    this.loadingMovements.set(true);
    this.cashierService.getMovements(cashierId).subscribe({
      next: (movements) => {
        this.movements.set(movements);
        this.loadingMovements.set(false);
      },
      error: () => {
        this.loadingMovements.set(false);
      },
    });
  }

  openCashierDialog(): void {
    this.dialogService.open<Cashier | null>(
      new PolymorpheusComponent(OpenCashierDialogComponent),
      {
        label: 'Abrir Caixa',
      }
    ).subscribe((result) => {
      if (result) {
        this.currentCashier.set(result);
        this.movements.set([]);
        this.notificationService.success('Caixa aberto com sucesso');
      }
    });
  }

  openCloseCashierDialog(): void {
    const cashier = this.currentCashier();
    if (!cashier) return;

    this.dialogService.open<boolean>(
      new PolymorpheusComponent(CloseCashierDialogComponent),
      {
        label: 'Fechar Caixa',
        data: {
          cashier,
          expectedBalance: this.currentBalance(),
        },
      }
    ).subscribe((closed) => {
      if (closed) {
        this.currentCashier.set(null);
        this.movements.set([]);
        this.notificationService.success('Caixa fechado com sucesso');
      }
    });
  }

  openMovementDialog(type: MovementType): void {
    const cashier = this.currentCashier();
    if (!cashier) return;

    this.dialogService.open<CashMovement | null>(
      new PolymorpheusComponent(CashMovementDialogComponent),
      {
        label: type === MovementType.DEPOSIT ? 'Registrar Entrada' : 'Registrar Sangria',
        data: { cashierId: cashier.id, type },
      }
    ).subscribe((movement) => {
      if (movement) {
        this.loadMovements(cashier.id);
        this.notificationService.success('Movimentação registrada');
      }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(date));
  }

  private getMovementTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      [MovementType.OPENING]: 'Abertura',
      [MovementType.SALE]: 'Venda',
      [MovementType.REFUND]: 'Estorno',
      [MovementType.WITHDRAWAL]: 'Sangria',
      [MovementType.DEPOSIT]: 'Entrada',
      [MovementType.CLOSING]: 'Fechamento',
    };
    return labels[type] || type;
  }
}
