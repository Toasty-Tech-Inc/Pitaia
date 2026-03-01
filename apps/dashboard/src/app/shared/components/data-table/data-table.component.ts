import { ChangeDetectionStrategy, Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiButton, TuiIcon, TuiLoader } from '@taiga-ui/core';
import { TuiPagination } from '@taiga-ui/kit';

export interface TableColumn<T = any> {
  key: string;
  header: string;
  width?: string;
  sortable?: boolean;
  render?: (item: T) => string;
  template?: string;
}

export interface TableAction<T = any> {
  icon: string;
  label: string;
  action: string;
  appearance?: string;
  condition?: (item: T) => boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    TuiButton,
    TuiIcon,
    TuiLoader,
    TuiPagination,
  ],
  template: `
    <div class="table-container">
      @if (loading()) {
        <div class="loading-overlay">
          <tui-loader [showLoader]="true" />
        </div>
      }

      <table class="data-table">
        <thead>
          <tr>
            @for (column of columns(); track column.key) {
              <th [style.width]="column.width || 'auto'">
                {{ column.header }}
                @if (column.sortable) {
                  <tui-icon icon="@tui.chevron-down" class="sort-icon" />
                }
              </th>
            }
            @if (actions().length > 0) {
              <th class="actions-column">Ações</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (item of data(); track trackByFn()(item)) {
            <tr>
              @for (column of columns(); track column.key) {
                <td [attr.data-label]="column.header">
                  @if (column.render) {
                    {{ column.render(item) }}
                  } @else {
                    {{ getNestedValue(item, column.key) }}
                  }
                </td>
              }
              @if (actions().length > 0) {
                <td class="actions-cell">
                  @for (action of getVisibleActions(item); track action.action) {
                    <button
                      tuiButton
                      [appearance]="action.appearance || 'flat'"
                      size="s"
                      [iconStart]="action.icon"
                      (click)="onAction.emit({ action: action.action, item })"
                      [title]="action.label"
                      [attr.aria-label]="action.label"
                    >
                    </button>
                  }
                </td>
              }
            </tr>
          } @empty {
            <tr>
              <td [attr.colspan]="columns().length + (actions().length > 0 ? 1 : 0)" class="empty-state">
                {{ emptyMessage() }}
              </td>
            </tr>
          }
        </tbody>
      </table>

      @if (showPagination() && totalPages() > 1) {
        <div class="pagination-container">
          <tui-pagination
            [length]="totalPages()"
            [index]="currentPage() - 1"
            (indexChange)="onPageChange.emit($event + 1)"
          />
          <span class="pagination-info">
            Mostrando {{ startItem() }}-{{ endItem() }} de {{ total() }}
          </span>
        </div>
      }
    </div>
  `,
  styles: [`
    .table-container {
      position: relative;
      background: var(--tui-background-base);
      border-radius: 0.75rem;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .loading-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.8);
      z-index: 10;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table th {
      background: var(--tui-background-neutral-1);
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--tui-text-secondary);
      border-bottom: 1px solid var(--tui-border-normal);
      white-space: nowrap;
    }

    .data-table td {
      padding: 1rem;
      border-bottom: 1px solid var(--tui-border-normal);
      font-size: 0.875rem;
    }

    .data-table tbody tr:hover {
      background: var(--tui-background-neutral-1);
    }

    .actions-column {
      width: 120px;
      text-align: center;
    }

    .actions-cell {
      display: flex;
      gap: 0.25rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .empty-state {
      text-align: center;
      padding: 3rem !important;
      color: var(--tui-text-secondary);
    }

    .pagination-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      border-top: 1px solid var(--tui-border-normal);
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .pagination-info {
      font-size: 0.875rem;
      color: var(--tui-text-secondary);
    }

    .sort-icon {
      width: 1rem;
      height: 1rem;
      opacity: 0.5;
      margin-left: 0.25rem;
    }

    // Tablet - horizontal scroll
    @media (max-width: 1024px) {
      .table-container {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }

      .data-table {
        min-width: 600px;
      }

      .data-table th,
      .data-table td {
        padding: 0.75rem;
      }
    }

    // Mobile - card layout
    @media (max-width: 768px) {
      .table-container {
        border-radius: 0.5rem;
      }

      .data-table {
        min-width: 100%;
      }

      .data-table thead {
        display: none;
      }

      .data-table tbody tr {
        display: flex;
        flex-direction: column;
        padding: 1rem;
        border-bottom: 1px solid var(--tui-border-normal);
        gap: 0.5rem;
      }

      .data-table tbody tr:hover {
        background: transparent;
      }

      .data-table td {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.25rem 0;
        border-bottom: none;
        gap: 0.5rem;
      }

      .data-table td::before {
        content: attr(data-label);
        font-weight: 600;
        color: var(--tui-text-secondary);
        font-size: 0.75rem;
        text-transform: uppercase;
        flex-shrink: 0;
      }

      .actions-cell {
        justify-content: flex-end;
        padding-top: 0.5rem !important;
        border-top: 1px solid var(--tui-border-normal);
        margin-top: 0.5rem;
      }

      .actions-cell::before {
        display: none;
      }

      .pagination-container {
        flex-direction: column;
        align-items: center;
      }
    }

    // Small mobile
    @media (max-width: 480px) {
      .data-table tbody tr {
        padding: 0.75rem;
      }

      .pagination-info {
        font-size: 0.75rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent<T = any> {
  data = input<T[]>([]);
  columns = input<TableColumn<T>[]>([]);
  actions = input<TableAction<T>[]>([]);
  loading = input(false);
  emptyMessage = input('Nenhum registro encontrado');
  
  showPagination = input(true);
  currentPage = input(1);
  pageSize = input(10);
  total = input(0);

  trackByFn = input<(item: T) => any>((item: any) => item.id);

  onAction = output<{ action: string; item: T }>();
  onPageChange = output<number>();

  totalPages = computed(() => Math.ceil(this.total() / this.pageSize()));
  startItem = computed(() => (this.currentPage() - 1) * this.pageSize() + 1);
  endItem = computed(() => Math.min(this.currentPage() * this.pageSize(), this.total()));

  getNestedValue(item: T, key: string): any {
    return key.split('.').reduce((obj: any, k) => obj?.[k], item);
  }

  getVisibleActions(item: T): TableAction<T>[] {
    return this.actions().filter(action => !action.condition || action.condition(item));
  }
}
