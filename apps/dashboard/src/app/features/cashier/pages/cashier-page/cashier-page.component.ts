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
import { Cashier, CashMovement, CashierStatus, MovementType } from '../../../../core/models/cashier.model';
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
  styles: [`
    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
    }

    .no-cashier {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
    }

    .no-cashier tui-icon {
      width: 4rem;
      height: 4rem;
      color: var(--tui-text-secondary);
      margin-bottom: 1.5rem;
    }

    .no-cashier h2 {
      margin: 0 0 0.5rem;
      font-size: 1.5rem;
    }

    .no-cashier p {
      margin: 0 0 1.5rem;
      color: var(--tui-text-secondary);
    }

    .cashier-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .cashier-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .cashier-info {
      display: flex;
      align-items: center;
      gap: 2rem;
      padding: 1rem 1.5rem;
    }

    .cashier-status {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .opened-at {
      font-size: 0.875rem;
      color: var(--tui-text-secondary);
    }

    .cashier-balance {
      display: flex;
      flex-direction: column;
    }

    .balance-label {
      font-size: 0.75rem;
      color: var(--tui-text-secondary);
      text-transform: uppercase;
    }

    .balance-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #38D9A9;
    }

    .cashier-actions {
      display: flex;
      gap: 0.75rem;
    }

    .cashier-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
    }

    .summary-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
    }

    .summary-card tui-icon {
      width: 2rem;
      height: 2rem;
      color: #FE3867;
    }

    .summary-content {
      display: flex;
      flex-direction: column;
    }

    .summary-value {
      font-size: 1.25rem;
      font-weight: 600;
    }

    .summary-value.positive { color: #38D9A9; }
    .summary-value.negative { color: #FE3867; }

    .summary-label {
      font-size: 0.75rem;
      color: var(--tui-text-secondary);
    }

    .section-title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
    }

    .pitaia-primary-btn {
      background: linear-gradient(135deg, #FE3867 0%, #FF6B8A 100%);
      color: white;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashierPageComponent implements OnInit {
  private cashierService = inject(CashierService);
  private notificationService = inject(NotificationService);
  private dialogService = inject(TuiDialogService);

  protected MovementType = MovementType;
  protected loading = signal(false);
  protected loadingMovements = signal(false);
  protected currentCashier = signal<Cashier | null>(null);
  protected movements = signal<CashMovement[]>([]);

  protected currentBalance = computed(() => {
    const cashier = this.currentCashier();
    if (!cashier) return 0;
    return cashier.openingBalance + this.totalSales() + this.totalDeposits() - this.totalWithdrawals() - this.totalRefunds();
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
    // TODO: Get establishmentId from user service
    const establishmentId = 'your-establishment-id';
    
    this.cashierService.getCurrent(establishmentId).subscribe({
      next: (cashier) => {
        this.currentCashier.set(cashier);
        this.loadMovements(cashier.id);
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
