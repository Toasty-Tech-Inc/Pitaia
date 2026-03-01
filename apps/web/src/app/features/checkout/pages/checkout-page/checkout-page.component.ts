import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { TuiButton, TuiIcon, TuiTextfield, TuiLoader } from '@taiga-ui/core';
import { TuiRadioList, TuiStepper } from '@taiga-ui/kit';
import { TuiCardLarge } from '@taiga-ui/layout';
import { LayoutComponent } from '../../../../shared/components/layout/layout.component';
import { CartService } from '../../../../core/services/cart.service';
import { OrdersService, CreateOrderDto } from '../../../../core/services/orders.service';
import { AuthService } from '../../../../core/services/auth.service';
import { EstablishmentService } from '../../../../core/services/establishment.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { OrderType, OrderSource, PaymentType, CustomerAddress } from '../../../../core/models/order.model';

@Component({
  selector: 'app-checkout-page',
  imports: [
    RouterLink,
    CurrencyPipe,
    ReactiveFormsModule,
    FormsModule,
    LayoutComponent,
    TuiButton,
    TuiIcon,
    TuiTextfield,
    TuiLoader,
    TuiRadioList,
    TuiStepper,
    TuiCardLarge,
  ],
  template: `
    <app-layout>
      <section class="checkout-page">
        <header class="checkout-header">
          <a routerLink="/cart" class="back-link" aria-label="Voltar ao carrinho">
            <tui-icon icon="@tui.arrow-left" />
          </a>
          <h1 class="checkout-title">Finalizar Pedido</h1>
        </header>

        @if (cartEmpty()) {
          <div class="empty-checkout" role="alert">
            <tui-icon icon="@tui.shopping-cart" class="empty-icon" />
            <h2>Carrinho vazio</h2>
            <p>Adicione produtos antes de finalizar o pedido.</p>
            <a routerLink="/menu" tuiButton appearance="primary">
              Ver Cardápio
            </a>
          </div>
        } @else {
          <tui-stepper [(activeItemIndex)]="currentStep">
            <button tuiStep>Dados</button>
            @if (orderType() === 'DELIVERY') {
              <button tuiStep>Endereço</button>
            }
            <button tuiStep>Pagamento</button>
            <button tuiStep>Confirmação</button>
          </tui-stepper>

          <div class="checkout-content">
            <div class="checkout-form">
              <!-- Step 1: Customer Data -->
              @if (currentStep === 0) {
                <div tuiCardLarge class="form-section">
                  <h2 class="section-title">Seus dados</h2>
                  
                  @if (isAuthenticated()) {
                    <div class="logged-user">
                      <tui-icon icon="@tui.user-check" />
                      <div>
                        <strong>{{ customer()?.name }}</strong>
                        <span>{{ customer()?.phone }}</span>
                      </div>
                    </div>
                  } @else {
                    <form [formGroup]="customerForm" class="customer-form">
                      <tui-textfield>
                        <label tuiLabel for="customer-name">Nome completo</label>
                        <input id="customer-name" tuiTextfield formControlName="name" />
                      </tui-textfield>

                      <tui-textfield>
                        <label tuiLabel for="customer-phone">Telefone</label>
                        <input id="customer-phone" tuiTextfield formControlName="phone" type="tel" />
                      </tui-textfield>

                      <tui-textfield>
                        <label tuiLabel for="customer-email">E-mail (opcional)</label>
                        <input id="customer-email" tuiTextfield formControlName="email" type="email" />
                      </tui-textfield>
                    </form>

                    <div class="login-prompt">
                      <span>Já tem cadastro?</span>
                      <a routerLink="/login" tuiButton appearance="flat" size="s">
                        Fazer login
                      </a>
                    </div>
                  }

                  <div class="form-actions">
                    <button
                      tuiButton
                      appearance="primary"
                      [disabled]="!canProceedFromStep0()"
                      (click)="nextStep()"
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              }

              <!-- Step 2: Address (Delivery only) -->
              @if (currentStep === 1 && orderType() === 'DELIVERY') {
                <div tuiCardLarge class="form-section">
                  <h2 class="section-title">Endereço de entrega</h2>

                  @if (savedAddresses().length > 0) {
                    <div class="saved-addresses">
                      <h3 class="subsection-title">Endereços salvos</h3>
                      <tui-radio-list
                        [(ngModel)]="selectedAddressId"
                        [items]="addressOptions()"
                      />
                    </div>
                  }

                  <details class="new-address-toggle">
                    <summary>Usar outro endereço</summary>
                    <form [formGroup]="addressForm" class="address-form">
                      <tui-textfield>
                        <label tuiLabel for="addr-zipcode">CEP</label>
                        <input id="addr-zipcode" tuiTextfield formControlName="zipCode" (blur)="onCepBlur()" />
                      </tui-textfield>

                      <div class="form-row">
                        <tui-textfield class="flex-2">
                          <label tuiLabel for="addr-street">Rua</label>
                          <input id="addr-street" tuiTextfield formControlName="street" />
                        </tui-textfield>
                        <tui-textfield class="flex-1">
                          <label tuiLabel for="addr-number">Número</label>
                          <input id="addr-number" tuiTextfield formControlName="number" />
                        </tui-textfield>
                      </div>

                      <tui-textfield>
                        <label tuiLabel for="addr-complement">Complemento</label>
                        <input id="addr-complement" tuiTextfield formControlName="complement" />
                      </tui-textfield>

                      <tui-textfield>
                        <label tuiLabel for="addr-neighborhood">Bairro</label>
                        <input id="addr-neighborhood" tuiTextfield formControlName="neighborhood" />
                      </tui-textfield>

                      <div class="form-row">
                        <tui-textfield class="flex-2">
                          <label tuiLabel for="addr-city">Cidade</label>
                          <input id="addr-city" tuiTextfield formControlName="city" />
                        </tui-textfield>
                        <tui-textfield class="flex-1">
                          <label tuiLabel for="addr-state">Estado</label>
                          <input id="addr-state" tuiTextfield formControlName="state" maxlength="2" />
                        </tui-textfield>
                      </div>

                      <tui-textfield>
                        <label tuiLabel for="addr-reference">Referência</label>
                        <input id="addr-reference" tuiTextfield formControlName="reference" />
                      </tui-textfield>
                    </form>
                  </details>

                  <div class="form-actions">
                    <button tuiButton appearance="outline" (click)="prevStep()">
                      Voltar
                    </button>
                    <button
                      tuiButton
                      appearance="primary"
                      [disabled]="!canProceedFromStep1()"
                      (click)="nextStep()"
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              }

              <!-- Step: Payment -->
              @if (currentStep === paymentStepIndex()) {
                <div tuiCardLarge class="form-section">
                  <h2 class="section-title">Forma de pagamento</h2>

                  <tui-radio-list
                    [(ngModel)]="selectedPaymentMethod"
                    [items]="paymentOptions"
                  />

                  @if (selectedPaymentMethod === 'CASH') {
                    <div class="change-section">
                      <tui-textfield>
                        <label tuiLabel for="change-amount">Troco para quanto?</label>
                        <input 
                          id="change-amount"
                          tuiTextfield 
                          type="number" 
                          [(ngModel)]="changeAmount"
                          placeholder="Deixe em branco se não precisar de troco"
                        />
                      </tui-textfield>
                    </div>
                  }

                  <div class="form-actions">
                    <button tuiButton appearance="outline" (click)="prevStep()">
                      Voltar
                    </button>
                    <button
                      tuiButton
                      appearance="primary"
                      [disabled]="!selectedPaymentMethod"
                      (click)="nextStep()"
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              }

              <!-- Step: Confirmation -->
              @if (currentStep === confirmationStepIndex()) {
                <div tuiCardLarge class="form-section">
                  <h2 class="section-title">Confirme seu pedido</h2>

                  <div class="order-summary">
                    <div class="summary-section">
                      <h3>Itens</h3>
                      @for (item of items(); track item.id) {
                        <div class="summary-item">
                          <span>{{ item.quantity }}x {{ item.product.name }}</span>
                          <span>{{ item.total | currency: 'BRL' }}</span>
                        </div>
                      }
                    </div>

                    <div class="summary-section">
                      <h3>Entrega</h3>
                      <p>
                        @if (orderType() === 'DELIVERY') {
                          {{ getDeliveryAddressText() }}
                        } @else {
                          Retirada no local
                        }
                      </p>
                    </div>

                    <div class="summary-section">
                      <h3>Pagamento</h3>
                      <p>{{ getPaymentMethodText() }}</p>
                    </div>
                  </div>

                  <tui-textfield>
                    <label tuiLabel for="order-notes">Observações do pedido (opcional)</label>
                    <input id="order-notes" tuiTextfield [(ngModel)]="orderNotes" />
                  </tui-textfield>

                  <div class="form-actions">
                    <button tuiButton appearance="outline" (click)="prevStep()">
                      Voltar
                    </button>
                    <button
                      tuiButton
                      appearance="primary"
                      size="l"
                      [disabled]="submitting()"
                      (click)="submitOrder()"
                    >
                      @if (submitting()) {
                        <tui-loader size="s" />
                        Enviando...
                      } @else {
                        Confirmar Pedido - {{ total() | currency: 'BRL' }}
                      }
                    </button>
                  </div>
                </div>
              }
            </div>

            <aside class="order-summary-sidebar">
              <div tuiCardLarge>
                <h3>Resumo</h3>
                <div class="summary-lines">
                  <div class="line">
                    <span>Subtotal ({{ itemCount() }} itens)</span>
                    <span>{{ subtotal() | currency: 'BRL' }}</span>
                  </div>
                  @if (discount() > 0) {
                    <div class="line discount">
                      <span>Desconto</span>
                      <span>-{{ discount() | currency: 'BRL' }}</span>
                    </div>
                  }
                  @if (orderType() === 'DELIVERY') {
                    <div class="line">
                      <span>Entrega</span>
                      <span>{{ deliveryFee() | currency: 'BRL' }}</span>
                    </div>
                  }
                </div>
                <div class="total-line">
                  <span>Total</span>
                  <span class="total-value">{{ total() | currency: 'BRL' }}</span>
                </div>
              </div>
            </aside>
          </div>
        }
      </section>
    </app-layout>
  `,
  styles: [`
    .checkout-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .checkout-header {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .back-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      background: var(--tui-background-neutral-1);
      color: var(--tui-text-secondary);
      transition: background 0.2s;
    }

    .back-link:hover {
      background: var(--tui-background-neutral-2);
    }

    .checkout-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
    }

    .empty-checkout {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 4rem 2rem;
      text-align: center;
    }

    .empty-icon {
      width: 4rem;
      height: 4rem;
      color: var(--tui-text-tertiary);
      margin-bottom: 1rem;
    }

    .checkout-content {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 2rem;
      align-items: start;
    }

    .form-section {
      padding: 1.5rem;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 1.5rem;
    }

    .subsection-title {
      font-size: 1rem;
      font-weight: 500;
      margin: 0 0 1rem;
    }

    .logged-user {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: var(--tui-status-positive-pale);
      border-radius: 8px;
      color: var(--tui-status-positive);
    }

    .logged-user div {
      display: flex;
      flex-direction: column;
    }

    .customer-form,
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

    .login-prompt {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--tui-border-normal);
      color: var(--tui-text-secondary);
    }

    .new-address-toggle {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--tui-border-normal);
    }

    .new-address-toggle summary {
      cursor: pointer;
      color: var(--tui-text-action);
      font-weight: 500;
      margin-bottom: 1rem;
    }

    .change-section {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--tui-border-normal);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--tui-border-normal);
    }

    .order-summary {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .summary-section h3 {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--tui-text-secondary);
      margin: 0 0 0.5rem;
      text-transform: uppercase;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      padding: 0.25rem 0;
    }

    .order-summary-sidebar {
      position: sticky;
      top: 80px;
    }

    .order-summary-sidebar h3 {
      margin: 0 0 1rem;
      font-size: 1.125rem;
    }

    .summary-lines {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--tui-border-normal);
    }

    .line {
      display: flex;
      justify-content: space-between;
      color: var(--tui-text-secondary);
      font-size: 0.875rem;
    }

    .line.discount {
      color: var(--tui-status-positive);
    }

    .total-line {
      display: flex;
      justify-content: space-between;
      padding-top: 1rem;
      font-weight: 600;
    }

    .total-value {
      font-size: 1.25rem;
      color: #FE3867;
    }

    @media (max-width: 1024px) {
      .checkout-content {
        grid-template-columns: 1fr;
      }

      .order-summary-sidebar {
        position: static;
        order: -1;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private cartService = inject(CartService);
  private ordersService = inject(OrdersService);
  private authService = inject(AuthService);
  private establishmentService = inject(EstablishmentService);
  private notificationService = inject(NotificationService);

  protected items = this.cartService.items;
  protected itemCount = this.cartService.itemCount;
  protected subtotal = this.cartService.subtotal;
  protected discount = this.cartService.discount;
  protected deliveryFee = this.cartService.deliveryFee;
  protected total = this.cartService.total;
  protected orderType = this.cartService.orderType;
  protected coupon = this.cartService.coupon;

  protected isAuthenticated = this.authService.isAuthenticated;
  protected customer = this.authService.customer;

  protected currentStep = 0;
  protected submitting = signal(false);
  protected savedAddresses = signal<CustomerAddress[]>([]);
  protected selectedAddressId: string | null = null;
  protected selectedPaymentMethod: PaymentType | null = null;
  protected changeAmount: number | null = null;
  protected orderNotes = '';

  protected cartEmpty = computed(() => this.items().length === 0);

  protected paymentStepIndex = computed(() => 
    this.orderType() === OrderType.DELIVERY ? 2 : 1
  );

  protected confirmationStepIndex = computed(() => 
    this.orderType() === OrderType.DELIVERY ? 3 : 2
  );

  protected addressOptions = computed(() =>
    this.savedAddresses().map((addr) => ({
      label: `${addr.street}, ${addr.number} - ${addr.neighborhood}`,
      value: addr.id,
    }))
  );

  protected paymentOptions = [
    { label: 'PIX', value: PaymentType.PIX },
    { label: 'Cartão de Crédito', value: PaymentType.CREDIT_CARD },
    { label: 'Cartão de Débito', value: PaymentType.DEBIT_CARD },
    { label: 'Dinheiro', value: PaymentType.CASH },
  ];

  protected customerForm = this.fb.group({
    name: ['', Validators.required],
    phone: ['', Validators.required],
    email: [''],
  });

  protected addressForm = this.fb.group({
    zipCode: ['', Validators.required],
    street: ['', Validators.required],
    number: ['', Validators.required],
    complement: [''],
    neighborhood: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
    reference: [''],
  });

  ngOnInit(): void {
    if (this.isAuthenticated()) {
      this.loadSavedAddresses();
    }
  }

  private loadSavedAddresses(): void {
    this.authService.getAddresses().subscribe({
      next: (addresses) => {
        this.savedAddresses.set(addresses);
        const defaultAddr = addresses.find((a) => a.isDefault);
        if (defaultAddr) {
          this.selectedAddressId = defaultAddr.id;
        }
      },
      error: (err) => console.error('Error loading addresses:', err),
    });
  }

  protected canProceedFromStep0(): boolean {
    return this.isAuthenticated() || this.customerForm.valid;
  }

  protected canProceedFromStep1(): boolean {
    return !!this.selectedAddressId || this.addressForm.valid;
  }

  protected nextStep(): void {
    const maxStep = this.orderType() === OrderType.DELIVERY ? 3 : 2;
    if (this.currentStep < maxStep) {
      this.currentStep++;
    }
  }

  protected prevStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
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

  protected getDeliveryAddressText(): string {
    if (this.selectedAddressId) {
      const addr = this.savedAddresses().find((a) => a.id === this.selectedAddressId);
      if (addr) {
        return `${addr.street}, ${addr.number} - ${addr.neighborhood}, ${addr.city}/${addr.state}`;
      }
    }
    const form = this.addressForm.value;
    return `${form.street}, ${form.number} - ${form.neighborhood}, ${form.city}/${form.state}`;
  }

  protected getPaymentMethodText(): string {
    const method = this.paymentOptions.find((p) => p.value === this.selectedPaymentMethod);
    return method?.label ?? '';
  }

  protected submitOrder(): void {
    const establishmentId = this.establishmentService.getEstablishmentId();
    if (!establishmentId) {
      this.notificationService.error('Estabelecimento não encontrado');
      return;
    }

    this.submitting.set(true);

    // Se não estiver autenticado, primeiro cria o cliente
    if (!this.isAuthenticated() && this.customerForm.valid) {
      const { name, phone, email } = this.customerForm.value;
      
      if (!name || !phone) {
        this.notificationService.error('Nome e telefone são obrigatórios');
        this.submitting.set(false);
        return;
      }

      this.authService.register({
        name,
        phone,
        email: email ?? undefined,
      }).subscribe({
        next: (customer) => {
          this.createOrder(establishmentId, customer.id);
        },
        error: (err) => {
          // Se o cliente já existe (telefone duplicado), tenta buscar e continuar
          if (err.status === 409) {
            this.notificationService.warning('Este telefone já está cadastrado. Faça login para continuar.');
            this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
          } else {
            this.notificationService.error('Erro ao criar cadastro. Tente novamente.');
          }
          this.submitting.set(false);
          console.error('Error creating customer:', err);
        },
      });
    } else {
      this.createOrder(establishmentId, this.customer()?.id);
    }
  }

  private createOrder(establishmentId: string, customerId?: string): void {
    const orderData: CreateOrderDto = {
      establishmentId,
      customerId,
      type: this.orderType(),
      source: OrderSource.ONLINE,
      notes: this.orderNotes || undefined,
      couponCode: this.coupon()?.code,
      items: this.items().map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        notes: item.notes,
        modifiers: item.selectedModifiers.map((m) => ({
          modifierId: m.modifierId,
          optionId: m.option.id,
        })),
      })),
      payments: [{
        paymentMethodId: this.selectedPaymentMethod ?? PaymentType.PIX,
        amount: this.total(),
      }],
    };

    if (this.orderType() === OrderType.DELIVERY) {
      if (this.selectedAddressId) {
        const addr = this.savedAddresses().find((a) => a.id === this.selectedAddressId);
        if (addr) {
          orderData.deliveryAddress = {
            street: addr.street,
            number: addr.number,
            complement: addr.complement,
            neighborhood: addr.neighborhood,
            city: addr.city,
            state: addr.state,
            zipCode: addr.zipCode,
            reference: addr.reference,
          };
        }
      } else if (this.addressForm.valid) {
        const form = this.addressForm.value;
        if (form.street && form.number && form.neighborhood && form.city && form.state && form.zipCode) {
          orderData.deliveryAddress = {
            street: form.street,
            number: form.number,
            complement: form.complement ?? undefined,
            neighborhood: form.neighborhood,
            city: form.city,
            state: form.state,
            zipCode: form.zipCode,
            reference: form.reference ?? undefined,
          };
        }
      }
    }

    this.ordersService.create(orderData).subscribe({
      next: (order) => {
        this.cartService.clearCart();
        this.notificationService.success('Pedido realizado com sucesso!');
        // Se não estiver autenticado, vai para página de confirmação pública
        if (this.isAuthenticated()) {
          this.router.navigate(['/orders', order.id]);
        } else {
          this.router.navigate(['/order-confirmation', order.id]);
        }
      },
      error: (err) => {
        this.notificationService.error('Erro ao criar pedido. Tente novamente.');
        this.submitting.set(false);
        console.error('Error creating order:', err);
      },
    });
  }
}
