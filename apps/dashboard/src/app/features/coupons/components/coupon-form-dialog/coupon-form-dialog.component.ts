import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiError, TuiTextfield } from '@taiga-ui/core';
import { TuiCheckbox, TuiFieldErrorPipe, TuiRadio } from '@taiga-ui/kit';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { CouponsService } from '../../../../core/services/coupons.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Coupon, DiscountType } from '../../../../core/models/coupon.model';

export interface CouponFormDialogData {
  coupon?: Coupon;
}

@Component({
  selector: 'app-coupon-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TuiButton,
    TuiCheckbox,
    TuiError,
    TuiFieldErrorPipe,
    TuiRadio,
    TuiTextfield,
  ],
  template: `
    <div class="coupon-form-dialog">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label tuiLabel>Código do Cupom *</label>
          <tui-textfield>
            <input
              tuiTextfield
              formControlName="code"
              placeholder="DESCONTO10"
              [style.text-transform]="'uppercase'"
            />
          </tui-textfield>
          <tui-error
            [error]="['required'] | tuiFieldError"
            formControlName="code"
          />
        </div>

        <div class="form-group">
          <label tuiLabel>Descrição</label>
          <tui-textfield>
            <input
              tuiTextfield
              formControlName="description"
              placeholder="10% de desconto na primeira compra"
            />
          </tui-textfield>
        </div>

        <div class="form-group">
          <label tuiLabel>Tipo de Desconto</label>
          <div class="radio-group">
            <tui-radio formControlName="discountType" [value]="DiscountType.PERCENTAGE">
              Porcentagem
            </tui-radio>
            <tui-radio formControlName="discountType" [value]="DiscountType.FIXED">
              Valor Fixo
            </tui-radio>
          </div>
        </div>

        <div class="form-group">
          <label tuiLabel>Valor do Desconto *</label>
          <tui-textfield>
            <input
              tuiTextfield
              formControlName="discountValue"
              type="number"
              step="0.01"
              min="0"
              [placeholder]="form.get('discountType')?.value === DiscountType.PERCENTAGE ? '10' : '5.00'"
            />
          </tui-textfield>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label tuiLabel>Pedido Mínimo (R$)</label>
            <tui-textfield>
              <input
                tuiTextfield
                formControlName="minOrderValue"
                type="number"
                step="0.01"
                min="0"
                placeholder="50.00"
              />
            </tui-textfield>
          </div>

          <div class="form-group">
            <label tuiLabel>Desconto Máximo (R$)</label>
            <tui-textfield>
              <input
                tuiTextfield
                formControlName="maxDiscountAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="20.00"
              />
            </tui-textfield>
          </div>
        </div>

        <div class="form-group">
          <label tuiLabel>Limite de Usos</label>
          <tui-textfield>
            <input
              tuiTextfield
              formControlName="usageLimit"
              type="number"
              min="0"
              placeholder="Deixe vazio para ilimitado"
            />
          </tui-textfield>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label tuiLabel>Data de Início</label>
            <tui-textfield>
              <input
                tuiTextfield
                formControlName="startDate"
                type="date"
              />
            </tui-textfield>
          </div>

          <div class="form-group">
            <label tuiLabel>Data de Término</label>
            <tui-textfield>
              <input
                tuiTextfield
                formControlName="endDate"
                type="date"
              />
            </tui-textfield>
          </div>
        </div>

        <div class="form-group">
          <tui-checkbox formControlName="isActive">
            Cupom Ativo
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
    .coupon-form-dialog {
      padding: 1.5rem;
      min-width: 450px;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .radio-group {
      display: flex;
      gap: 1.5rem;
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
export class CouponFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private couponsService = inject(CouponsService);
  private notificationService = inject(NotificationService);
  readonly context = inject<TuiDialogContext<Coupon | null, CouponFormDialogData>>(POLYMORPHEUS_CONTEXT);

  protected DiscountType = DiscountType;
  protected saving = signal(false);
  protected isEditing = false;

  protected form: FormGroup = this.fb.group({
    code: ['', Validators.required],
    description: [''],
    discountType: [DiscountType.PERCENTAGE],
    discountValue: [10, [Validators.required, Validators.min(0)]],
    minOrderValue: [null],
    maxDiscountAmount: [null],
    usageLimit: [null],
    startDate: [''],
    endDate: [''],
    isActive: [true],
  });

  ngOnInit(): void {
    const coupon = this.context.data?.coupon;
    if (coupon) {
      this.isEditing = true;
      this.form.patchValue({
        ...coupon,
        startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
        endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : '',
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.saving.set(true);
    const formData = this.form.value;
    const data: Partial<Coupon> = {
      ...formData,
      code: formData.code.toUpperCase(),
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
    };

    const coupon = this.context.data?.coupon;

    const request = coupon
      ? this.couponsService.update(coupon.id, data)
      : this.couponsService.create(data);

    request.subscribe({
      next: (result) => {
        this.notificationService.success(
          coupon ? 'Cupom atualizado com sucesso' : 'Cupom criado com sucesso'
        );
        this.context.completeWith(result);
      },
      error: () => {
        this.notificationService.error('Erro ao salvar cupom');
        this.saving.set(false);
      },
    });
  }

  cancel(): void {
    this.context.completeWith(null);
  }
}
