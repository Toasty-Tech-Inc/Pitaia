import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiError, TuiTextfield } from '@taiga-ui/core';
import { TuiFieldErrorPipe } from '@taiga-ui/kit';
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
          <label for="closingAmount" tuiLabel>Valor Contado (R$) *</label>
          <tui-textfield>
            <input
              tuiTextfield
              formControlName="closingAmount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              (input)="updateDifference()"
            />
          </tui-textfield>
          <tui-error
            [error]="(['required', 'min'] | tuiFieldError | async)"
            formControlName="closingAmount"
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
          <label for="notes" tuiLabel>Observações</label>
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
  styleUrls: ['./close-cashier-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CloseCashierDialogComponent {
  private fb = inject(FormBuilder);
  private cashierService = inject(CashierService);
  readonly context = inject<TuiDialogContext<boolean, CloseCashierDialogData>>(POLYMORPHEUS_CONTEXT);

  protected saving = signal(false);
  protected difference = signal(0);

  protected form: FormGroup = this.fb.group({
    closingAmount: [0, [Validators.required, Validators.min(0)]],
    notes: [''],
  });

  updateDifference(): void {
    const closingAmount = this.form.get('closingAmount')?.value || 0;
    this.difference.set(closingAmount - this.context.data.expectedBalance);
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.saving.set(true);
    const cashier = this.context.data.cashier;

    this.cashierService.close(cashier.id, {
      closingAmount: this.form.value.closingAmount,
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
