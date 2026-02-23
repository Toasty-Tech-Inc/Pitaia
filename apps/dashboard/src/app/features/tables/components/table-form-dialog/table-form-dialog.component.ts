import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiError, TuiTextfield } from '@taiga-ui/core';
import { TuiCheckbox, TuiFieldErrorPipe } from '@taiga-ui/kit';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { TablesService } from '../../../../core/services/tables.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Table, TableStatus } from '../../../../core/models/table.model';

export interface TableFormDialogData {
  table?: Table;
}

@Component({
  selector: 'app-table-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TuiButton,
    TuiCheckbox,
    TuiError,
    TuiFieldErrorPipe,
    TuiTextfield,
  ],
  template: `
    <div class="table-form-dialog">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label tuiLabel>Número da Mesa *</label>
          <tui-textfield>
            <input
              tuiTextfield
              formControlName="number"
              placeholder="01, A1, etc."
            />
          </tui-textfield>
          <tui-error
            [error]="['required'] | tuiFieldError"
            formControlName="number"
          />
        </div>

        <div class="form-group">
          <label tuiLabel>Capacidade *</label>
          <tui-textfield>
            <input
              tuiTextfield
              formControlName="capacity"
              type="number"
              placeholder="4"
              min="1"
            />
          </tui-textfield>
          <tui-error
            [error]="['required', 'min'] | tuiFieldError"
            formControlName="capacity"
          />
        </div>

        <div class="form-group">
          <label tuiLabel>Localização</label>
          <tui-textfield>
            <input
              tuiTextfield
              formControlName="location"
              placeholder="Área interna, Terraço, etc."
            />
          </tui-textfield>
        </div>

        <div class="form-group">
          <tui-checkbox formControlName="isActive">
            Mesa Ativa
          </tui-checkbox>
        </div>

        <div class="form-actions">
          <button
            tuiButton
            appearance="secondary"
            type="button"
            (click)="cancel()"
          >
            Cancelar
          </button>
          <button
            tuiButton
            class="pitaia-primary-btn"
            type="submit"
            [disabled]="form.invalid || saving()"
          >
            @if (saving()) {
              Salvando...
            } @else {
              {{ isEditing ? 'Atualizar' : 'Criar' }}
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .table-form-dialog {
      padding: 1.5rem;
      min-width: 350px;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    .form-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--tui-border-normal);
    }

    .pitaia-primary-btn {
      background: linear-gradient(135deg, #FE3867 0%, #FF6B8A 100%);
      color: white;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private tablesService = inject(TablesService);
  private notificationService = inject(NotificationService);
  readonly context = inject<TuiDialogContext<Table | null, TableFormDialogData>>(POLYMORPHEUS_CONTEXT);

  protected saving = signal(false);
  protected isEditing = false;

  protected form: FormGroup = this.fb.group({
    number: ['', Validators.required],
    capacity: [4, [Validators.required, Validators.min(1)]],
    location: [''],
    isActive: [true],
  });

  ngOnInit(): void {
    const table = this.context.data?.table;
    if (table) {
      this.isEditing = true;
      this.form.patchValue(table);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.saving.set(true);
    const data = {
      ...this.form.value,
      status: this.isEditing ? undefined : TableStatus.AVAILABLE,
    };
    const table = this.context.data?.table;

    const request = table
      ? this.tablesService.update(table.id, data)
      : this.tablesService.create(data);

    request.subscribe({
      next: (result) => {
        this.notificationService.success(
          table ? 'Mesa atualizada com sucesso' : 'Mesa criada com sucesso'
        );
        this.context.completeWith(result);
      },
      error: () => {
        this.notificationService.error('Erro ao salvar mesa');
        this.saving.set(false);
      },
    });
  }

  cancel(): void {
    this.context.completeWith(null);
  }
}
