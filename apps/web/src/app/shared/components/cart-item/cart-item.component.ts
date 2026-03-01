import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { CartItem } from '../../../core/services/cart.service';

@Component({
  selector: 'app-cart-item',
  imports: [CurrencyPipe, TuiButton, TuiIcon],
  template: `
    <article class="cart-item" [attr.aria-label]="'Item: ' + item().product.name">
      <div class="item-image">
        @if (item().product.primaryImage) {
          <img 
            [src]="item().product.primaryImage" 
            [alt]="item().product.name"
            loading="lazy"
          />
        } @else {
          <div class="image-placeholder">
            <tui-icon icon="@tui.image" />
          </div>
        }
      </div>

      <div class="item-details">
        <h4 class="item-name">{{ item().product.name }}</h4>
        
        @if (item().selectedModifiers.length > 0) {
          <p class="item-modifiers">
            @for (modifier of item().selectedModifiers; track modifier.modifierId) {
              <span class="modifier">{{ modifier.modifierName }}: {{ modifier.option.name }}</span>
            }
          </p>
        }

        @if (item().notes) {
          <p class="item-notes">{{ item().notes }}</p>
        }

        <div class="item-price">
          {{ item().unitPrice | currency: 'BRL' : 'symbol' : '1.2-2' }}
        </div>
      </div>

      <div class="item-actions">
        <div class="quantity-controls" role="group" aria-label="Controles de quantidade">
          <button
            tuiButton
            appearance="outline"
            size="xs"
            (click)="onDecrease()"
            [attr.aria-label]="'Diminuir quantidade de ' + item().product.name"
          >
            <tui-icon icon="@tui.minus" />
          </button>
          
          <span class="quantity" aria-live="polite">{{ item().quantity }}</span>
          
          <button
            tuiButton
            appearance="outline"
            size="xs"
            (click)="onIncrease()"
            [attr.aria-label]="'Aumentar quantidade de ' + item().product.name"
          >
            <tui-icon icon="@tui.plus" />
          </button>
        </div>

        <div class="item-total">
          {{ item().total | currency: 'BRL' : 'symbol' : '1.2-2' }}
        </div>

        <button
          tuiButton
          appearance="flat"
          size="xs"
          class="remove-button"
          (click)="onRemove()"
          [attr.aria-label]="'Remover ' + item().product.name + ' do carrinho'"
        >
          <tui-icon icon="@tui.trash-2" />
        </button>
      </div>
    </article>
  `,
  styles: [`
    .cart-item {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      border: 1px solid var(--tui-border-normal);
    }

    .item-image {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      overflow: hidden;
      flex-shrink: 0;
    }

    .item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--tui-background-neutral-1);
      color: var(--tui-text-tertiary);
    }

    .item-details {
      flex: 1;
      min-width: 0;
    }

    .item-name {
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 0.25rem;
      color: var(--tui-text-primary);
    }

    .item-modifiers {
      font-size: 0.75rem;
      color: var(--tui-text-secondary);
      margin: 0 0 0.25rem;
    }

    .modifier {
      display: inline-block;
      margin-right: 0.5rem;
    }

    .item-notes {
      font-size: 0.75rem;
      color: var(--tui-text-tertiary);
      font-style: italic;
      margin: 0 0 0.25rem;
    }

    .item-price {
      font-size: 0.875rem;
      color: var(--tui-text-secondary);
    }

    .item-actions {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .quantity {
      min-width: 2rem;
      text-align: center;
      font-weight: 600;
    }

    .item-total {
      font-size: 1rem;
      font-weight: 700;
      color: #FE3867;
    }

    .remove-button {
      color: var(--tui-status-negative);
    }

    @media (max-width: 480px) {
      .cart-item {
        flex-wrap: wrap;
      }

      .item-actions {
        width: 100%;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartItemComponent {
  item = input.required<CartItem>();
  quantityChange = output<{ itemId: string; quantity: number }>();
  remove = output<string>();

  protected onIncrease(): void {
    this.quantityChange.emit({
      itemId: this.item().id,
      quantity: this.item().quantity + 1,
    });
  }

  protected onDecrease(): void {
    const newQuantity = this.item().quantity - 1;
    if (newQuantity <= 0) {
      this.remove.emit(this.item().id);
    } else {
      this.quantityChange.emit({
        itemId: this.item().id,
        quantity: newQuantity,
      });
    }
  }

  protected onRemove(): void {
    this.remove.emit(this.item().id);
  }
}
