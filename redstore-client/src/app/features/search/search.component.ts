import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/product.model';
import { mapSearchHitToProduct, SearchApiService } from '../../core/services/search-api.service';
import { InventoryApiService } from '../../core/services/inventory-api.service';
import { enrichWithInventory } from '../../core/services/inventory-enrich';

/**
 * Storefront search page backed by search-service (OpenSearch). Reads `q` from
 * the URL and streams the results straight through the product card grid.
 */
@Component({
  selector: 'rs-search',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="rs-container search">
      <header class="search__head">
        <h1>
          @if (query()) {
            Results for <em>{{ query() }}</em>
          } @else {
            Browse our catalog
          }
        </h1>
        <p class="search__count">{{ products().length }} product{{ products().length === 1 ? '' : 's' }}</p>
      </header>

      @if (products().length === 0) {
        <div class="search__empty">
          <p>No products found{{ query() ? ' for "' + query() + '"' : '' }}.</p>
          <a routerLink="/">Go back home</a>
        </div>
      } @else {
        <div class="search__grid">
          <rs-product-card *ngFor="let p of products()" [product]="p" (add)="add($event)"></rs-product-card>
        </div>
      }
    </section>
  `,
  styles: [`
    .search { padding: 40px 24px; }
    .search__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 24px; }
    .search__head h1 { font-size: clamp(24px, 3vw, 32px); font-weight: 800; letter-spacing: -0.02em; }
    .search__head em { color: var(--rs-brand-600); font-style: normal; }
    .search__count { color: var(--rs-text-subtle); font-size: 14px; }
    .search__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; }
    .search__empty {
      padding: 60px 20px; text-align: center; color: var(--rs-text-subtle);
      border: 1px dashed var(--rs-border); border-radius: var(--rs-radius-lg);
    }
    .search__empty a { color: var(--rs-brand-600); font-weight: 600; }
  `],
})
export class SearchComponent {
  private route = inject(ActivatedRoute);
  private searchApi = inject(SearchApiService);
  private inventoryApi = inject(InventoryApiService);
  cart = inject(CartService);
  toast = inject(ToastService);

  private params = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });
  query = computed(() => (this.params()?.get('q') ?? '').trim());

  private results = toSignal(
    toObservable(this.query).pipe(
      switchMap((q) =>
        this.searchApi.listProducts({ q, limit: 48 }).pipe(
          map((hits) => hits.map(mapSearchHitToProduct)),
          switchMap((list) => enrichWithInventory(list, this.inventoryApi)),
          catchError(() => of([] as Product[])),
        ),
      ),
    ),
    { initialValue: [] as Product[] },
  );

  products = computed(() => this.results());

  add(p: Product) {
    if (p.stockCount != null && p.stockCount <= 0) {
      this.toast.warning('Out of stock', `${p.name} is currently unavailable.`);
      return;
    }
    this.cart.add(p);
    this.toast.success('Added to cart', p.name);
  }
}
