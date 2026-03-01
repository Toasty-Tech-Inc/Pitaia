import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TuiButton, TuiIcon, TuiTextfield, TuiLoader } from '@taiga-ui/core';
import { TuiRadioList } from '@taiga-ui/kit';
import { TuiCardLarge } from '@taiga-ui/layout';
import { LayoutComponent } from '../../../../shared/components/layout/layout.component';
import { CartItemComponent } from '../../../../shared/components/cart-item/cart-item.component';
import { CartService } from '../../../../core/services/cart.service';
import { CouponsService } from '../../../../core/services/coupons.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { EstablishmentService } from '../../../../core/services/establishment.service';
import { OrderType } from '../../../../core/models/order.model';

@Component({
  selector: 'app-cart-page',
  imports: [
    RouterLink,
    CurrencyPipe,
    FormsModule,
    LayoutComponent,
    CartItemComponent,
    TuiButton,
    TuiIcon,
    TuiTextfield,
    TuiLoader,
    TuiRadioList,
    TuiCardLarge,
  ],
  template: `
    <app-layout>
      <section class="cart-page">
        <header class="cart-header">
          <h1 class="cart-title">Carrinho</h1>
          @if (items().length > 0) {
            <button 
              tuiButton 
              appearance="flat" 
              size="s"
              (click)="clearCart()"
              aria-label="Limpar carrinho"
            >
              <tui-icon icon="@tui.trash-2" />
              Limpar
            </button>
          }
        </header>

        @if (items().length === 0) {
          <div class="empty-cart" role="status">
            <tui-icon icon="@tui.shopping-cart" class="empty-icon" />
            <h2>Seu carrinho está vazio</h2>
            <p>Adicione produtos do cardápio para continuar.</p>
            <a routerLink="/menu" tuiButton appearance="primary">
              Ver Cardápio
            </a>
          </div>
        } @else {
          <div class="cart-content">
            <div class="cart-items">
              <h2 class="section-title">Itens do pedido</h2>
              <div class="items-list" role="list">
                @for (item of items(); track item.id) {
                  <app-cart-item
                    [item]="item"
                    (quantityChange)="onQuantityChange($event)"
                    (remove)="onRemoveItem($event)"
                  />
                }
              </div>

              <div tuiCardLarge class="order-type-section">
                <h3 class="section-subtitle">Tipo de pedido</h3>
                <tui-radio-list
                  [(ngModel)]="selectedOrderType"
                  (ngModelChange)="onOrderTypeChange($event)"
                  [items]="orderTypeOptions"
                />
              </div>

              <div tuiCardLarge class="coupon-section">
                <h3 class="section-subtitle">Cupom de desconto</h3>
                @if (appliedCoupon()) {
                  <div class="applied-coupon">
                    <div class="coupon-info">
                      <tui-icon icon="@tui.tag" />
                      <span>{{ appliedCoupon()!.code }}</span>
                      <span class="coupon-discount">
                        @if (appliedCoupon()!.discountType === 'PERCENTAGE') {
                          {{ appliedCoupon()!.discountValue }}% OFF
                        } @else {
                          {{ appliedCoupon()!.discountValue | currency: 'BRL' }} OFF
                        }
                      </span>
                    </div>
                    <button 
                      tuiButton 
                      appearance="flat" 
                      size="xs"
                      (click)="removeCoupon()"
                      aria-label="Remover cupom"
                    >
                      <tui-icon icon="@tui.x" />
                    </button>
                  </div>
                } @else {
                  <div class="coupon-form">
                    <tui-textfield>
                      <input
                        tuiTextfield
                        type="text"
                        placeholder="Digite o código do cupom"
                        [(ngModel)]="couponCode"
                        [disabled]="validatingCoupon()"
                        aria-label="Código do cupom"
                      />
                    </tui-textfield>
                    <button
                      tuiButton
                      appearance="outline"
                      [disabled]="!couponCode || validatingCoupon()"
                      (click)="applyCoupon()"
                    >
                      @if (validatingCoupon()) {
                        <tui-loader size="s" />
                      } @else {
                        Aplicar
                      }
                    </button>
                  </div>
                }
              </div>
            </div>

            <aside class="cart-summary" aria-label="Resumo do pedido">
              <div tuiCardLarge class="summary-card">
                <h2 class="summary-title">Resumo</h2>
                
                <div class="summary-lines">
                  <div class="summary-line">
                    <span>Subtotal</span>
                    <span>{{ subtotal() | currency: 'BRL' : 'symbol' : '1.2-2' }}</span>
                  </div>
                  
                  @if (discount() > 0) {
                    <div class="summary-line discount">
                      <span>Desconto</span>
                      <span>-{{ discount() | currency: 'BRL' : 'symbol' : '1.2-2' }}</span>
                    </div>
                  }
                  
                  @if (selectedOrderType === 'DELIVERY' && deliveryFee() > 0) {
                    <div class="summary-line">
                      <span>Taxa de entrega</span>
                      <span>{{ deliveryFee() | currency: 'BRL' : 'symbol' : '1.2-2' }}</span>
                    </div>
                  }
                </div>

                <div class="summary-total">
                  <span>Total</span>
                  <span class="total-value">{{ total() | currency: 'BRL' : 'symbol' : '1.2-2' }}</span>
                </div>

                <button
                  tuiButton
                  appearance="primary"
                  size="l"
                  class="checkout-button"
                  (click)="goToCheckout()"
                >
                  Continuar para pagamento
                </button>

                <a routerLink="/menu" tuiButton appearance="outline" size="m" class="continue-shopping">
                  Continuar comprando
                </a>
              </div>
            </aside>
          </div>
        }
      </section>
    </app-layout>
  `,
  styles: [`
    .cart-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .cart-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .cart-title {
      font-size: 2rem;
      font-weight: 700;
      margin: 0;
    }

    .empty-cart {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
    }

    .empty-icon {
      width: 5rem;
      height: 5rem;
      color: var(--tui-text-tertiary);
      margin-bottom: 1.5rem;
    }

    .empty-cart h2 {
      margin: 0 0 0.5rem;
      color: var(--tui-text-primary);
    }

    .empty-cart p {
      margin: 0 0 1.5rem;
      color: var(--tui-text-secondary);
    }

    .cart-content {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 2rem;
      align-items: start;
    }

    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
    }

    .section-subtitle {
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 1rem;
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .order-type-section,
    .coupon-section {
      padding: 1.25rem;
    }

    .coupon-form {
      display: flex;
      gap: 0.75rem;
    }

    .coupon-form tui-textfield {
      flex: 1;
    }

    .applied-coupon {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      background: var(--tui-status-positive-pale);
      border-radius: 8px;
    }

    .coupon-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--tui-status-positive);
    }

    .coupon-discount {
      font-weight: 600;
    }

    .summary-card {
      padding: 1.5rem;
      position: sticky;
      top: 80px;
    }

    .summary-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 1.5rem;
    }

    .summary-lines {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--tui-border-normal);
    }

    .summary-line {
      display: flex;
      justify-content: space-between;
      color: var(--tui-text-secondary);
    }

    .summary-line.discount {
      color: var(--tui-status-positive);
    }

    .summary-total {
      display: flex;
      justify-content: space-between;
      padding: 1rem 0;
      font-size: 1.125rem;
      font-weight: 600;
    }

    .total-value {
      font-size: 1.5rem;
      color: #FE3867;
    }

    .checkout-button {
      width: 100%;
      margin-bottom: 0.75rem;
    }

    .continue-shopping {
      width: 100%;
    }

    @media (max-width: 1024px) {
      .cart-content {
        grid-template-columns: 1fr;
      }

      .summary-card {
        position: static;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartPageComponent {
  private cartService = inject(CartService);
  private couponsService = inject(CouponsService);
  private establishmentService = inject(EstablishmentService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  protected items = this.cartService.items;
  protected subtotal = this.cartService.subtotal;
  protected discount = this.cartService.discount;
  protected deliveryFee = this.cartService.deliveryFee;
  protected total = this.cartService.total;
  protected appliedCoupon = this.cartService.coupon;

  protected validatingCoupon = signal(false);
  protected couponCode = '';
  protected selectedOrderType: OrderType = OrderType.TAKEOUT;

  protected orderTypeOptions = [
    { label: 'Retirada no local', value: OrderType.TAKEOUT },
    { label: 'Entrega', value: OrderType.DELIVERY },
  ];

  protected onQuantityChange(event: { itemId: string; quantity: number }): void {
    this.cartService.updateQuantity(event.itemId, event.quantity);
  }

  protected onRemoveItem(itemId: string): void {
    this.cartService.removeItem(itemId);
    this.notificationService.info('Item removido do carrinho');
  }

  protected onOrderTypeChange(type: OrderType): void {
    this.cartService.setOrderType(type);
    
    if (type === OrderType.DELIVERY) {
      const settings = this.establishmentService.getDeliverySettings();
      if (settings?.deliveryFee) {
        this.cartService.setDeliveryFee(settings.deliveryFee);
      }
    }
  }

  protected applyCoupon(): void {
    if (!this.couponCode.trim()) return;

    const establishmentId = this.establishmentService.getEstablishmentId();
    if (!establishmentId) return;

    this.validatingCoupon.set(true);

    this.couponsService.validateCoupon(
      this.couponCode.toUpperCase(),
      this.subtotal(),
      establishmentId
    ).subscribe({
      next: (response) => {
        if (response.valid && response.coupon) {
          this.cartService.applyCoupon(response.coupon);
          this.notificationService.success('Cupom aplicado com sucesso!');
          this.couponCode = '';
        } else {
          this.notificationService.error(response.message ?? 'Cupom inválido');
        }
        this.validatingCoupon.set(false);
      },
      error: (err) => {
        this.notificationService.error('Erro ao validar cupom');
        this.validatingCoupon.set(false);
        console.error(err);
      },
    });
  }

  protected removeCoupon(): void {
    this.cartService.removeCoupon();
    this.notificationService.info('Cupom removido');
  }

  protected clearCart(): void {
    this.cartService.clearCart();
    this.notificationService.info('Carrinho limpo');
  }

  protected goToCheckout(): void {
    this.router.navigate(['/checkout']);
  }
}
