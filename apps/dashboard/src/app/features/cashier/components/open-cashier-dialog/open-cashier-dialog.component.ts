import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiError, TuiTextfield } from '@taiga-ui/core';
import { TuiFieldErrorPipe } from '@taiga-ui/kit';
import { TuiDialogContext } from '@taiga-ui/core';
import { CashierService } from '../../../../core/services/cashier.service';
import { Cashier } from '../../../../core/models/cashier.model';

@Component({
  selector: 'app-open-cashier-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TuiButton,
    TuiError,
    TuiFieldErrorPipe,
    TuiTextfield,
  ],
  template: `
    <div class="open-cashier-dialog">
      <p class="description">
        Informe o valor inicial em caixa para começar a operar.
      </p>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="openingBalance" tuiLabel>Valor Inicial (R$) *</label>
          <tui-textfield>
            <input
              tuiTextfield
              formControlName="openingBalance"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
            />
          </tui-textfield>
          <tui-error
            [error]="(['required', 'min'] | tuiFieldError | async)"
            formControlName="openingBalance"
          />
        </div>

        <div class="form-group">
          <label for="notes" tuiLabel>Observações</label>
          <tui-textfield>
            <textarea
              tuiTextfield
              formControlName="notes"
              placeholder="Observações sobre a abertura do caixa"
              rows="2"
            ></textarea>
          </tui-textfield>
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
              Abrindo...
            } @else {
              Abrir Caixa
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .open-cashier-dialog {
      padding: 1.5rem;
      min-width: 350px;
    }

    .description {
      margin: 0 0 1.5rem;
      color: var(--tui-text-secondary);
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
export class OpenCashierDialogComponent {
  private fb = inject(FormBuilder);
  private cashierService = inject(CashierService);
  readonly context = inject<TuiDialogContext<Cashier | null>>(POLYMORPHEUS_CONTEXT);

  protected saving = signal(false);

  protected form: FormGroup = this.fb.group({
    openingBalance: [0, [Validators.required, Validators.min(0)]],
    notes: [''],
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.saving.set(true);
    // TODO: Get establishmentId from user service
    const establishmentId = 'your-establishment-id';

    this.cashierService.open({
      establishmentId,
      openingBalance: this.form.value.openingBalance,
      notes: this.form.value.notes,
    }).subscribe({
      next: (cashier) => {
        this.context.completeWith(cashier);
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }

  cancel(): void {
    this.context.completeWith(null);
  }
}
