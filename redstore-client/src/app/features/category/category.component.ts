import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CATEGORIES, getCategory } from '../../data/mock-categories';
import { Category } from '../../core/models/product.model';
import { getProductsByCategory } from '../../data/mock-products';
import { BRANDS } from '../../data/mock-brands';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/product.model';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import { CategoryApiService } from '../../core/services/category-api.service';
import { mapProductApiToModel, ProductApiService } from '../../core/services/product-api.service';
import { InventoryApiService } from '../../core/services/inventory-api.service';
import { enrichWithInventory } from '../../core/services/inventory-enrich';

type SortKey = 'featured' | 'priceAsc' | 'priceDesc' | 'rating' | 'newest';

@Component({
  selector: 'rs-category',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent, IconComponent, BadgeComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
})
export class CategoryComponent {
  private route = inject(ActivatedRoute);
  private categoryApi = inject(CategoryApiService);
  private productApi = inject(ProductApiService);
  private inventoryApi = inject(InventoryApiService);
  cart = inject(CartService);
  toast = inject(ToastService);

  private params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  slug = computed(() => this.params()?.get('slug') ?? 'fashion');

  apiCategories = toSignal(this.categoryApi.getCategories(), { initialValue: [] });

  category = computed((): Category => {
    const s = this.slug();
    const api = this.apiCategories().find((c) => c.slug === s);
    const mock = getCategory(s) ?? CATEGORIES[0];
    if (api) {
      return {
        ...mock,
        name: api.name,
        slug: api.slug,
        description: api.description ?? mock.description,
        image: api.iconUrl ?? mock.image,
        icon: mock.icon,
      };
    }
    return mock;
  });

  apiProducts = toSignal(
    toObservable(this.slug).pipe(
      switchMap((slug) =>
        this.productApi.getProducts({ categorySlug: slug, limit: 96 }).pipe(
          map((list) => list.map(mapProductApiToModel)),
          switchMap((list) => enrichWithInventory(list, this.inventoryApi)),
          catchError(() => of([] as Product[])),
        ),
      ),
    ),
    { initialValue: [] },
  );

  allProducts = computed(() => {
    const fromApi = this.apiProducts();
    if (fromApi.length > 0) {
      return fromApi;
    }
    return getProductsByCategory(this.category().slug);
  });

  relatedBrands = computed(() => BRANDS.filter((b) => b.categories.includes(this.category().slug)));

  // filters
  selectedSub = signal<string | null>(null);
  selectedBrand = signal<string | null>(null);
  minPrice = signal<number>(0);
  maxPrice = signal<number>(5000);
  minRating = signal<number>(0);
  sort = signal<SortKey>('featured');
  view = signal<'grid' | 'list'>('grid');

  products = computed(() => {
    let items = this.allProducts();
    if (this.selectedSub()) {
      items = items.filter((p) => p.subCategory === this.selectedSub());
    }
    if (this.selectedBrand()) {
      items = items.filter((p) => p.brand === this.selectedBrand());
    }
    items = items.filter((p) => p.price >= this.minPrice() && p.price <= this.maxPrice());
    items = items.filter((p) => p.rating >= this.minRating());
    const sorted = [...items];
    switch (this.sort()) {
      case 'priceAsc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      default:
        sorted.sort((a, b) => b.reviews - a.reviews);
    }
    return sorted;
  });

  add(p: Product) {
    if (p.stockCount != null && p.stockCount <= 0) {
      this.toast.warning('Out of stock', `${p.name} is currently unavailable.`);
      return;
    }
    this.cart.add(p);
    this.toast.success('Added to cart', p.name);
  }

  resetFilters() {
    this.selectedSub.set(null);
    this.selectedBrand.set(null);
    this.minPrice.set(0);
    this.maxPrice.set(5000);
    this.minRating.set(0);
  }

  onRating(e: Event) {
    this.minRating.set(+(e.target as HTMLInputElement).value);
  }
  onMaxPrice(e: Event) {
    this.maxPrice.set(+(e.target as HTMLInputElement).value);
  }
  onSort(e: Event) {
    this.sort.set((e.target as HTMLSelectElement).value as SortKey);
  }
}
