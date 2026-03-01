import { ChangeDetectionStrategy, Component, inject, signal, OnInit, computed } from '@angular/core';
import { TuiButton, TuiIcon, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiTabs, TuiBadge } from '@taiga-ui/kit';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../../../../shared/components/layout/layout.component';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';
import { ProductsService, CategoriesService } from '../../../../core/services/products.service';
import { CartService, SelectedModifier } from '../../../../core/services/cart.service';
import { EstablishmentService } from '../../../../core/services/establishment.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Product, Category } from '../../../../core/models/product.model';

@Component({
  selector: 'app-menu-page',
  imports: [
    FormsModule,
    LayoutComponent,
    ProductCardComponent,
    TuiButton,
    TuiIcon,
    TuiLoader,
    TuiTextfield,
    TuiTabs,
    TuiBadge,
  ],
  template: `
    <app-layout>
      <section class="menu-page">
        <header class="menu-header">
          <h1 class="menu-title">Cardápio</h1>
          
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
        </header>

        @if (loading()) {
          <div class="loading-container" role="status" aria-label="Carregando cardápio">
            <tui-loader size="l" />
          </div>
        } @else {
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
        }
      </section>
    </app-layout>
  `,
  styles: [`
    .menu-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .menu-header {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .menu-title {
      font-size: 2rem;
      font-weight: 700;
      color: var(--tui-text-primary);
      margin: 0;
    }

    .search-container {
      max-width: 400px;
    }

    .categories-nav {
      overflow-x: auto;
      padding-bottom: 0.5rem;
    }

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

    @media (max-width: 768px) {
      .menu-title {
        font-size: 1.5rem;
      }

      .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 1rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuPageComponent implements OnInit {
  private productsService = inject(ProductsService);
  private categoriesService = inject(CategoriesService);
  private cartService = inject(CartService);
  private establishmentService = inject(EstablishmentService);
  private notificationService = inject(NotificationService);

  protected loading = signal(true);
  protected categories = signal<Category[]>([]);
  protected allProducts = signal<Product[]>([]);
  protected selectedCategory = signal<Category | null>(null);
  protected selectedCategoryIndex = 0;
  protected searchTerm = '';

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
    this.loadData();
  }

  private loadData(): void {
    const establishmentId = this.establishmentService.getEstablishmentId();
    if (!establishmentId) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);

    this.categoriesService.getByEstablishment(establishmentId).subscribe({
      next: (categories) => {
        this.categories.set(categories.filter((c) => c.isActive));
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      },
    });

    this.productsService.getAll({
      establishmentId,
      isActive: true,
      limit: 100,
    }).subscribe({
      next: (response) => {
        this.allProducts.set(response.data.filter((p) => p.isAvailable));
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.notificationService.error('Erro ao carregar o cardápio');
        this.loading.set(false);
      },
    });
  }

  protected selectCategory(category: Category | null): void {
    this.selectedCategory.set(category);
  }

  protected onSearch(): void {
    // Search is handled by computed signal
  }

  protected clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory.set(null);
    this.selectedCategoryIndex = 0;
  }

  protected getCategoryProductCount(categoryId: string): number {
    return this.allProducts().filter((p) => p.categoryId === categoryId).length;
  }

  protected onAddToCart(product: Product): void {
    const modifiers: SelectedModifier[] = [];
    this.cartService.addItem(product, 1, modifiers);
    this.notificationService.success(`${product.name} adicionado ao carrinho`);
  }
}
