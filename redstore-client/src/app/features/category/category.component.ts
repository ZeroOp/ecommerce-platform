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
import { CategoryApiService, CategoryApiResponse } from '../../core/services/category-api.service';
import { mapSearchHitToProduct, SearchApiService } from '../../core/services/search-api.service';
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
  private searchApi = inject(SearchApiService);
  private inventoryApi = inject(InventoryApiService);
  cart = inject(CartService);
  toast = inject(ToastService);

  private params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  slug = computed(() => this.params()?.get('slug') ?? 'fashion');

  apiCategories = toSignal(this.categoryApi.getCategories(), { initialValue: [] });

  /** Category row for the active slug (parent or child). */
  private activeApiCategory = computed((): CategoryApiResponse | undefined => {
    const s = this.slug();
    return this.apiCategories().find((c) => c.slug === s);
  });

  /** Direct children in the catalog tree — drives “All / subcategory” chips. */
  childCategories = computed((): CategoryApiResponse[] => {
    const row = this.activeApiCategory();
    if (!row) {
      return [];
    }
    return this.apiCategories()
      .filter((c) => c.parentCategoryId === row.id)
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  category = computed((): Category => {
    const s = this.slug();
    const api = this.activeApiCategory();
    const mock = getCategory(s) ?? CATEGORIES[0];
    if (api) {
      return {
        ...mock,
        id: api.id,
        name: api.name,
        slug: api.slug,
        description: api.description ?? mock.description,
        image: api.iconUrl ?? mock.image,
        icon: api.icon ?? mock.icon,
        subCategories: [],
      };
    }
    return mock;
  });

  /** IDs of the active category + every descendant — drives the search query. */
  private scopeCategoryIds = computed((): string[] => {
    const root = this.activeApiCategory();
    if (!root) {
      return [];
    }
    const all = this.apiCategories();
    const byParent = new Map<string, CategoryApiResponse[]>();
    for (const c of all) {
      const pid = c.parentCategoryId ?? '';
      if (!byParent.has(pid)) {
        byParent.set(pid, []);
      }
      byParent.get(pid)!.push(c);
    }
    const out: string[] = [];
    const stack = [root];
    while (stack.length) {
      const node = stack.pop()!;
      out.push(node.id);
      for (const child of byParent.get(node.id) ?? []) {
        stack.push(child);
      }
    }
    return out;
  });

  apiProducts = toSignal(
    toObservable(this.scopeCategoryIds).pipe(
      switchMap((ids) => {
        if (!ids.length) {
          return of([] as Product[]);
        }
        return this.searchApi.listProducts({ categoryIds: ids, limit: 96 }).pipe(
          map((hits) => hits.map(mapSearchHitToProduct)),
          switchMap((list) => enrichWithInventory(list, this.inventoryApi)),
          catchError(() => of([] as Product[])),
        );
      }),
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

  selectedChildCategoryId = signal<string | null>(null);
  selectedBrand = signal<string | null>(null);
  minPrice = signal<number>(0);
  maxPrice = signal<number>(5000);
  minRating = signal<number>(0);
  sort = signal<SortKey>('featured');
  view = signal<'grid' | 'list'>('grid');

  products = computed(() => {
    let items = this.allProducts();
    const childId = this.selectedChildCategoryId();
    if (childId) {
      items = items.filter((p) => p.categoryId === childId);
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
    this.selectedChildCategoryId.set(null);
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

  toggleChildFilter(id: string) {
    this.selectedChildCategoryId.update((cur) => (cur === id ? null : id));
  }
}
