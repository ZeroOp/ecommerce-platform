import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/product.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import { InventoryApiService } from '../../core/services/inventory-api.service';
import { enrichWithInventory } from '../../core/services/inventory-enrich';
import { CategoryApiService, CategoryApiResponse } from '../../core/services/category-api.service';
import { mapSearchHitToProduct, SearchApiService } from '../../core/services/search-api.service';

@Component({
  selector: 'rs-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  cart = inject(CartService);
  toast = inject(ToastService);
  private searchApi = inject(SearchApiService);
  private categoryApi = inject(CategoryApiService);
  private inventoryApi = inject(InventoryApiService);

  /** Top-level categories from the catalog API (admin-created parents only). */
  parentCategories = toSignal(
    this.categoryApi.getCategories().pipe(
      map((rows) => rows.filter((c) => !c.parentCategoryId)),
      catchError(() => of([] as CategoryApiResponse[])),
    ),
    { initialValue: [] as CategoryApiResponse[] },
  );

  // Storefront listings are served by search-service — it already returns
  // presigned image URLs and display fields, so no product-service hop is
  // needed on the read path.
  private catalog = toSignal(
    this.searchApi.listProducts({ limit: 24 }).pipe(
      map((hits) => hits.map(mapSearchHitToProduct)),
      switchMap((list) => enrichWithInventory(list, this.inventoryApi)),
      catchError(() => of([] as Product[])),
    ),
    { initialValue: [] as Product[] },
  );

  featured = computed(() => this.catalog().slice(0, 8));
  trending = computed(() => {
    const c = this.catalog();
    if (c.length > 8) {
      return c.slice(8, 16);
    }
    return c.slice(0, 8);
  });

  deals = computed(() => this.catalog().slice(0, 3));

  add(p: Product) {
    if (p.stockCount != null && p.stockCount <= 0) {
      this.toast.warning('Out of stock', `${p.name} is currently unavailable.`);
      return;
    }
    this.cart.add(p);
    this.toast.success('Added to cart', p.name);
  }
}
