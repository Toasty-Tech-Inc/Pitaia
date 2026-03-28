import { UserService } from '../../../../services/user.service';
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
          <label for="openingAmount" tuiLabel>Valor Inicial (R$) *</label>
          <tui-textfield>
            <input
              tuiTextfield
              formControlName="openingAmount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
            />
          </tui-textfield>
          <tui-error
            [error]="(['required', 'min'] | tuiFieldError | async)"
            formControlName="openingAmount"
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
  styleUrls: ['./open-cashier-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenCashierDialogComponent {
  private fb = inject(FormBuilder);
  private cashierService = inject(CashierService);
  private userService = inject(UserService);
  readonly context = inject<TuiDialogContext<Cashier | null>>(POLYMORPHEUS_CONTEXT);

  protected saving = signal(false);

  protected form: FormGroup = this.fb.group({
    openingAmount: [0, [Validators.required, Validators.min(0)]],
    notes: [''],
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    const establishment = this.userService.getEstablishment()();
    const user = this.userService.getUserInfo()();

    if (!establishment || !user) return;

    this.saving.set(true);

    this.cashierService.open({
      establishmentId: establishment.id,
      userId: user.id,
      openingAmount: this.form.value.openingAmount,
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
