import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe, TuiButton, TuiIcon, TuiBadge],
  template: `
    <article 
      class="product-card"
      [class.unavailable]="!product().isAvailable"
      role="article"
      [attr.aria-label]="'Produto: ' + product().name"
    >
      <div class="product-image-container">
        @if (product().primaryImage) {
          <img 
            [src]="product().primaryImage" 
            [alt]="product().name"
            class="product-image"
            loading="lazy"
          />
        } @else {
          <div class="product-image-placeholder">
            <tui-icon icon="@tui.image" />
          </div>
        }
        @if (product().isFeatured) {
          <tui-badge appearance="warning" class="featured-badge">
            Destaque
          </tui-badge>
        }
        @if (!product().isAvailable) {
          <div class="unavailable-overlay">
            <span>Indisponível</span>
          </div>
        }
      </div>

      <div class="product-content">
        <h3 class="product-name">{{ product().name }}</h3>
        @if (product().description) {
          <p class="product-description">{{ product().description }}</p>
        }
        
        <div class="product-footer">
          <span class="product-price">
            {{ product().price | currency: 'BRL' : 'symbol' : '1.2-2' }}
          </span>
          
          <button
            tuiButton
            appearance="primary"
            size="s"
            [disabled]="!product().isAvailable"
            (click)="onAddClick()"
            aria-label="Adicionar ao carrinho"
          >
            <tui-icon icon="@tui.plus" />
            Adicionar
          </button>
        </div>
      </div>
    </article>
  `,
  styles: [`
    .product-card {
      display: flex;
      flex-direction: column;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      transition: transform 0.2s, box-shadow 0.2s;
      height: 100%;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .product-card.unavailable {
      opacity: 0.7;
    }

    .product-image-container {
      position: relative;
      aspect-ratio: 4 / 3;
      overflow: hidden;
    }

    .product-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-image-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--tui-background-neutral-1);
      color: var(--tui-text-tertiary);
    }

    .product-image-placeholder tui-icon {
      width: 3rem;
      height: 3rem;
    }

    .featured-badge {
      position: absolute;
      top: 0.75rem;
      left: 0.75rem;
    }

    .unavailable-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.5);
      color: white;
      font-weight: 600;
    }

    .product-content {
      display: flex;
      flex-direction: column;
      flex: 1;
      padding: 1rem;
      gap: 0.5rem;
    }

    .product-name {
      font-size: 1rem;
      font-weight: 600;
      color: var(--tui-text-primary);
      margin: 0;
      line-height: 1.3;
    }

    .product-description {
      font-size: 0.875rem;
      color: var(--tui-text-secondary);
      margin: 0;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .product-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
      padding-top: 0.75rem;
      gap: 0.5rem;
    }

    .product-price {
      font-size: 1.125rem;
      font-weight: 700;
      color: #FE3867;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  product = input.required<Product>();
  addToCart = output<Product>();

  protected onAddClick(): void {
    this.addToCart.emit(this.product());
  }
}
