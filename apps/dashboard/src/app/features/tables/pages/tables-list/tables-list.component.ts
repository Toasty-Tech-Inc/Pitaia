import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TuiButton, TuiDialogService, TuiIcon } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { TuiCardLarge } from '@taiga-ui/layout';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { LayoutComponent } from '../../../../shared/components/layout/layout.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { TablesService } from '../../../../core/services/tables.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Table, TableStatus } from '../../../../core/models/table.model';
import { TableFormDialogComponent } from '../../components/table-form-dialog/table-form-dialog.component';

@Component({
  selector: 'app-tables-list',
  standalone: true,
  imports: [
    CommonModule,
    LayoutComponent,
    PageHeaderComponent,
    TuiBadge,
    TuiButton,
    TuiCardLarge,
    TuiIcon,
  ],
  template: `
    <app-layout>
      <app-page-header
        [breadcrumbs]="['Dashboard', 'Mesas']"
        [loading]="loading()"
        [showSearch]="false"
        addLabel="Nova Mesa"
        (onRefresh)="loadTables()"
        (onAdd)="openTableDialog()"
      />

      <div class="tables-stats">
        <div tuiCardLarge class="stat-card available">
          <tui-icon icon="@tui.check-circle" />
          <div class="stat-content">
            <span class="stat-value">{{ availableTables() }}</span>
            <span class="stat-label">Disponíveis</span>
          </div>
        </div>
        <div tuiCardLarge class="stat-card occupied">
          <tui-icon icon="@tui.users" />
          <div class="stat-content">
            <span class="stat-value">{{ occupiedTables() }}</span>
            <span class="stat-label">Ocupadas</span>
          </div>
        </div>
        <div tuiCardLarge class="stat-card reserved">
          <tui-icon icon="@tui.calendar" />
          <div class="stat-content">
            <span class="stat-value">{{ reservedTables() }}</span>
            <span class="stat-label">Reservadas</span>
          </div>
        </div>
        <div tuiCardLarge class="stat-card cleaning">
          <tui-icon icon="@tui.refresh-cw" />
          <div class="stat-content">
            <span class="stat-value">{{ cleaningTables() }}</span>
            <span class="stat-label">Em Limpeza</span>
          </div>
        </div>
      </div>

      <div class="tables-grid">
        @for (table of tables(); track table.id) {
          <div 
            tuiCardLarge 
            class="table-card"
            [class.available]="table.status === TableStatus.AVAILABLE"
            [class.occupied]="table.status === TableStatus.OCCUPIED"
            [class.reserved]="table.status === TableStatus.RESERVED"
            [class.cleaning]="table.status === TableStatus.CLEANING"
            [class.inactive]="!table.isActive"
          >
            <div class="table-header">
              <span class="table-number">Mesa {{ table.number }}</span>
              <tui-badge
                [appearance]="getStatusAppearance(table.status)"
              >
                {{ getStatusLabel(table.status) }}
              </tui-badge>
            </div>

            <div class="table-info">
              <div class="info-item">
                <tui-icon icon="@tui.users" />
                <span>{{ table.capacity }} lugares</span>
              </div>
              @if (table.location) {
                <div class="info-item">
                  <tui-icon icon="@tui.map-pin" />
                  <span>{{ table.location }}</span>
                </div>
              }
            </div>

            <div class="table-actions">
              <button
                tuiButton
                appearance="flat"
                size="s"
                (click)="changeStatus(table)"
              >
                Alterar Status
              </button>
              <button
                tuiButton
                appearance="flat"
                size="s"
                iconStart="@tui.edit"
                (click)="openTableDialog(table)"
              />
              <button
                tuiButton
                appearance="flat"
                size="s"
                iconStart="@tui.trash"
                (click)="confirmDelete(table)"
              />
            </div>
          </div>
        } @empty {
          <div class="empty-state" tuiCardLarge>
            <tui-icon icon="@tui.layers" />
            <p>Nenhuma mesa cadastrada</p>
            <button
              tuiButton
              class="pitaia-primary-btn"
              (click)="openTableDialog()"
            >
              Adicionar Mesa
            </button>
          </div>
        }
      </div>
    </app-layout>
  `,
  styles: [`
    .tables-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
    }

    .stat-card tui-icon {
      width: 2rem;
      height: 2rem;
    }

    .stat-card.available tui-icon { color: #38D9A9; }
    .stat-card.occupied tui-icon { color: #FE3867; }
    .stat-card.reserved tui-icon { color: #FFC107; }
    .stat-card.cleaning tui-icon { color: #03A9F4; }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.25rem;
      font-weight: 700;
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--tui-text-secondary);
    }

    .tables-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
    }

    .table-card {
      padding: 1.25rem;
      border-left: 4px solid transparent;
      transition: all 0.2s ease;
    }

    .table-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .table-card.available { border-left-color: #38D9A9; }
    .table-card.occupied { border-left-color: #FE3867; }
    .table-card.reserved { border-left-color: #FFC107; }
    .table-card.cleaning { border-left-color: #03A9F4; }
    .table-card.inactive { opacity: 0.6; }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .table-number {
      font-size: 1.25rem;
      font-weight: 600;
    }

    .table-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--tui-text-secondary);
    }

    .info-item tui-icon {
      width: 1rem;
      height: 1rem;
    }

    .table-actions {
      display: flex;
      gap: 0.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--tui-border-normal);
    }

    .empty-state {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      text-align: center;
    }

    .empty-state tui-icon {
      width: 3rem;
      height: 3rem;
      color: var(--tui-text-secondary);
      margin-bottom: 1rem;
    }

    .empty-state p {
      margin-bottom: 1rem;
      color: var(--tui-text-secondary);
    }

    .pitaia-primary-btn {
      background: linear-gradient(135deg, #FE3867 0%, #FF6B8A 100%);
      color: white;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablesListComponent implements OnInit {
  private tablesService = inject(TablesService);
  private notificationService = inject(NotificationService);
  private dialogService = inject(TuiDialogService);
  private router = inject(Router);

  protected TableStatus = TableStatus;
  protected tables = signal<Table[]>([]);
  protected loading = signal(false);

  protected availableTables = signal(0);
  protected occupiedTables = signal(0);
  protected reservedTables = signal(0);
  protected cleaningTables = signal(0);

  ngOnInit(): void {
    this.loadTables();
  }

  loadTables(): void {
    this.loading.set(true);
    this.tablesService.getAll({ limit: 100 }).subscribe({
      next: (response) => {
        this.tables.set(response.data);
        this.updateStats(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.error('Erro ao carregar mesas');
        this.loading.set(false);
      },
    });
  }

  private updateStats(tables: Table[]): void {
    this.availableTables.set(tables.filter(t => t.status === TableStatus.AVAILABLE).length);
    this.occupiedTables.set(tables.filter(t => t.status === TableStatus.OCCUPIED).length);
    this.reservedTables.set(tables.filter(t => t.status === TableStatus.RESERVED).length);
    this.cleaningTables.set(tables.filter(t => t.status === TableStatus.CLEANING).length);
  }

  getStatusLabel(status: TableStatus): string {
    const labels: Record<TableStatus, string> = {
      [TableStatus.AVAILABLE]: 'Disponível',
      [TableStatus.OCCUPIED]: 'Ocupada',
      [TableStatus.RESERVED]: 'Reservada',
      [TableStatus.CLEANING]: 'Limpeza',
    };
    return labels[status];
  }

  getStatusAppearance(status: TableStatus): string {
    const appearances: Record<TableStatus, string> = {
      [TableStatus.AVAILABLE]: 'success',
      [TableStatus.OCCUPIED]: 'error',
      [TableStatus.RESERVED]: 'warning',
      [TableStatus.CLEANING]: 'info',
    };
    return appearances[status];
  }

  openTableDialog(table?: Table): void {
    this.dialogService.open<Table | null>(
      new PolymorpheusComponent(TableFormDialogComponent),
      {
        data: { table },
        label: table ? 'Editar Mesa' : 'Nova Mesa',
      }
    ).subscribe((result) => {
      if (result) {
        this.loadTables();
      }
    });
  }

  changeStatus(table: Table): void {
    const nextStatus: Record<TableStatus, TableStatus> = {
      [TableStatus.AVAILABLE]: TableStatus.OCCUPIED,
      [TableStatus.OCCUPIED]: TableStatus.CLEANING,
      [TableStatus.CLEANING]: TableStatus.AVAILABLE,
      [TableStatus.RESERVED]: TableStatus.OCCUPIED,
    };

    const newStatus = nextStatus[table.status];
    this.tablesService.updateStatus(table.id, newStatus).subscribe({
      next: () => {
        this.notificationService.success('Status atualizado');
        this.loadTables();
      },
      error: () => {
        this.notificationService.error('Erro ao atualizar status');
      },
    });
  }

  confirmDelete(table: Table): void {
    this.dialogService.open<boolean>(
      new PolymorpheusComponent(ConfirmDialogComponent),
      {
        data: {
          title: 'Excluir Mesa',
          message: `Tem certeza que deseja excluir a mesa "${table.number}"?`,
          confirmLabel: 'Excluir',
          confirmAppearance: 'destructive',
        } as ConfirmDialogData,
      }
    ).subscribe((confirmed) => {
      if (confirmed) {
        this.deleteTable(table);
      }
    });
  }

  private deleteTable(table: Table): void {
    this.tablesService.delete(table.id).subscribe({
      next: () => {
        this.notificationService.success('Mesa excluída com sucesso');
        this.loadTables();
      },
      error: () => {
        this.notificationService.error('Erro ao excluir mesa');
      },
    });
  }
}
