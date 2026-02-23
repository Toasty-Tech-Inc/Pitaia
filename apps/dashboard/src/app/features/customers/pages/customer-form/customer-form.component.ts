import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiError, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiCheckbox, TuiFieldErrorPipe } from '@taiga-ui/kit';
import { TuiCardLarge, TuiForm } from '@taiga-ui/layout';
import { LayoutComponent } from '../../../../shared/components/layout/layout.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { CustomersService } from '../../../../core/services/customers.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Customer } from '../../../../core/models/customer.model';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LayoutComponent,
    PageHeaderComponent,
    TuiButton,
    TuiCardLarge,
    TuiCheckbox,
    TuiError,
    TuiFieldErrorPipe,
    TuiForm,
    TuiLoader,
    TuiTextfield,
  ],
  template: `
    <app-layout>
      <app-page-header
        [breadcrumbs]="['Dashboard', 'Clientes', isEditing() ? 'Editar' : 'Novo']"
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
            {{ isEditing() ? 'Editar Cliente' : 'Novo Cliente' }}
          </h2>

          <form tuiForm [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-grid">
              <div class="form-group full-width">
                <label for="name" tuiLabel>Nome Completo *</label>
                <tui-textfield>
                  <input
                    tuiTextfield
                    formControlName="name"
                    placeholder="Nome do cliente"
                  />
                </tui-textfield>
                <tui-error
                  [error]="(['required'] | tuiFieldError | async)"
                  formControlName="name"
                />
              </div>

              <div class="form-group">
                <label for="email" tuiLabel>Email</label>
                <tui-textfield>
                  <input
                    tuiTextfield
                    formControlName="email"
                    type="email"
                    placeholder="email@exemplo.com"
                  />
                </tui-textfield>
              </div>

              <div class="form-group">
                <label for="phone" tuiLabel>Telefone *</label>
                <tui-textfield>
                  <input
                    tuiTextfield
                    formControlName="phone"
                    placeholder="(11) 99999-9999"
                  />
                </tui-textfield>
                <tui-error
                  [error]="(['required'] | tuiFieldError |async)"
                  formControlName="phone"
                />
              </div>

              <div class="form-group">
                <label for="cpf" tuiLabel>CPF</label>
                <tui-textfield>
                  <input
                    tuiTextfield
                    formControlName="cpf"
                    placeholder="000.000.000-00"
                  />
                </tui-textfield>
              </div>

              <div class="form-group">
                <label for="birthDate" tuiLabel>Data de Nascimento</label>
                <tui-textfield>
                  <input
                    tuiTextfield
                    formControlName="birthDate"
                    type="date"
                  />
                </tui-textfield>
              </div>

              <div class="form-group full-width">
                <h3>Endereço Principal</h3>
              </div>

              <div class="form-group">
                <label for="zipCode" tuiLabel>CEP</label>
                <tui-textfield>
                  <input
                    tuiTextfield
                    formControlName="zipCode"
                    placeholder="00000-000"
                  />
                </tui-textfield>
              </div>

              <div class="form-group full-width">
                <label for="street" tuiLabel>Rua</label>
                <tui-textfield>
                  <input
                    tuiTextfield
                    formControlName="street"
                    placeholder="Nome da rua"
                  />
                </tui-textfield>
              </div>

              <div class="form-group">
                <label for="number" tuiLabel>Número</label>
                <tui-textfield>
                  <input
                    tuiTextfield
                    formControlName="number"
                    placeholder="123"
                  />
                </tui-textfield>
              </div>

              <div class="form-group">
                <label for="complement" tuiLabel>Complemento</label>
                <tui-textfield>
                  <input
                    tuiTextfield
                    formControlName="complement"
                    placeholder="Apto, Bloco..."
                  />
                </tui-textfield>
              </div>

              <div class="form-group">
                <label for="neighborhood" tuiLabel>Bairro</label>
                <tui-textfield>
                  <input
                    tuiTextfield
                    formControlName="neighborhood"
                    placeholder="Nome do bairro"
                  />
                </tui-textfield>
              </div>

              <div class="form-group">
                <label for="city" tuiLabel>Cidade</label>
                <tui-textfield>
                  <input
                    tuiTextfield
                    formControlName="city"
                    placeholder="Nome da cidade"
                  />
                </tui-textfield>
              </div>

              <div class="form-group">
                <label for="state" tuiLabel>Estado</label>
                <tui-textfield>
                  <input
                    tuiTextfield
                    formControlName="state"
                    placeholder="SP"
                    maxlength="2"
                  />
                </tui-textfield>
              </div>

              <div class="form-group full-width">
                <tui-checkbox formControlName="isActive">
                  Cliente Ativo
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
                  {{ isEditing() ? 'Atualizar' : 'Criar Cliente' }}
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
export class CustomerFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private customersService = inject(CustomersService);
  private notificationService = inject(NotificationService);

  protected loading = signal(false);
  protected saving = signal(false);
  protected isEditing = signal(false);
  protected customerId = signal<string | null>(null);

  protected form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', Validators.email],
    phone: ['', Validators.required],
    cpf: [''],
    birthDate: [''],
    isActive: [true],
    // Address fields
    zipCode: [''],
    street: [''],
    number: [''],
    complement: [''],
    neighborhood: [''],
    city: [''],
    state: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.customerId.set(id);
      this.isEditing.set(true);
      this.loadCustomer(id);
    }
  }

  private loadCustomer(id: string): void {
    this.loading.set(true);
    this.customersService.getById(id).subscribe({
      next: (customer) => {
        this.form.patchValue({
          ...customer,
          birthDate: customer.birthDate ? new Date(customer.birthDate).toISOString().split('T')[0] : '',
          zipCode: customer.address?.zipCode || '',
          street: customer.address?.street || '',
          number: customer.address?.number || '',
          complement: customer.address?.complement || '',
          neighborhood: customer.address?.neighborhood || '',
          city: customer.address?.city || '',
          state: customer.address?.state || '',
        });
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.error('Erro ao carregar cliente');
        this.loading.set(false);
        this.goBack();
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.saving.set(true);
    const formData = this.form.value;

    const data: Partial<Customer> = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      cpf: formData.cpf,
      birthDate: formData.birthDate ? new Date(formData.birthDate) : undefined,
      isActive: formData.isActive,
    };

    // Include address if any field is filled
    if (formData.street || formData.zipCode) {
      data.address = {
        id: '',
        customerId: '',
        street: formData.street,
        number: formData.number,
        complement: formData.complement,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    const request = this.isEditing()
      ? this.customersService.update(this.customerId()!, data)
      : this.customersService.create(data);

    request.subscribe({
      next: () => {
        this.notificationService.success(
          this.isEditing() ? 'Cliente atualizado com sucesso' : 'Cliente criado com sucesso'
        );
        this.goBack();
      },
      error: () => {
        this.notificationService.error('Erro ao salvar cliente');
        this.saving.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/customers']);
  }
}
