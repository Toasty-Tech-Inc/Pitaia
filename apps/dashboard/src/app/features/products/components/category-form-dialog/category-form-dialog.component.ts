import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiError, TuiTextfield } from '@taiga-ui/core';
import { TuiCheckbox, TuiFieldErrorPipe } from '@taiga-ui/kit';
import { TuiDialogContext } from '@taiga-ui/core';
import { CategoriesService } from '../../../../core/services/products.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { UserService } from '../../../../services/user.service';
import { Category } from '../../../../core/models/product.model';

export interface CategoryFormDialogData {
  category?: Category;
}

@Component({
  selector: 'app-category-form-dialog',
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
    <div class="category-form-dialog">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="name" tuiLabel>Nome *</label>
          <tui-textfield>
            <input
              tuiTextfield
              formControlName="name"
              placeholder="Nome da categoria"
            />
          </tui-textfield>
          <tui-error
            [error]="(['required'] | tuiFieldError | async)"
            formControlName="name"
          />
        </div>

        <div class="form-group">
          <label for="name" tuiLabel>Descrição</label>
          <tui-textfield>
            <textarea
              tuiTextfield
              formControlName="description"
              placeholder="Descrição da categoria"
              rows="3"
            ></textarea>
          </tui-textfield>
        </div>

        <div class="form-group">
          <label for="name" tuiLabel>Ordem de Exibição</label>
          <tui-textfield>
            <input
              tuiTextfield
              formControlName="sortOrder"
              type="number"
              placeholder="0"
            />
          </tui-textfield>
        </div>

        <div class="form-group">
          <tui-checkbox formControlName="isActive">
            Categoria Ativa
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
    .category-form-dialog {
      padding: 1.5rem;
      min-width: 400px;
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
export class CategoryFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoriesService = inject(CategoriesService);
  private notificationService = inject(NotificationService);
  private userService = inject(UserService);
  readonly context = inject<TuiDialogContext<Category | null, CategoryFormDialogData>>(POLYMORPHEUS_CONTEXT);

  protected saving = signal(false);
  protected isEditing = false;

  protected form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    sortOrder: [0],
    isActive: [true],
  });

  ngOnInit(): void {
    const category = this.context.data?.category;
    if (category) {
      this.isEditing = true;
      this.form.patchValue(category);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.saving.set(true);
    const data = this.form.value;
    const category = this.context.data?.category;

    // Add establishmentId when creating a new category
    if (!category) {
      const establishmentId = this.userService.getEstablishmentId();
      if (!establishmentId) {
        this.notificationService.error('Estabelecimento não selecionado');
        this.saving.set(false);
        return;
      }
      data.establishmentId = establishmentId;
    }

    const request = category
      ? this.categoriesService.update(category.id, data)
      : this.categoriesService.create(data);

    request.subscribe({
      next: (result) => {
        this.notificationService.success(
          category ? 'Categoria atualizada com sucesso' : 'Categoria criada com sucesso'
        );
        this.context.completeWith(result);
      },
      error: () => {
        this.notificationService.error('Erro ao salvar categoria');
        this.saving.set(false);
      },
    });
  }

  cancel(): void {
    this.context.completeWith(null);
  }
}
