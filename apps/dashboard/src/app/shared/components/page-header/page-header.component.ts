import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiButton, TuiLink, TuiTextfield } from '@taiga-ui/core';
import { TuiBreadcrumbs } from '@taiga-ui/kit';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TuiBreadcrumbs,
    TuiButton,
    TuiLink,
    TuiTextfield,
  ],
  template: `
    <nav compact tuiSubheader [style.position]="'sticky'" class="page-header">
      <tui-breadcrumbs [itemsLimit]="10" class="breadcrumbs">
        @for (item of breadcrumbs(); track item; let last = $last) {
          @if (last) {
            <strong>{{ item }}</strong>
          } @else {
            <button tuiLink type="button">{{ item }}</button>
          }
        }
      </tui-breadcrumbs>

      <div class="spacer"></div>

      <div class="actions-container">
        @if (showSearch()) {
          <tui-textfield iconStart="@tui.search" class="search-field">
            <input
              tuiTextfield
              type="text"
              [placeholder]="searchPlaceholder()"
              [ngModel]="searchValue()"
              (ngModelChange)="SearchChange.emit($event)"
            />
          </tui-textfield>
        }

        <div class="button-group">
          @if (showFilter()) {
            <button
              appearance="secondary"
              iconStart="@tui.filter"
              tuiButton
              type="button"
              (click)="Filter.emit()"
              class="filter-btn"
            >
              <span class="btn-label">Filtrar</span>
            </button>
          }

          @if (showRefresh()) {
            <button
              appearance="secondary"
              iconStart="@tui.refresh-cw"
              tuiButton
              type="button"
              (click)="Refresh.emit()"
              [disabled]="loading()"
              class="refresh-btn"
            >
              <span class="btn-label">Atualizar</span>
            </button>
          }

          @if (showAdd()) {
            <button
              class="pitaia-primary-btn add-btn"
              [iconStart]="addIcon()"
              tuiButton
              type="button"
              (click)="Add.emit()"
            >
              <span class="btn-label">{{ addLabel() }}</span>
            </button>
          }
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .page-header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--tui-border-normal);
      margin-bottom: 1.5rem;
    }

    .breadcrumbs {
      flex-shrink: 0;
    }

    .spacer {
      flex: 1;
      min-width: 0;
    }

    .actions-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .search-field {
      min-width: 200px;
      max-width: 280px;
      flex: 1;
    }

    .button-group {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .pitaia-primary-btn {
      background: linear-gradient(135deg, #FE3867 0%, #FF6B8A 100%);
      color: white;
    }

    // Tablet
    @media (max-width: 1024px) {
      .search-field {
        min-width: 180px;
        max-width: 220px;
      }
    }

    // Mobile
    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: stretch;
        gap: 0.75rem;
        padding: 0.5rem 0;
        margin-bottom: 1rem;
      }

      .breadcrumbs {
        order: 1;
      }

      .spacer {
        display: none;
      }

      .actions-container {
        order: 2;
        flex-direction: column;
        width: 100%;
      }

      .search-field {
        width: 100%;
        max-width: none;
        min-width: auto;
      }

      .button-group {
        width: 100%;
        justify-content: flex-end;
      }

      .filter-btn,
      .refresh-btn {
        .btn-label {
          display: none;
        }
      }

      .add-btn {
        flex: 1;
        justify-content: center;
      }
    }

    // Small mobile
    @media (max-width: 480px) {
      .button-group {
        justify-content: stretch;
      }

      .filter-btn,
      .refresh-btn,
      .add-btn {
        flex: 1;
        justify-content: center;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  breadcrumbs = input<string[]>([]);
  
  showSearch = input(true);
  searchPlaceholder = input('Pesquisar...');
  searchValue = input('');
  
  showFilter = input(true);
  showRefresh = input(true);
  showAdd = input(true);
  
  addLabel = input('Adicionar');
  addIcon = input('@tui.plus');
  
  loading = input(false);

  SearchChange = output<string>();
  Filter = output<void>();
  Refresh = output<void>();
  Add = output<void>();
}
