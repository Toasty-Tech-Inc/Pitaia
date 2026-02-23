import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiError, TuiTextfield } from '@taiga-ui/core';
import { TuiFieldErrorPipe } from '@taiga-ui/kit';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { CashierService } from '../../../../core/services/cashier.service';
import { CashMovement, MovementType } from '../../../../core/models/cashier.model';

export interface CashMovementDialogData {
  cashierId: string;
  type: MovementType;
}

@Component({
  selector: 'app-cash-movement-dialog',
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
    <div class="cash-movement-dialog">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label tuiLabel>Valor (R$) *</label>
          <tui-textfield>
            <input
              tuiTextfield
              formControlName="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
            />
          </tui-textfield>
          <tui-error
            [error]="['required', 'min'] | tuiFieldError"
            formControlName="amount"
          />
        </div>

        <div class="form-group">
          <label tuiLabel>Descrição *</label>
          <tui-textfield>
            <input
              tuiTextfield
              formControlName="description"
              [placeholder]="isDeposit ? 'Ex: Troco inicial, Suprimento...' : 'Ex: Pagamento fornecedor, Despesa operacional...'"
            />
          </tui-textfield>
          <tui-error
            [error]="['required'] | tuiFieldError"
            formControlName="description"
          />
        </div>

        <div class="form-group">
          <label tuiLabel>Forma de Pagamento</label>
          <tui-textfield>
            <input
              tuiTextfield
              formControlName="paymentMethod"
              placeholder="Dinheiro, PIX, etc."
            />
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
            [class.pitaia-primary-btn]="isDeposit"
            [appearance]="isDeposit ? 'primary' : 'destructive'"
            type="submit"
            [disabled]="form.invalid || saving()"
          >
            @if (saving()) {
              Registrando...
            } @else {
              Registrar {{ isDeposit ? 'Entrada' : 'Sangria' }}
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .cash-movement-dialog {
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
export class CashMovementDialogComponent {
  private fb = inject(FormBuilder);
  private cashierService = inject(CashierService);
  readonly context = inject<TuiDialogContext<CashMovement | null, CashMovementDialogData>>(POLYMORPHEUS_CONTEXT);

  protected saving = signal(false);
  protected isDeposit = this.context.data.type === MovementType.DEPOSIT;

  protected form: FormGroup = this.fb.group({
    amount: [null, [Validators.required, Validators.min(0.01)]],
    description: ['', Validators.required],
    paymentMethod: ['Dinheiro'],
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.saving.set(true);

    this.cashierService.addMovement(this.context.data.cashierId, {
      type: this.context.data.type,
      amount: this.form.value.amount,
      description: this.form.value.description,
      paymentMethod: this.form.value.paymentMethod,
    }).subscribe({
      next: (movement) => {
        this.context.completeWith(movement);
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
