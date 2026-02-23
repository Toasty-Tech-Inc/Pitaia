import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiButton, TuiIcon, TuiLink, TuiTextfield } from '@taiga-ui/core';
import { TuiBreadcrumbs } from '@taiga-ui/kit';
import { TuiSubheader } from '@taiga-ui/layout';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TuiBreadcrumbs,
    TuiButton,
    TuiIcon,
    TuiLink,
    TuiSubheader,
    TuiTextfield,
  ],
  template: `
    <nav compact tuiSubheader [style.position]="'sticky'" class="page-header">
      <tui-breadcrumbs [itemsLimit]="10">
        @for (item of breadcrumbs(); track item; let last = $last) {
          @if (last) {
            <strong>{{ item }}</strong>
          } @else {
            <button tuiLink type="button">{{ item }}</button>
          }
        }
      </tui-breadcrumbs>

      <div class="spacer"></div>

      @if (showSearch()) {
        <tui-textfield iconStart="@tui.search">
          <input
            tuiTextfield
            type="text"
            [placeholder]="searchPlaceholder()"
            [ngModel]="searchValue()"
            (ngModelChange)="onSearchChange.emit($event)"
          />
        </tui-textfield>
      }

      @if (showFilter()) {
        <button
          appearance="secondary"
          iconStart="@tui.filter"
          tuiButton
          type="button"
          (click)="onFilter.emit()"
        >
          Filtrar
        </button>
      }

      @if (showRefresh()) {
        <button
          appearance="secondary"
          iconStart="@tui.refresh-cw"
          tuiButton
          type="button"
          (click)="onRefresh.emit()"
          [disabled]="loading()"
        >
          Atualizar
        </button>
      }

      @if (showAdd()) {
        <button
          class="pitaia-primary-btn"
          [iconStart]="addIcon()"
          tuiButton
          type="button"
          (click)="onAdd.emit()"
        >
          {{ addLabel() }}
        </button>
      }
    </nav>
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--tui-border-normal);
      margin-bottom: 1.5rem;
    }

    .spacer {
      flex: 1;
    }

    tui-textfield {
      min-width: 280px;
    }

    .pitaia-primary-btn {
      background: linear-gradient(135deg, #FE3867 0%, #FF6B8A 100%);
      color: white;
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

  onSearchChange = output<string>();
  onFilter = output<void>();
  onRefresh = output<void>();
  onAdd = output<void>();
}
