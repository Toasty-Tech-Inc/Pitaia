import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiButton, TuiIcon, TuiLoader } from '@taiga-ui/core';
import { TuiCardLarge } from '@taiga-ui/layout';
import { LayoutComponent } from '../../../../shared/components/layout/layout.component';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';
import { ProductsService, CategoriesService } from '../../../../core/services/products.service';
import { CartService, SelectedModifier } from '../../../../core/services/cart.service';
import { EstablishmentService } from '../../../../core/services/establishment.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Product, Category } from '../../../../core/models/product.model';

@Component({
  selector: 'app-home-page',
  imports: [
    RouterLink,
    LayoutComponent,
    ProductCardComponent,
    TuiButton,
    TuiIcon,
    TuiLoader,
    TuiCardLarge,
  ],
  template: `
    <app-layout>
      <section class="home-page">
        <!-- Hero Section -->
        <div class="hero-section">
          <div class="hero-content">
            <h1 class="hero-title">
              Bem-vindo ao
              <span class="highlight">{{ establishmentName() }}</span>
            </h1>
            <p class="hero-subtitle">
              Faça seu pedido online e receba no conforto da sua casa ou retire no local.
            </p>
            <div class="hero-actions">
              <a routerLink="/menu" tuiButton appearance="primary" size="l">
                Ver Cardápio
                <tui-icon icon="@tui.arrow-right" />
              </a>
            </div>
          </div>
          @if (establishment()?.coverImage) {
            <div class="hero-image">
              <img [src]="establishment()!.coverImage" [alt]="establishmentName()" />
            </div>
          }
        </div>

        <!-- Features Section -->
        <div class="features-section">
          <div tuiCardLarge class="feature-card">
            <tui-icon icon="@tui.clock" class="feature-icon" />
            <h3>Rápido</h3>
            <p>Pedido pronto em minutos</p>
          </div>
          <div tuiCardLarge class="feature-card">
            <tui-icon icon="@tui.truck" class="feature-icon" />
            <h3>Entrega</h3>
            <p>Receba em casa</p>
          </div>
          <div tuiCardLarge class="feature-card">
            <tui-icon icon="@tui.credit-card" class="feature-icon" />
            <h3>Pagamento fácil</h3>
            <p>PIX, cartão ou dinheiro</p>
          </div>
          <div tuiCardLarge class="feature-card">
            <tui-icon icon="@tui.star" class="feature-icon" />
            <h3>Qualidade</h3>
            <p>Ingredientes selecionados</p>
          </div>
        </div>

        <!-- Categories Section -->
        @if (categories().length > 0) {
          <section class="categories-section" aria-labelledby="categories-title">
            <header class="section-header">
              <h2 id="categories-title">Categorias</h2>
              <a routerLink="/menu" tuiButton appearance="flat">
                Ver todas
                <tui-icon icon="@tui.arrow-right" />
              </a>
            </header>
            <div class="categories-grid" role="list">
              @for (category of categories(); track category.id) {
                <a 
                  [routerLink]="['/menu']" 
                  [queryParams]="{ category: category.id }"
                  class="category-card"
                  role="listitem"
                >
                  @if (category.image) {
                    <img [src]="category.image" [alt]="category.name" class="category-image" />
                  } @else {
                    <div class="category-image-placeholder">
                      <tui-icon icon="@tui.grid" />
                    </div>
                  }
                  <span class="category-name">{{ category.name }}</span>
                </a>
              }
            </div>
          </section>
        }

        <!-- Featured Products Section -->
        @if (loading()) {
          <div class="loading-container" role="status">
            <tui-loader size="l" />
          </div>
        } @else if (featuredProducts().length > 0) {
          <section class="featured-section" aria-labelledby="featured-title">
            <header class="section-header">
              <h2 id="featured-title">
                <tui-icon icon="@tui.star" />
                Destaques
              </h2>
              <a routerLink="/menu" tuiButton appearance="flat">
                Ver cardápio completo
                <tui-icon icon="@tui.arrow-right" />
              </a>
            </header>
            <div class="products-grid" role="list">
              @for (product of featuredProducts(); track product.id) {
                <app-product-card
                  [product]="product"
                  (addToCart)="onAddToCart($event)"
                />
              }
            </div>
          </section>
        }

        <!-- CTA Section -->
        <div tuiCardLarge class="cta-section">
          <div class="cta-content">
            <h2>Pronto para pedir?</h2>
            <p>Confira nosso cardápio completo e faça seu pedido agora mesmo.</p>
            <a routerLink="/menu" tuiButton appearance="primary" size="l">
              Fazer Pedido
            </a>
          </div>
        </div>
      </section>
    </app-layout>
  `,
  styles: [`
    .home-page {
      display: flex;
      flex-direction: column;
      gap: 3rem;
    }

    /* Hero Section */
    .hero-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      align-items: center;
      padding: 2rem 0;
    }

    .hero-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .hero-title {
      font-size: 2.5rem;
      font-weight: 800;
      line-height: 1.2;
      margin: 0;
      color: var(--tui-text-primary);
    }

    .hero-title .highlight {
      color: #FE3867;
    }

    .hero-subtitle {
      font-size: 1.125rem;
      color: var(--tui-text-secondary);
      margin: 0;
      line-height: 1.6;
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
    }

    .hero-image {
      border-radius: 16px;
      overflow: hidden;
      aspect-ratio: 4 / 3;
    }

    .hero-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* Features Section */
    .features-section {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }

    .feature-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 1.5rem;
      gap: 0.75rem;
    }

    .feature-icon {
      width: 2.5rem;
      height: 2.5rem;
      color: #FE3867;
    }

    .feature-card h3 {
      font-size: 1rem;
      font-weight: 600;
      margin: 0;
    }

    .feature-card p {
      font-size: 0.875rem;
      color: var(--tui-text-secondary);
      margin: 0;
    }

    /* Section Header */
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .section-header h2 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
    }

    .section-header h2 tui-icon {
      color: #FE3867;
    }

    /* Categories Grid */
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 1rem;
    }

    .category-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      text-decoration: none;
      color: inherit;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .category-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .category-image {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      object-fit: cover;
    }

    .category-image-placeholder {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--tui-background-neutral-1);
      color: var(--tui-text-tertiary);
    }

    .category-name {
      font-weight: 500;
      font-size: 0.875rem;
      text-align: center;
    }

    /* Products Grid */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 4rem;
    }

    /* CTA Section */
    .cta-section {
      padding: 3rem;
      text-align: center;
      background: linear-gradient(135deg, #FE3867 0%, #FF6B9D 100%);
      color: white;
    }

    .cta-content {
      max-width: 500px;
      margin: 0 auto;
    }

    .cta-content h2 {
      font-size: 1.75rem;
      margin: 0 0 0.75rem;
    }

    .cta-content p {
      margin: 0 0 1.5rem;
      opacity: 0.9;
    }

    @media (max-width: 1024px) {
      .features-section {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .hero-section {
        grid-template-columns: 1fr;
        text-align: center;
      }

      .hero-title {
        font-size: 2rem;
      }

      .hero-actions {
        justify-content: center;
      }

      .hero-image {
        order: -1;
      }

      .features-section {
        grid-template-columns: repeat(2, 1fr);
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .products-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent implements OnInit {
  private productsService = inject(ProductsService);
  private categoriesService = inject(CategoriesService);
  private cartService = inject(CartService);
  private establishmentService = inject(EstablishmentService);
  private notificationService = inject(NotificationService);

  protected loading = signal(true);
  protected featuredProducts = signal<Product[]>([]);
  protected categories = signal<Category[]>([]);
  protected establishment = this.establishmentService.establishment;
  protected establishmentName = () => this.establishment()?.name ?? 'Pitaia';

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    const establishmentId = this.establishmentService.getEstablishmentId();
    if (!establishmentId) {
      this.loading.set(false);
      return;
    }

    this.categoriesService.getByEstablishment(establishmentId).subscribe({
      next: (categories) => {
        this.categories.set(categories.filter((c) => c.isActive).slice(0, 6));
      },
      error: (err) => console.error('Error loading categories:', err),
    });

    this.productsService.getFeatured(establishmentId).subscribe({
      next: (products) => {
        this.featuredProducts.set(products.slice(0, 6));
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading featured products:', err);
        this.loading.set(false);
      },
    });
  }

  protected onAddToCart(product: Product): void {
    const modifiers: SelectedModifier[] = [];
    this.cartService.addItem(product, 1, modifiers);
    this.notificationService.success(`${product.name} adicionado ao carrinho`);
  }
}
