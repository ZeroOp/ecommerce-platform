import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/product.model';
import { mapSearchHitToProduct, SearchApiService } from '../../core/services/search-api.service';
import { InventoryApiService } from '../../core/services/inventory-api.service';
import { enrichWithInventory } from '../../core/services/inventory-enrich';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import { applyBestDeals, DealApiService } from '../../core/services/deal-api.service';

@Component({
  selector: 'rs-deals',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="rs-container deals">
      <div class="deals__hero">
        <rs-badge tone="brand">Limited time</rs-badge>
        <h1>Mega deals of the week</h1>
        <p>Up to 40% off on hand-picked products across every category. Hurry — stocks are moving fast.</p>
      </div>
      <div class="deals__grid">
        <rs-product-card *ngFor="let p of products()" [product]="p" (add)="add($event)"></rs-product-card>
      </div>
    </section>
  `,
  styles: [
    `
    .deals { padding: 40px 24px; }
    .deals__hero {
      padding: 48px;
      background: var(--rs-gradient-brand);
      color: white;
      border-radius: var(--rs-radius-xl);
      margin-bottom: 32px;
      text-align: center;
      background-image: radial-gradient(at 30% 20%, rgba(255,255,255,.2) 0, transparent 50%),
                        radial-gradient(at 70% 80%, rgba(0,0,0,.2) 0, transparent 50%),
                        var(--rs-gradient-brand);
    }
    .deals__hero h1 { color: white; font-size: clamp(30px, 4vw, 50px); margin-top: 14px; font-weight: 800; letter-spacing: -0.03em; }
    .deals__hero p { margin-top: 12px; max-width: 560px; margin-left: auto; margin-right: auto; font-size: 16px; color: rgba(255,255,255,0.88); }
    .deals__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; }
  `,
  ],
})
export class DealsComponent {
  cart = inject(CartService);
  toast = inject(ToastService);
  private searchApi = inject(SearchApiService);
  private inventoryApi = inject(InventoryApiService);
  private dealApi = inject(DealApiService);

  private catalog = toSignal(
    this.searchApi.listProducts({ limit: 48 }).pipe(
      map((hits) => hits.map(mapSearchHitToProduct)),
      switchMap((list) => enrichWithInventory(list, this.inventoryApi)),
      switchMap((list) => {
        const ids = list.map((p) => p.id);
        if (!ids.length) return of(list);
        return this.dealApi.bestByProducts(ids).pipe(
          map((deals) => applyBestDeals(list, deals)),
          catchError(() => of(list)),
        );
      }),
      catchError(() => of([] as Product[])),
    ),
    { initialValue: [] as Product[] },
  );

  products = computed(() =>
    this.catalog()
      .filter((p) => (p.discount ?? 0) > 0)
      .sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0))
      .slice(0, 24),
  );

  add(p: Product) {
    if (p.stockCount != null && p.stockCount <= 0) {
      this.toast.warning('Out of stock', `${p.name} is currently unavailable.`);
      return;
    }
    this.cart.add(p);
    this.toast.success('Added to cart', p.name);
  }
}
