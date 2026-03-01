import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiIcon, TuiTextfield, TuiLoader } from '@taiga-ui/core';
import { TuiTabs } from '@taiga-ui/kit';
import { TuiCardLarge } from '@taiga-ui/layout';
import { LayoutComponent } from '../../../../shared/components/layout/layout.component';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { CustomerAddress } from '../../../../core/models/order.model';

@Component({
  selector: 'app-profile-page',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    LayoutComponent,
    TuiButton,
    TuiIcon,
    TuiTextfield,
    TuiLoader,
    TuiTabs,
    TuiCardLarge,
  ],
  template: `
    <app-layout>
      <section class="profile-page">
        <header class="page-header">
          <h1 class="page-title">Minha Conta</h1>
        </header>

        @if (!isAuthenticated()) {
          <div class="login-required" role="alert">
            <tui-icon icon="@tui.lock" class="lock-icon" />
            <h2>Faça login para acessar seu perfil</h2>
            <a routerLink="/login" tuiButton appearance="primary">
              Fazer Login
            </a>
          </div>
        } @else {
          <tui-tabs [(activeItemIndex)]="selectedTab">
            <button tuiTab>Dados pessoais</button>
            <button tuiTab>Endereços</button>
          </tui-tabs>

          @if (selectedTab === 0) {
            <div tuiCardLarge class="profile-section">
              <h2>Dados pessoais</h2>
              
              <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="profile-form">
                <tui-textfield>
                  <label tuiLabel for="profile-name">Nome completo</label>
                  <input id="profile-name" tuiTextfield formControlName="name" />
                </tui-textfield>

                <tui-textfield>
                  <label tuiLabel for="profile-phone">Telefone</label>
                  <input id="profile-phone" tuiTextfield formControlName="phone" type="tel" />
                </tui-textfield>

                <tui-textfield>
                  <label tuiLabel for="profile-email">E-mail</label>
                  <input id="profile-email" tuiTextfield formControlName="email" type="email" />
                </tui-textfield>

                <tui-textfield>
                  <label tuiLabel for="profile-cpf">CPF</label>
                  <input id="profile-cpf" tuiTextfield formControlName="cpf" />
                </tui-textfield>

                <div class="form-actions">
                  <button
                    tuiButton
                    appearance="primary"
                    type="submit"
                    [disabled]="profileForm.invalid || savingProfile()"
                  >
                    @if (savingProfile()) {
                      <tui-loader size="s" />
                    } @else {
                      Salvar alterações
                    }
                  </button>
                </div>
              </form>
            </div>

            <div tuiCardLarge class="danger-section">
              <h2>
                <tui-icon icon="@tui.alert-triangle" />
                Sair da conta
              </h2>
              <p>Você será desconectado e precisará fazer login novamente.</p>
              <button tuiButton appearance="outline" (click)="logout()">
                Sair
              </button>
            </div>
          }

          @if (selectedTab === 1) {
            <div tuiCardLarge class="addresses-section">
              <div class="section-header">
                <h2>Endereços salvos</h2>
                <button tuiButton appearance="outline" size="s" (click)="toggleAddressForm()">
                  <tui-icon icon="@tui.plus" />
                  Novo endereço
                </button>
              </div>

              @if (showAddressForm()) {
                <form [formGroup]="addressForm" (ngSubmit)="saveAddress()" class="address-form">
                  <tui-textfield>
                    <label tuiLabel for="address-label">Nome do endereço (ex: Casa, Trabalho)</label>
                    <input id="address-label" tuiTextfield formControlName="label" />
                  </tui-textfield>

                  <tui-textfield>
                    <label tuiLabel for="address-zipCode">CEP</label>
                    <input id="address-zipCode" tuiTextfield formControlName="zipCode" (blur)="onCepBlur()" />
                  </tui-textfield>

                  <div class="form-row">
                    <tui-textfield class="flex-2">
                      <label tuiLabel for="address-street">Rua</label>
                      <input id="address-street" tuiTextfield formControlName="street" />
                    </tui-textfield>
                    <tui-textfield class="flex-1">
                      <label tuiLabel for="address-number">Número</label>
                      <input id="address-number" tuiTextfield formControlName="number" />
                    </tui-textfield>
                  </div>

                  <tui-textfield>
                    <label tuiLabel for="address-complement">Complemento</label>
                    <input id="address-complement" tuiTextfield formControlName="complement" />
                  </tui-textfield>

                  <tui-textfield>
                    <label tuiLabel for="address-neighborhood">Bairro</label>
                    <input id="address-neighborhood" tuiTextfield formControlName="neighborhood" />
                  </tui-textfield>

                  <div class="form-row">
                    <tui-textfield class="flex-2">
                      <label tuiLabel for="address-city">Cidade</label>
                      <input id="address-city" tuiTextfield formControlName="city" />
                    </tui-textfield>
                    <tui-textfield class="flex-1">
                      <label tuiLabel for="address-state">UF</label>
                      <input id="address-state" tuiTextfield formControlName="state" maxlength="2" />
                    </tui-textfield>
                  </div>

                  <tui-textfield>
                    <label tuiLabel for="address-reference">Referência</label>
                    <input id="address-reference" tuiTextfield formControlName="reference" />
                  </tui-textfield>

                  <div class="form-actions">
                    <button tuiButton appearance="outline" type="button" (click)="toggleAddressForm()">
                      Cancelar
                    </button>
                    <button
                      tuiButton
                      appearance="primary"
                      type="submit"
                      [disabled]="addressForm.invalid || savingAddress()"
                    >
                      @if (savingAddress()) {
                        <tui-loader size="s" />
                      } @else {
                        Salvar endereço
                      }
                    </button>
                  </div>
                </form>
              }

              @if (loadingAddresses()) {
                <div class="loading-container">
                  <tui-loader />
                </div>
              } @else if (addresses().length === 0) {
                <div class="empty-addresses">
                  <tui-icon icon="@tui.map-pin" />
                  <p>Você ainda não tem endereços salvos.</p>
                </div>
              } @else {
                <div class="addresses-list">
                  @for (address of addresses(); track address.id) {
                    <div class="address-card" [class.default]="address.isDefault">
                      @if (address.isDefault) {
                        <span class="default-badge">Padrão</span>
                      }
                      <div class="address-content">
                        @if (address.label) {
                          <strong class="address-label">{{ address.label }}</strong>
                        }
                        <address>
                          {{ address.street }}, {{ address.number }}
                          @if (address.complement) {
                            - {{ address.complement }}
                          }
                          <br />
                          {{ address.neighborhood }} - {{ address.city }}/{{ address.state }}
                          <br />
                          CEP: {{ address.zipCode }}
                        </address>
                      </div>
                      <div class="address-actions">
                        <button
                          tuiButton
                          appearance="flat"
                          size="xs"
                          (click)="deleteAddress(address.id)"
                          aria-label="Excluir endereço"
                        >
                          <tui-icon icon="@tui.trash-2" />
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }
        }
      </section>
    </app-layout>
  `,
  styles: [`
    .profile-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-width: 800px;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 700;
      margin: 0;
    }

    .login-required {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 4rem;
      text-align: center;
    }

    .lock-icon {
      width: 4rem;
      height: 4rem;
      color: var(--tui-text-tertiary);
      margin-bottom: 1rem;
    }

    .profile-section,
    .danger-section,
    .addresses-section {
      padding: 1.5rem;
    }

    .profile-section h2,
    .danger-section h2,
    .addresses-section h2 {
      font-size: 1.125rem;
      margin: 0 0 1.5rem;
    }

    .danger-section h2 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--tui-status-negative);
    }

    .danger-section p {
      color: var(--tui-text-secondary);
      margin: 0 0 1rem;
    }

    .profile-form,
    .address-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-row {
      display: flex;
      gap: 1rem;
    }

    .flex-1 { flex: 1; }
    .flex-2 { flex: 2; }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .section-header h2 {
      margin: 0;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }

    .empty-addresses {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
      color: var(--tui-text-secondary);
    }

    .empty-addresses tui-icon {
      width: 3rem;
      height: 3rem;
      margin-bottom: 0.5rem;
    }

    .addresses-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .address-card {
      display: flex;
      align-items: flex-start;
      padding: 1rem;
      border: 1px solid var(--tui-border-normal);
      border-radius: 8px;
      position: relative;
    }

    .address-card.default {
      border-color: #FE3867;
      background: rgba(254, 56, 103, 0.05);
    }

    .default-badge {
      position: absolute;
      top: -0.5rem;
      right: 1rem;
      background: #FE3867;
      color: white;
      font-size: 0.75rem;
      padding: 0.125rem 0.5rem;
      border-radius: 4px;
    }

    .address-content {
      flex: 1;
    }

    .address-label {
      display: block;
      margin-bottom: 0.5rem;
    }

    .address-content address {
      font-style: normal;
      color: var(--tui-text-secondary);
      line-height: 1.5;
    }

    .address-actions {
      display: flex;
      gap: 0.5rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  protected isAuthenticated = this.authService.isAuthenticated;
  protected customer = this.authService.customer;

  protected selectedTab = 0;
  protected showAddressForm = signal(false);
  protected savingProfile = signal(false);
  protected savingAddress = signal(false);
  protected loadingAddresses = signal(false);
  protected addresses = signal<CustomerAddress[]>([]);

  protected profileForm = this.fb.group({
    name: ['', Validators.required],
    phone: ['', Validators.required],
    email: [''],
    cpf: [''],
  });

  protected addressForm = this.fb.group({
    label: [''],
    zipCode: ['', Validators.required],
    street: ['', Validators.required],
    number: ['', Validators.required],
    complement: [''],
    neighborhood: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
    reference: [''],
    isDefault: [false],
  });

  ngOnInit(): void {
    if (this.isAuthenticated()) {
      this.loadProfile();
      this.loadAddresses();
    }
  }

  private loadProfile(): void {
    const customer = this.customer();
    if (customer) {
      this.profileForm.patchValue({
        name: customer.name,
        phone: customer.phone,
        email: customer.email ?? '',
        cpf: customer.cpf ?? '',
      });
    }
  }

  private loadAddresses(): void {
    this.loadingAddresses.set(true);
    this.authService.getAddresses().subscribe({
      next: (addresses) => {
        this.addresses.set(addresses);
        this.loadingAddresses.set(false);
      },
      error: (err) => {
        console.error('Error loading addresses:', err);
        this.loadingAddresses.set(false);
      },
    });
  }

  protected saveProfile(): void {
    if (this.profileForm.invalid) return;

    this.savingProfile.set(true);
    const data = this.profileForm.value;

    if (!data.name || !data.phone) {
      this.notificationService.error('Nome e telefone são obrigatórios');
      this.savingProfile.set(false);
      return;
    }

    this.authService.updateProfile({
      name: data.name,
      phone: data.phone,
      email: data.email || undefined,
      cpf: data.cpf || undefined,
    }).subscribe({
      next: () => {
        this.notificationService.success('Perfil atualizado com sucesso!');
        this.savingProfile.set(false);
      },
      error: (err) => {
        this.notificationService.error('Erro ao atualizar perfil');
        this.savingProfile.set(false);
        console.error('Update profile error:', err);
      },
    });
  }

  protected toggleAddressForm(): void {
    this.showAddressForm.update((v) => !v);
    if (!this.showAddressForm()) {
      this.addressForm.reset();
    }
  }

  protected onCepBlur(): void {
    const cep = this.addressForm.get('zipCode')?.value?.replace(/\D/g, '');
    if (cep?.length === 8) {
      fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.erro) {
            this.addressForm.patchValue({
              street: data.logradouro,
              neighborhood: data.bairro,
              city: data.localidade,
              state: data.uf,
            });
          }
        })
        .catch((err) => console.error('Error fetching CEP:', err));
    }
  }

  protected saveAddress(): void {
    if (this.addressForm.invalid) return;

    this.savingAddress.set(true);
    const data = this.addressForm.value;

    const street = data.street;
    const number = data.number;
    const neighborhood = data.neighborhood;
    const city = data.city;
    const state = data.state;
    const zipCode = data.zipCode;

    if (!street || !number || !neighborhood || !city || !state || !zipCode) {
      this.notificationService.error('Preencha todos os campos obrigatórios');
      this.savingAddress.set(false);
      return;
    }

    this.authService.addAddress({
      label: data.label || undefined,
      street,
      number,
      complement: data.complement || undefined,
      neighborhood,
      city,
      state,
      zipCode,
      reference: data.reference || undefined,
      isDefault: data.isDefault ?? false,
    }).subscribe({
      next: () => {
        this.notificationService.success('Endereço salvo com sucesso!');
        this.loadAddresses();
        this.toggleAddressForm();
        this.savingAddress.set(false);
      },
      error: (err) => {
        this.notificationService.error('Erro ao salvar endereço');
        this.savingAddress.set(false);
        console.error('Save address error:', err);
      },
    });
  }

  protected deleteAddress(addressId: string): void {
    this.authService.deleteAddress(addressId).subscribe({
      next: () => {
        this.notificationService.success('Endereço removido');
        this.addresses.update((addresses) => addresses.filter((a) => a.id !== addressId));
      },
      error: (err) => {
        this.notificationService.error('Erro ao remover endereço');
        console.error('Delete address error:', err);
      },
    });
  }

  protected logout(): void {
    this.authService.logout();
    this.notificationService.info('Você foi desconectado');
  }
}
