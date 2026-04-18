import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CATEGORIES } from '../../data/mock-categories';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/product.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { mapProductApiToModel, ProductApiService } from '../../core/services/product-api.service';
import { InventoryApiService } from '../../core/services/inventory-api.service';
import { catchError, map, of, switchMap } from 'rxjs';
import { enrichWithInventory } from '../../core/services/inventory-enrich';

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
  private productApi = inject(ProductApiService);
  private inventoryApi = inject(InventoryApiService);

  categories = CATEGORIES;

  private catalog = toSignal(
    this.productApi.getProducts({ limit: 24 }).pipe(
      map((rows) => rows.map(mapProductApiToModel)),
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

  /** Same catalog as the rest of the page — no mock “deals” products when the API is used. */
  dealsBanner = computed(() => {
    const c = this.catalog();
    if (c.length === 0) return [] as Product[];
    const onSale = c.filter(
      (p) => p.originalPrice != null && p.originalPrice > p.price,
    );
    const pool = onSale.length >= 3 ? onSale : c;
    return pool.slice(0, 3);
  });

  add(p: Product) {
    if (p.stockCount != null && p.stockCount <= 0) {
      this.toast.warning('Out of stock', `${p.name} is currently unavailable.`);
      return;
    }
    this.cart.add(p);
    this.toast.success('Added to cart', p.name);
  }
}
