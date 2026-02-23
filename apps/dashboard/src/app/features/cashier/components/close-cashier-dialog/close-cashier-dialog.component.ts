import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiError, TuiTextfield } from '@taiga-ui/core';
import { TuiFieldErrorPipe } from '@taiga-ui/kit';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { CashierService } from '../../../../core/services/cashier.service';
import { Cashier } from '../../../../core/models/cashier.model';

export interface CloseCashierDialogData {
  cashier: Cashier;
  expectedBalance: number;
}

@Component({
  selector: 'app-close-cashier-dialog',
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
    <div class="close-cashier-dialog">
      <div class="expected-balance">
        <span class="label">Saldo Esperado</span>
        <span class="value">{{ formatCurrency(context.data.expectedBalance) }}</span>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label tuiLabel>Valor Contado (R$) *</label>
          <tui-textfield>
            <input
              tuiTextfield
              formControlName="closingBalance"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              (input)="updateDifference()"
            />
          </tui-textfield>
          <tui-error
            [error]="['required', 'min'] | tuiFieldError"
            formControlName="closingBalance"
          />
        </div>

        @if (difference() !== 0) {
          <div class="difference" [class.positive]="difference() > 0" [class.negative]="difference() < 0">
            <span class="diff-label">Diferença:</span>
            <span class="diff-value">{{ formatCurrency(difference()) }}</span>
            <span class="diff-message">
              {{ difference() > 0 ? 'Sobra' : 'Falta' }} em caixa
            </span>
          </div>
        }

        <div class="form-group">
          <label tuiLabel>Observações</label>
          <tui-textfield>
            <textarea
              tuiTextfield
              formControlName="notes"
              placeholder="Observações sobre o fechamento do caixa"
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
            appearance="destructive"
            type="submit"
            [disabled]="form.invalid || saving()"
          >
            @if (saving()) {
              Fechando...
            } @else {
              Fechar Caixa
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .close-cashier-dialog {
      padding: 1.5rem;
      min-width: 350px;
    }

    .expected-balance {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: var(--tui-background-neutral-1);
      border-radius: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .expected-balance .label {
      font-weight: 500;
      color: var(--tui-text-secondary);
    }

    .expected-balance .value {
      font-size: 1.25rem;
      font-weight: 700;
      color: #38D9A9;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    .difference {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1.25rem;
    }

    .difference.positive {
      background: rgba(56, 217, 169, 0.1);
      color: #38D9A9;
    }

    .difference.negative {
      background: rgba(254, 56, 103, 0.1);
      color: #FE3867;
    }

    .diff-label {
      font-weight: 500;
    }

    .diff-value {
      font-weight: 700;
    }

    .diff-message {
      font-size: 0.875rem;
      width: 100%;
    }

    .form-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--tui-border-normal);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CloseCashierDialogComponent {
  private fb = inject(FormBuilder);
  private cashierService = inject(CashierService);
  readonly context = inject<TuiDialogContext<boolean, CloseCashierDialogData>>(POLYMORPHEUS_CONTEXT);

  protected saving = signal(false);
  protected difference = signal(0);

  protected form: FormGroup = this.fb.group({
    closingBalance: [0, [Validators.required, Validators.min(0)]],
    notes: [''],
  });

  updateDifference(): void {
    const closingBalance = this.form.get('closingBalance')?.value || 0;
    this.difference.set(closingBalance - this.context.data.expectedBalance);
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.saving.set(true);
    const cashier = this.context.data.cashier;

    this.cashierService.close(cashier.id, {
      closingBalance: this.form.value.closingBalance,
      notes: this.form.value.notes,
    }).subscribe({
      next: () => {
        this.context.completeWith(true);
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  cancel(): void {
    this.context.completeWith(false);
  }
}
