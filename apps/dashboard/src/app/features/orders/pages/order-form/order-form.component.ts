import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TuiButton, TuiIcon, TuiAppearance, TuiLoader, TuiTextfield, TuiDataList, TuiDropdown } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { TuiCardLarge } from '@taiga-ui/layout';
import { LayoutComponent } from '../../../../shared/components/layout/layout.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { OrdersService } from '../../../../core/services/orders.service';
import { ProductsService } from '../../../../core/services/products.service';
import { CustomersService } from '../../../../core/services/customers.service';
import { TablesService } from '../../../../core/services/tables.service';
import { CouponsService } from '../../../../core/services/coupons.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Order, OrderType, OrderSource } from '../../../../core/models/order.model';
import { Product } from '../../../../core/models/product.model';
import { Customer } from '../../../../core/models/customer.model';
import { Table, TableStatus } from '../../../../core/models/table.model';
import { Coupon } from '../../../../core/models/coupon.model';

interface OrderItemForm {
  productId: string;
  product: Product | null;
  quantity: number;
  unitPrice: number;
  notes: string;
}

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TuiButton,
    TuiIcon,
    TuiAppearance,
    TuiBadge,
    TuiCardLarge,
    TuiLoader,
    TuiTextfield,
    TuiDataList,
    TuiDropdown,
    LayoutComponent,
    PageHeaderComponent,
  ],
  template: `
    <app-layout>
      <app-page-header
        [breadcrumbs]="['Dashboard', 'Pedidos', 'Novo Pedido']"
        [showSearch]="false"
        [showFilter]="false"
        [showAdd]="false"
      >
        <ng-container actions>
          <button
            tuiButton
            appearance="outline"
            size="m"
            (click)="cancel()"
          >
            Cancelar
          </button>
          <button
            tuiButton
            appearance="primary"
            size="m"
            [disabled]="!form.valid || items().length === 0 || saving()"
            (click)="save()"
          >
            @if (saving()) {
              <tui-loader size="s" />
            } @else {
              <tui-icon icon="@tui.check" />
            }
            Criar Pedido
          </button>
        </ng-container>
      </app-page-header>

      <div class="order-form-container">
        <div class="main-section">
          <!-- Order Type & Source -->
          <div tuiCardLarge tuiAppearance="floating" class="form-card">
            <h3>Tipo do Pedido</h3>
            <div class="type-selector">
              @for (type of orderTypes; track type.value) {
                <button
                  class="type-option"
                  [class.selected]="form.get('type')?.value === type.value"
                  (click)="selectType(type.value)"
                >
                  <tui-icon [icon]="type.icon" />
                  <span>{{ type.label }}</span>
                </button>
              }
            </div>
          </div>

          <!-- Products -->
          <div tuiCardLarge tuiAppearance="floating" class="form-card">
            <div class="card-header">
              <h3>Itens do Pedido</h3>
              <button tuiButton appearance="outline" size="s" (click)="addItem()">
                <tui-icon icon="@tui.plus" />
                Adicionar Item
              </button>
            </div>

            <div class="items-list">
              @for (item of items(); track $index; let i = $index) {
                <div class="item-row">
                  <div class="item-product">
                    <div
                      tuiDropdownOpen
                      [tuiDropdown]="productDropdown"
                      [(tuiDropdownOpen)]="productDropdownOpen[i]"
                    >
                      <button
                        tuiButton
                        appearance="outline"
                        type="button"
                        class="product-select-btn"
                      >
                        {{ item.product?.name || 'Selecionar Produto' }}
                        <tui-icon icon="@tui.chevron-down" />
                      </button>
                    </div>
                    <ng-template #productDropdown>
                      <tui-data-list>
                        @for (product of products(); track product.id) {
                          <button
                            tuiOption
                            (click)="onProductSelect(i, product); productDropdownOpen[i] = false"
                          >
                            {{ product.name }} - {{ product.price | currency:'BRL':'symbol':'1.2-2' }}
                          </button>
                        }
                      </tui-data-list>
                    </ng-template>
                  </div>

                  <div class="item-quantity">
                    <div class="quantity-controls">
                      <button
                        tuiButton
                        appearance="outline"
                        size="xs"
                        (click)="decreaseQuantity(i)"
                        [disabled]="item.quantity <= 1"
                      >
                        <tui-icon icon="@tui.minus" />
                      </button>
                      <span class="quantity-value">{{ item.quantity }}</span>
                      <button
                        tuiButton
                        appearance="outline"
                        size="xs"
                        (click)="increaseQuantity(i)"
                      >
                        <tui-icon icon="@tui.plus" />
                      </button>
                    </div>
                  </div>

                  <div class="item-price">
                    {{ item.unitPrice | currency:'BRL':'symbol':'1.2-2' }}
                  </div>

                  <div class="item-subtotal">
                    {{ (item.quantity * item.unitPrice) | currency:'BRL':'symbol':'1.2-2' }}
                  </div>

                  <button
                    tuiButton
                    appearance="flat"
                    size="xs"
                    class="remove-btn"
                    (click)="removeItem(i)"
                  >
                    <tui-icon icon="@tui.trash-2" />
                  </button>
                </div>
              } @empty {
                <div class="empty-items">
                  <tui-icon icon="@tui.shopping-cart" />
                  <p>Nenhum item adicionado</p>
                  <button tuiButton appearance="outline" size="s" (click)="addItem()">
                    <tui-icon icon="@tui.plus" />
                    Adicionar Primeiro Item
                  </button>
                </div>
              }
            </div>
          </div>

          <!-- Notes -->
          <div tuiCardLarge tuiAppearance="floating" class="form-card">
            <h3>Observações</h3>
            <form [formGroup]="form">
              <div class="form-row">
                <tui-textarea formControlName="notes">
                  Observações do Cliente
                </tui-textarea>
              </div>
              <div class="form-row">
                <tui-textarea formControlName="kitchenNotes">
                  Observações para Cozinha
                </tui-textarea>
              </div>
            </form>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="sidebar-section">
          <!-- Customer -->
          <div tuiCardLarge tuiAppearance="floating" class="form-card">
            <h3>Cliente</h3>
            <div
              tuiDropdownOpen
              [tuiDropdown]="customerDropdown"
              [(tuiDropdownOpen)]="customerDropdownOpen"
            >
              <button
                tuiButton
                appearance="outline"
                type="button"
                class="customer-select-btn"
              >
                {{ selectedCustomer()?.name || 'Selecionar Cliente' }}
                <tui-icon icon="@tui.chevron-down" />
              </button>
            </div>
            <ng-template #customerDropdown>
              <tui-data-list>
                @for (customer of customers(); track customer.id) {
                  <button
                    tuiOption
                    (click)="selectCustomer(customer); customerDropdownOpen = false"
                  >
                    {{ customer.name }} - {{ customer.phone }}
                  </button>
                }
              </tui-data-list>
            </ng-template>

            @if (selectedCustomer()) {
              <div class="selected-customer">
                <div class="customer-avatar">
                  <tui-icon icon="@tui.user" />
                </div>
                <div class="customer-info">
                  <span class="customer-name">{{ selectedCustomer()!.name }}</span>
                  <span class="customer-phone">{{ selectedCustomer()!.phone }}</span>
                </div>
                <button
                  tuiButton
                  appearance="flat"
                  size="xs"
                  (click)="clearCustomer()"
                >
                  <tui-icon icon="@tui.x" />
                </button>
              </div>
            }
          </div>

          <!-- Table (for dine-in) -->
          @if (form.get('type')?.value === OrderType.DINE_IN) {
            <div tuiCardLarge tuiAppearance="floating" class="form-card">
              <h3>Mesa</h3>
              <div class="tables-grid">
                @for (table of availableTables(); track table.id) {
                  <button
                    class="table-btn"
                    [class.selected]="selectedTable()?.id === table.id"
                    (click)="selectTable(table)"
                  >
                    {{ table.location }}
                  </button>
                } @empty {
                  <p class="no-tables">Nenhuma mesa disponível</p>
                }
              </div>
            </div>
          }

          <!-- Delivery Address (for delivery) -->
          @if (form.get('type')?.value === OrderType.DELIVERY && selectedCustomer()) {
            <div tuiCardLarge tuiAppearance="floating" class="form-card">
              <h3>Endereço de Entrega</h3>
              @if (selectedCustomer()!.addresses && selectedCustomer()!.addresses!.length > 0) {
                <div class="address-list">
                  @for (address of selectedCustomer()!.addresses; track address.id) {
                    <button
                      class="address-btn"
                      [class.selected]="selectedAddressId() === address.id"
                      (click)="selectAddress(address.id)"
                    >
                      <tui-icon icon="@tui.map-pin" />
                      <div class="address-text">
                        <span>{{ address.street }}, {{ address.number }}</span>
                        <span class="address-detail">{{ address.neighborhood }} - {{ address.city }}</span>
                      </div>
                    </button>
                  }
                </div>
              } @else {
                <p class="no-address">Cliente não possui endereços cadastrados</p>
              }
            </div>
          }

          <!-- Coupon -->
          <div tuiCardLarge tuiAppearance="floating" class="form-card">
            <h3>Cupom de Desconto</h3>
            <div class="coupon-input">
              <input
                tuiTextfield
                [(ngModel)]="couponCode"
              />
              <button
                tuiButton
                appearance="outline"
                size="m"
                (click)="applyCoupon()"
                [disabled]="!couponCode() || validatingCoupon()"
              >
                @if (validatingCoupon()) {
                  <tui-loader size="s" />
                } @else {
                  Aplicar
                }
              </button>
            </div>

            @if (appliedCoupon()) {
              <div class="applied-coupon">
                <tui-badge appearance="success" value="Cupom aplicado" />
                <span class="coupon-code">{{ appliedCoupon()!.code }}</span>
                <button
                  tuiButton
                  appearance="flat"
                  size="xs"
                  (click)="removeCoupon()"
                >
                  <tui-icon icon="@tui.x" />
                </button>
              </div>
            }
          </div>

          <!-- Order Summary -->
          <div tuiCardLarge tuiAppearance="floating" class="form-card summary-card">
            <h3>Resumo</h3>
            <div class="summary-rows">
              <div class="summary-row">
                <span>Subtotal</span>
                <span>{{ subtotal() | currency:'BRL':'symbol':'1.2-2' }}</span>
              </div>

              @if (discount() > 0) {
                <div class="summary-row discount">
                  <span>Desconto</span>
                  <span>-{{ discount() | currency:'BRL':'symbol':'1.2-2' }}</span>
                </div>
              }

              @if (form.get('type')?.value === OrderType.DELIVERY) {
                <div class="summary-row">
                  <span>Taxa de Entrega</span>
                  <span>{{ deliveryFee() | currency:'BRL':'symbol':'1.2-2' }}</span>
                </div>
              }

              <div class="summary-row total">
                <span>Total</span>
                <span>{{ total() | currency:'BRL':'symbol':'1.2-2' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .order-form-container {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 1.5rem;

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
      }
    }

    .main-section, .sidebar-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-card {
      padding: 1.5rem;
    }

    h3 {
      margin: 0 0 1rem;
      font-size: 1.125rem;
      font-weight: 600;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;

      h3 {
        margin: 0;
      }
    }

    .type-selector {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
    }

    .type-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1.25rem;
      border: 2px solid var(--tui-border-normal);
      border-radius: 12px;
      background: var(--tui-background-base);
      cursor: pointer;
      transition: all 0.2s;

      tui-icon {
        font-size: 1.5rem;
        color: var(--tui-text-secondary);
      }

      span {
        font-weight: 500;
      }

      &:hover {
        border-color: var(--tui-primary);
      }

      &.selected {
        border-color: var(--tui-primary);
        background: rgba(var(--tui-primary-rgb), 0.1);

        tui-icon {
          color: var(--tui-primary);
        }
      }
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .item-row {
      display: grid;
      grid-template-columns: 1fr 120px 100px 100px 40px;
      gap: 1rem;
      align-items: center;
      padding: 1rem;
      background: var(--tui-background-neutral-1);
      border-radius: 8px;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .quantity-value {
      min-width: 32px;
      text-align: center;
      font-weight: 600;
    }

    .item-price, .item-subtotal {
      text-align: right;
      font-weight: 500;
    }

    .item-subtotal {
      font-weight: 700;
    }

    .remove-btn {
      color: var(--tui-status-negative);
    }

    .product-select-btn,
    .customer-select-btn {
      width: 100%;
      justify-content: space-between;
    }

    .empty-items {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem;
      gap: 1rem;
      color: var(--tui-text-secondary);

      tui-icon {
        font-size: 3rem;
      }
    }

    .form-row {
      margin-bottom: 1rem;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .selected-customer {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      margin-top: 1rem;
      background: var(--tui-background-neutral-1);
      border-radius: 8px;
    }

    .customer-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--tui-background-base);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .customer-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .customer-name {
      font-weight: 600;
    }

    .customer-phone {
      font-size: 0.875rem;
      color: var(--tui-text-secondary);
    }

    .tables-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
      gap: 0.5rem;
    }

    .table-btn {
      padding: 0.75rem;
      border: 2px solid var(--tui-border-normal);
      border-radius: 8px;
      background: var(--tui-background-base);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: var(--tui-primary);
      }

      &.selected {
        border-color: var(--tui-primary);
        background: var(--tui-primary);
        color: white;
      }
    }

    .no-tables, .no-address {
      text-align: center;
      color: var(--tui-text-secondary);
      padding: 1rem;
    }

    .address-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .address-btn {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.75rem;
      border: 2px solid var(--tui-border-normal);
      border-radius: 8px;
      background: var(--tui-background-base);
      text-align: left;
      cursor: pointer;
      transition: all 0.2s;

      tui-icon {
        color: var(--tui-text-secondary);
        margin-top: 0.125rem;
      }

      &:hover {
        border-color: var(--tui-primary);
      }

      &.selected {
        border-color: var(--tui-primary);
        background: rgba(var(--tui-primary-rgb), 0.1);

        tui-icon {
          color: var(--tui-primary);
        }
      }
    }

    .address-text {
      display: flex;
      flex-direction: column;
      font-size: 0.875rem;
    }

    .address-detail {
      color: var(--tui-text-secondary);
    }

    .coupon-input {
      display: flex;
      gap: 0.5rem;

      tui-input {
        flex: 1;
      }
    }

    .applied-coupon {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1rem;
      padding: 0.5rem;
      background: rgba(var(--tui-status-positive-rgb), 0.1);
      border-radius: 8px;

      .coupon-code {
        flex: 1;
        font-weight: 600;
      }
    }

    .summary-card {
      position: sticky;
      top: 1rem;
    }

    .summary-rows {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;

      &.discount {
        color: var(--tui-status-positive);
      }

      &.total {
        font-size: 1.25rem;
        font-weight: 700;
        padding-top: 0.75rem;
        border-top: 1px solid var(--tui-border-normal);
        margin-top: 0.5rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private ordersService = inject(OrdersService);
  private productsService = inject(ProductsService);
  private customersService = inject(CustomersService);
  private tablesService = inject(TablesService);
  private couponsService = inject(CouponsService);
  private notificationService = inject(NotificationService);

  protected readonly OrderType = OrderType;

  form: FormGroup;

  // Data signals
  products = signal<Product[]>([]);
  customers = signal<Customer[]>([]);
  availableTables = signal<Table[]>([]);

  // Selection signals
  selectedCustomer = signal<Customer | null>(null);
  selectedTable = signal<Table | null>(null);
  selectedAddressId = signal<string | null>(null);
  couponCode = signal('');
  appliedCoupon = signal<Coupon | null>(null);

  // Items
  items = signal<OrderItemForm[]>([]);

  // UI state
  saving = signal(false);
  validatingCoupon = signal(false);
  
  // Dropdown state
  productDropdownOpen: boolean[] = [];
  customerDropdownOpen = false;

  // Order types options
  orderTypes = [
    { value: OrderType.DINE_IN, label: 'Mesa', icon: '@tui.grid' },
    { value: OrderType.TAKEOUT, label: 'Retirada', icon: '@tui.shopping-bag' },
    { value: OrderType.DELIVERY, label: 'Delivery', icon: '@tui.truck' },
  ];

  // Computed values
  subtotal = computed(() => {
    return this.items().reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  });

  discount = computed(() => {
    const coupon = this.appliedCoupon();
    if (!coupon) return 0;

    if (coupon.discountType === 'PERCENTAGE') {
      return (this.subtotal() * coupon.discountValue) / 100;
    }
    return coupon.discountValue;
  });

  deliveryFee = signal(0);

  total = computed(() => {
    return this.subtotal() - this.discount() + this.deliveryFee();
  });

  constructor() {
    this.form = this.fb.group({
      type: [OrderType.DINE_IN, Validators.required],
      source: [OrderSource.POS],
      notes: [''],
      kitchenNotes: [''],
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCustomers();
    this.loadTables();
  }

  private loadProducts(): void {
    this.productsService.getAll({
      establishmentId: 'current', // TODO: Get from UserService
      isActive: true,
      isAvailable: true,
    }).subscribe({
      next: (response) => {
        this.products.set(response.data);
      },
      error: () => {
        this.notificationService.error('Erro ao carregar produtos');
      },
    });
  }

  private loadCustomers(): void {
    this.customersService.getAll({
      isActive: true,
    }).subscribe({
      next: (response) => {
        this.customers.set(response.data);
      },
      error: () => {
        this.notificationService.error('Erro ao carregar clientes');
      },
    });
  }

  private loadTables(): void {
    this.tablesService.getAll({
      establishmentId: 'current', // TODO: Get from UserService
      status: TableStatus.AVAILABLE,
      isActive: true,
    }).subscribe({
      next: (response) => {
        this.availableTables.set(response.data);
      },
      error: () => {
        this.notificationService.error('Erro ao carregar mesas');
      },
    });
  }

  selectType(type: OrderType): void {
    this.form.patchValue({ type });
    // Reset table if not dine-in
    if (type !== OrderType.DINE_IN) {
      this.selectedTable.set(null);
    }
    // Reset address if not delivery
    if (type !== OrderType.DELIVERY) {
      this.selectedAddressId.set(null);
      this.deliveryFee.set(0);
    } else {
      // Set default delivery fee
      this.deliveryFee.set(5); // TODO: Get from establishment settings
    }
  }

  addItem(): void {
    this.items.update(items => [...items, {
      productId: '',
      product: null,
      quantity: 1,
      unitPrice: 0,
      notes: '',
    }]);
  }

  removeItem(index: number): void {
    this.items.update(items => items.filter((_, i) => i !== index));
  }

  onProductSelect(index: number, product: Product | null): void {
    if (product) {
      this.items.update(items => {
        const updated = [...items];
        updated[index] = {
          ...updated[index],
          productId: product.id,
          product,
          unitPrice: product.price,
        };
        return updated;
      });
    }
  }

  increaseQuantity(index: number): void {
    this.items.update(items => {
      const updated = [...items];
      updated[index] = {
        ...updated[index],
        quantity: updated[index].quantity + 1,
      };
      return updated;
    });
  }

  decreaseQuantity(index: number): void {
    this.items.update(items => {
      const updated = [...items];
      if (updated[index].quantity > 1) {
        updated[index] = {
          ...updated[index],
          quantity: updated[index].quantity - 1,
        };
      }
      return updated;
    });
  }

  selectTable(table: Table): void {
    this.selectedTable.set(table);
  }

  selectAddress(addressId: string): void {
    this.selectedAddressId.set(addressId);
  }

  clearCustomer(): void {
    this.selectedCustomer.set(null);
    this.selectedAddressId.set(null);
  }

  selectCustomer(customer: Customer): void {
    this.selectedCustomer.set(customer);
  }

  applyCoupon(): void {
    const code = this.couponCode();
    if (!code) return;

    this.validatingCoupon.set(true);
    this.couponsService.validateCoupon(code, this.subtotal()).subscribe({
      next: (result) => {
        if (result.valid && result.coupon) {
          this.appliedCoupon.set(result.coupon);
          this.notificationService.success('Cupom aplicado com sucesso!');
        } else {
          this.notificationService.error(result.coupon?.code || 'Cupom inválido');
        }
        this.validatingCoupon.set(false);
      },
      error: () => {
        this.notificationService.error('Erro ao validar cupom');
        this.validatingCoupon.set(false);
      },
    });
  }

  removeCoupon(): void {
    this.appliedCoupon.set(null);
    this.couponCode.set('');
  }

  save(): void {
    if (!this.form.valid || this.items().length === 0) {
      this.notificationService.error('Preencha todos os campos obrigatórios');
      return;
    }

    this.saving.set(true);

    const formValue = this.form.value;
    const orderItems = this.items()
      .filter(item => item.productId)
      .map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        notes: item.notes,
      }));

    const order: Partial<Order> = {
      establishmentId: 'current', // TODO: Get from UserService
      type: formValue.type,
      source: formValue.source,
      customerId: this.selectedCustomer()?.id,
      tableId: this.selectedTable()?.id,
      couponId: this.appliedCoupon()?.id,
      notes: formValue.notes,
      kitchenNotes: formValue.kitchenNotes,
      subtotal: this.subtotal(),
      discount: this.discount(),
      deliveryFee: this.deliveryFee(),
      serviceFee: 0,
      total: this.total(),
      items: orderItems as any,
    };

    if (formValue.type === OrderType.DELIVERY && this.selectedAddressId()) {
      const address = this.selectedCustomer()?.addresses?.find(a => a.id === this.selectedAddressId());
      if (address) {
        order.deliveryAddress = address;
      }
    }

    this.ordersService.create(order).subscribe({
      next: (created) => {
        this.notificationService.success(`Pedido #${created.orderNumber} criado com sucesso!`);
        this.router.navigate(['/orders', created.id]);
      },
      error: () => {
        this.notificationService.error('Erro ao criar pedido');
        this.saving.set(false);
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/orders']);
  }
}
