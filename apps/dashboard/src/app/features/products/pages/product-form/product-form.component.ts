import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiError, TuiIcon, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiCheckbox, TuiFieldErrorPipe, TuiDataListWrapper } from '@taiga-ui/kit';
import { TuiTextareaModule, TuiSelectModule, TuiInputNumberModule } from '@taiga-ui/legacy';
import { TuiCardLarge, TuiForm } from '@taiga-ui/layout';
import { LayoutComponent } from '../../../../shared/components/layout/layout.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ProductsService, CategoriesService } from '../../../../core/services/products.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Product, Category } from '../../../../core/models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LayoutComponent,
    PageHeaderComponent,
    TuiButton,
    TuiCardLarge,
    TuiCheckbox,
    TuiDataListWrapper,
    TuiError,
    TuiFieldErrorPipe,
    TuiForm,
    TuiIcon,
    TuiLoader,
    TuiTextfield,
  ],
  template: `
    <app-layout>
      <app-page-header
        [breadcrumbs]="['Dashboard', 'Produtos', isEditing() ? 'Editar' : 'Novo']"
        [showSearch]="false"
        [showFilter]="false"
        [showRefresh]="false"
        [showAdd]="false"
      />

      @if (loading()) {
        <div class="loading-container">
          <tui-loader [showLoader]="true" />
        </div>
      } @else {
        <div tuiCardLarge class="form-card">
          <h2 class="form-title">
            {{ isEditing() ? 'Editar Produto' : 'Novo Produto' }}
          </h2>

          <form tuiForm [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-grid">
              <div class="form-group full-width">
                <label tuiLabel>Nome do Produto *</label>
                <tui-textfield>
                  <input
                    tuiTextfield
                    formControlName="name"
                    placeholder="Ex: Hambúrguer Artesanal"
                  />
                </tui-textfield>
                <tui-error
                  [error]="['required'] | tuiFieldError"
                  formControlName="name"
                />
              </div>

              <div class="form-group full-width">
                <label tuiLabel>Descrição</label>
                <tui-textfield>
                  <textarea
                    tuiTextfield
                    formControlName="description"
                    placeholder="Descrição detalhada do produto"
                    rows="3"
                  ></textarea>
                </tui-textfield>
              </div>

              <div class="form-group">
                <label tuiLabel>Preço *</label>
                <tui-textfield>
                  <input
                    tuiTextfield
                    formControlName="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </tui-textfield>
              </div>

              <div class="form-group">
                <label tuiLabel>Custo</label>
                <tui-textfield>
                  <input
                    tuiTextfield
                    formControlName="cost"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </tui-textfield>
              </div>

              <div class="form-group">
                <label tuiLabel>SKU</label>
                <tui-textfield>
                  <input
                    tuiTextfield
                    formControlName="sku"
                    placeholder="SKU-001"
                  />
                </tui-textfield>
              </div>

              <div class="form-group">
                <label tuiLabel>Código de Barras</label>
                <tui-textfield>
                  <input
                    tuiTextfield
                    formControlName="barcode"
                    placeholder="7891234567890"
                  />
                </tui-textfield>
              </div>

              <div class="form-group">
                <label tuiLabel>Tempo de Preparo (min)</label>
                <tui-textfield>
                  <input
                    tuiTextfield
                    formControlName="preparationTime"
                    type="number"
                    placeholder="15"
                  />
                </tui-textfield>
              </div>

              <div class="form-group">
                <label tuiLabel>Unidade</label>
                <tui-textfield>
                  <input
                    tuiTextfield
                    formControlName="unit"
                    placeholder="un, kg, ml..."
                  />
                </tui-textfield>
              </div>

              <div class="form-group full-width">
                <h3>Controle de Estoque</h3>
              </div>

              <div class="form-group">
                <tui-checkbox formControlName="trackInventory">
                  Controlar Estoque
                </tui-checkbox>
              </div>

              @if (form.get('trackInventory')?.value) {
                <div class="form-group">
                  <label tuiLabel>Estoque Atual</label>
                  <tui-textfield>
                    <input
                      tuiTextfield
                      formControlName="currentStock"
                      type="number"
                      placeholder="0"
                    />
                  </tui-textfield>
                </div>

                <div class="form-group">
                  <label tuiLabel>Estoque Mínimo</label>
                  <tui-textfield>
                    <input
                      tuiTextfield
                      formControlName="minStock"
                      type="number"
                      placeholder="5"
                    />
                  </tui-textfield>
                </div>

                <div class="form-group">
                  <label tuiLabel>Estoque Máximo</label>
                  <tui-textfield>
                    <input
                      tuiTextfield
                      formControlName="maxStock"
                      type="number"
                      placeholder="100"
                    />
                  </tui-textfield>
                </div>
              }

              <div class="form-group full-width">
                <h3>Opções</h3>
              </div>

              <div class="form-group">
                <tui-checkbox formControlName="isActive">
                  Produto Ativo
                </tui-checkbox>
              </div>

              <div class="form-group">
                <tui-checkbox formControlName="isAvailable">
                  Disponível para Venda
                </tui-checkbox>
              </div>

              <div class="form-group">
                <tui-checkbox formControlName="isFeatured">
                  Produto em Destaque
                </tui-checkbox>
              </div>
            </div>

            <div class="form-actions">
              <button
                tuiButton
                appearance="secondary"
                type="button"
                (click)="goBack()"
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
                  {{ isEditing() ? 'Atualizar' : 'Criar Produto' }}
                }
              </button>
            </div>
          </form>
        </div>
      }
    </app-layout>
  `,
  styles: [`
    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
    }

    .form-card {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .form-title {
      margin: 0 0 2rem;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-group h3 {
      margin: 1rem 0 0;
      padding-top: 1rem;
      border-top: 1px solid var(--tui-border-normal);
      font-size: 1rem;
      font-weight: 600;
      color: var(--tui-text-secondary);
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid var(--tui-border-normal);
    }

    .pitaia-primary-btn {
      background: linear-gradient(135deg, #FE3867 0%, #FF6B8A 100%);
      color: white;
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private productsService = inject(ProductsService);
  private categoriesService = inject(CategoriesService);
  private notificationService = inject(NotificationService);

  protected loading = signal(false);
  protected saving = signal(false);
  protected isEditing = signal(false);
  protected productId = signal<string | null>(null);
  protected categories = signal<Category[]>([]);

  protected form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    cost: [null],
    sku: [''],
    barcode: [''],
    preparationTime: [null],
    unit: ['un'],
    trackInventory: [false],
    currentStock: [0],
    minStock: [null],
    maxStock: [null],
    isActive: [true],
    isAvailable: [true],
    isFeatured: [false],
    categoryId: [null],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.productId.set(id);
      this.isEditing.set(true);
      this.loadProduct(id);
    }
    this.loadCategories();
  }

  private loadProduct(id: string): void {
    this.loading.set(true);
    this.productsService.getById(id).subscribe({
      next: (product) => {
        this.form.patchValue(product);
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.error('Erro ao carregar produto');
        this.loading.set(false);
        this.goBack();
      },
    });
  }

  private loadCategories(): void {
    this.categoriesService.getAll({ limit: 100 }).subscribe({
      next: (response) => {
        this.categories.set(response.data);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.saving.set(true);
    const data = this.form.value;

    const request = this.isEditing()
      ? this.productsService.update(this.productId()!, data)
      : this.productsService.create(data);

    request.subscribe({
      next: () => {
        this.notificationService.success(
          this.isEditing() ? 'Produto atualizado com sucesso' : 'Produto criado com sucesso'
        );
        this.goBack();
      },
      error: () => {
        this.notificationService.error('Erro ao salvar produto');
        this.saving.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }
}
