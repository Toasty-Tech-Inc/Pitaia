import { ChangeDetectionStrategy, Component, inject, signal, OnInit, computed, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { TuiButton, TuiIcon, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiTabs, TuiBadge, TuiAvatar } from '@taiga-ui/kit';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';
import { CartService } from '../../../../core/services/cart.service';
import { EstablishmentService, Establishment } from '../../../../core/services/establishment.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Product, Category } from '../../../../core/models/product.model';

interface EstablishmentWithData extends Establishment {
  categories?: Category[];
  products?: Product[];
}

@Component({
  selector: 'app-store-page',
  imports: [
    FormsModule,
    CurrencyPipe,
    ProductCardComponent,
    TuiButton,
    TuiIcon,
    TuiLoader,
    TuiTextfield,
    TuiTabs,
    TuiBadge,
    TuiAvatar,
  ],
  template: `
    @if (loading()) {
      <div class="loading-container" role="status" aria-label="Carregando loja">
        <tui-loader size="l" />
      </div>
    } @else if (error()) {
      <div class="error-container">
        <tui-icon icon="@tui.alert-circle" class="error-icon" />
        <h1>Estabelecimento não encontrado</h1>
        <p>O estabelecimento que você procura não existe ou está indisponível.</p>
        <button tuiButton appearance="primary" (click)="goHome()">
          Voltar ao início
        </button>
      </div>
    } @else if (establishment()) {
      <div class="store-page">
        <!-- Header do estabelecimento -->
        <header class="store-header">
          @if (establishment()?.coverImage) {
            <div class="cover-image" [style.background-image]="'url(' + establishment()?.coverImage + ')'"></div>
          }
          <div class="store-info">
            <tui-avatar 
              [src]="establishment()?.logo || ''" 
              size="xl"
              class="store-logo"
            />
            <div class="store-details">
              <h1 class="store-name">{{ establishment()?.name }}</h1>
              @if (establishment()?.description) {
                <p class="store-description">{{ establishment()?.description }}</p>
              }
              <div class="store-meta">
                @if (establishment()?.address) {
                  <span class="meta-item">
                    <tui-icon icon="@tui.map-pin" />
                    {{ establishment()?.address?.city }}, {{ establishment()?.address?.state }}
                  </span>
                }
                @if (establishment()?.phone) {
                  <span class="meta-item">
                    <tui-icon icon="@tui.phone" />
                    {{ establishment()?.phone }}
                  </span>
                }
                <span class="status-badge" [class.open]="establishment()?.isOpen">
                  {{ establishment()?.isOpen ? 'Aberto' : 'Fechado' }}
                </span>
              </div>
            </div>
          </div>
        </header>

        <!-- Busca e categorias -->
        <section class="menu-section">
          <div class="search-container">
            <tui-textfield iconStart="@tui.search">
              <input
                tuiTextfield
                type="search"
                placeholder="Buscar produtos..."
                [(ngModel)]="searchTerm"
                (ngModelChange)="onSearch()"
                aria-label="Buscar produtos"
              />
            </tui-textfield>
          </div>

          @if (categories().length > 0) {
            <nav class="categories-nav" aria-label="Categorias">
              <tui-tabs [(activeItemIndex)]="selectedCategoryIndex">
                <button tuiTab (click)="selectCategory(null)">
                  Todos
                  <tui-badge size="s">{{ allProducts().length }}</tui-badge>
                </button>
                @for (category of categories(); track category.id) {
                  <button tuiTab (click)="selectCategory(category)">
                    {{ category.name }}
                    <tui-badge size="s">{{ getCategoryProductCount(category.id) }}</tui-badge>
                  </button>
                }
              </tui-tabs>
            </nav>
          }

          @if (filteredProducts().length > 0) {
            <div class="products-grid" role="list" aria-label="Lista de produtos">
              @for (product of filteredProducts(); track product.id) {
                <app-product-card
                  [product]="product"
                  (addToCart)="onAddToCart($event)"
                />
              }
            </div>
          } @else {
            <div class="empty-state" role="status">
              <tui-icon icon="@tui.search" class="empty-icon" />
              <h2>Nenhum produto encontrado</h2>
              <p>Tente buscar por outro termo ou selecione outra categoria.</p>
              <button tuiButton appearance="outline" (click)="clearFilters()">
                Limpar filtros
              </button>
            </div>
          }
        </section>

        <!-- Carrinho flutuante -->
        @if (cartItemsCount() > 0) {
          <div class="floating-cart">
            <button tuiButton appearance="primary" size="l" (click)="goToCart()">
              <tui-icon icon="@tui.shopping-cart" />
              Ver carrinho ({{ cartItemsCount() }}) - {{ cartTotal() | currency: 'BRL' }}
            </button>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .loading-container,
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 2rem;
      text-align: center;
    }

    .error-icon {
      width: 4rem;
      height: 4rem;
      color: var(--tui-status-negative);
      margin-bottom: 1rem;
    }

    .error-container h1 {
      margin: 0 0 0.5rem;
    }

    .error-container p {
      margin: 0 0 1.5rem;
      color: var(--tui-text-secondary);
    }

    .store-page {
      min-height: 100vh;
      background: var(--tui-background-base);
    }

    .store-header {
      position: relative;
      background: var(--tui-background-base-alt);
    }

    .cover-image {
      height: 200px;
      background-size: cover;
      background-position: center;
    }

    .store-info {
      display: flex;
      gap: 1.5rem;
      padding: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .store-logo {
      margin-top: -3rem;
      border: 4px solid var(--tui-background-base);
      border-radius: 50%;
      flex-shrink: 0;
    }

    .store-details {
      flex: 1;
    }

    .store-name {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0 0 0.5rem;
      color: var(--tui-text-primary);
    }

    .store-description {
      margin: 0 0 0.75rem;
      color: var(--tui-text-secondary);
      line-height: 1.5;
    }

    .store-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: center;
      font-size: 0.875rem;
      color: var(--tui-text-secondary);
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .meta-item tui-icon {
      width: 1rem;
      height: 1rem;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-weight: 500;
      font-size: 0.75rem;
      background: var(--tui-status-negative-pale);
      color: var(--tui-status-negative);
    }

    .status-badge.open {
      background: var(--tui-status-positive-pale);
      color: var(--tui-status-positive);
    }

    .menu-section {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1.5rem;
    }

    .search-container {
      max-width: 400px;
      margin-bottom: 1.5rem;
    }

    .categories-nav {
      overflow-x: auto;
      padding-bottom: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
      color: var(--tui-text-secondary);
    }

    .empty-icon {
      width: 4rem;
      height: 4rem;
      margin-bottom: 1rem;
      color: var(--tui-text-tertiary);
    }

    .empty-state h2 {
      margin: 0 0 0.5rem;
      color: var(--tui-text-primary);
    }

    .empty-state p {
      margin: 0 0 1.5rem;
    }

    .floating-cart {
      position: fixed;
      bottom: 1.5rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 100;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      border-radius: 2rem;
    }

    @media (max-width: 768px) {
      .store-info {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .store-logo {
        margin-top: -2.5rem;
      }

      .store-meta {
        justify-content: center;
      }

      .store-name {
        font-size: 1.5rem;
      }

      .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 1rem;
      }

      .menu-section {
        padding: 1rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorePageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cartService = inject(CartService);
  private establishmentService = inject(EstablishmentService);
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  protected loading = signal(true);
  protected error = signal(false);
  protected establishment = signal<EstablishmentWithData | null>(null);
  protected categories = signal<Category[]>([]);
  protected allProducts = signal<Product[]>([]);
  protected selectedCategory = signal<Category | null>(null);
  protected selectedCategoryIndex = 0;
  protected searchTerm = '';

  protected cartItemsCount = this.cartService.itemCount;
  protected cartTotal = this.cartService.total;

  protected filteredProducts = computed(() => {
    let products = this.allProducts();
    const category = this.selectedCategory();
    const search = this.searchTerm.toLowerCase().trim();

    if (category) {
      products = products.filter((p) => p.categoryId === category.id);
    }

    if (search) {
      products = products.filter((p) =>
        p.name.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search) ||
        p.tags?.some((t) => t.toLowerCase().includes(search))
      );
    }

    return products;
  });

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const slug = params['slug'];
      if (slug) {
        this.loadStore(slug);
      } else {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadStore(slug: string): void {
    this.loading.set(true);
    this.error.set(false);

    this.establishmentService.loadEstablishmentBySlug(slug).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (establishment) => {
        const data = establishment as EstablishmentWithData;
        this.establishment.set(data);
        this.categories.set(data.categories ?? []);
        this.allProducts.set(data.products ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  selectCategory(category: Category | null): void {
    this.selectedCategory.set(category);
    this.selectedCategoryIndex = category 
      ? this.categories().findIndex((c) => c.id === category.id) + 1
      : 0;
  }

  getCategoryProductCount(categoryId: string): number {
    return this.allProducts().filter((p) => p.categoryId === categoryId).length;
  }

  onSearch(): void {
    // O computed signal filteredProducts já cuida da filtragem
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory.set(null);
    this.selectedCategoryIndex = 0;
  }

  onAddToCart(product: Product): void {
    this.cartService.addItem(product, 1);
    this.notificationService.success(
      `${product.name} adicionado ao carrinho`,
      'Carrinho'
    );
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
