import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { RatingComponent } from '../../shared/components/rating/rating.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/product.model';
import { mapSearchHitToProduct, SearchApiService } from '../../core/services/search-api.service';
import { InventoryApiService } from '../../core/services/inventory-api.service';
import { enrichWithInventory, applyQuantities } from '../../core/services/inventory-enrich';
import { applyBestDeals, DealApiService } from '../../core/services/deal-api.service';

@Component({
  selector: 'rs-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent, BadgeComponent, RatingComponent, ButtonComponent, ProductCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent {
  private route = inject(ActivatedRoute);
  private searchApi = inject(SearchApiService);
  private inventoryApi = inject(InventoryApiService);
  private dealApi = inject(DealApiService);
  cart = inject(CartService);
  toast = inject(ToastService);

  private params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  id = computed(() => this.params()?.get('id') ?? '');

  product = toSignal(
    toObservable(this.id).pipe(
      switchMap((productId) => {
        if (!productId) {
          return of(null);
        }
        return this.searchApi.getById(productId).pipe(
          map(mapSearchHitToProduct),
          switchMap((p) =>
            this.inventoryApi.getBatchQuantities([p.id]).pipe(
              map((qs) => applyQuantities([p], qs)[0]),
              catchError(() => of(p)),
            ),
          ),
          switchMap((p) =>
            this.dealApi.bestByProducts([p.id]).pipe(
              map((deals) => applyBestDeals([p], deals)[0]),
              catchError(() => of(p)),
            ),
          ),
          catchError(() => of(null)),
        );
      }),
    ),
    { initialValue: undefined },
  );

  related = toSignal(
    toObservable(this.product).pipe(
      switchMap((p) => {
        if (!p?.categoryId || !p.id) {
          return of([] as Product[]);
        }
        return this.searchApi.listProducts({ categoryId: p.categoryId, limit: 12 }).pipe(
          map((hits) => hits.map(mapSearchHitToProduct).filter((x) => x.id !== p.id).slice(0, 4)),
          switchMap((list) => enrichWithInventory(list, this.inventoryApi)),
          switchMap((list) => {
            const ids = list.map((x) => x.id);
            if (!ids.length) return of(list);
            return this.dealApi.bestByProducts(ids).pipe(
              map((deals) => applyBestDeals(list, deals)),
              catchError(() => of(list)),
            );
          }),
          catchError(() => of([] as Product[])),
        );
      }),
    ),
    { initialValue: [] },
  );

  quantity = signal(1);
  activeImage = signal(0);

  gallery = computed(() => {
    const p = this.product();
    if (!p) {
      return [];
    }
    return p.images?.length ? p.images : [p.image];
  });

  inc() {
    this.quantity.update((q) => q + 1);
  }
  dec() {
    this.quantity.update((q) => Math.max(1, q - 1));
  }

  addToCart() {
    const p = this.product();
    if (!p) {
      return;
    }
    if (p.stockCount != null && p.stockCount <= 0) {
      this.toast.warning('Out of stock', `${p.name} is currently unavailable.`);
      return;
    }
    const q = this.quantity();
    if (p.stockCount != null && q > p.stockCount) {
      this.toast.warning(
        'Not enough stock',
        `Only ${p.stockCount} left — please lower the quantity.`,
      );
      return;
    }
    this.cart.add(p, q);
    this.toast.success('Added to cart', `${q} × ${p.name}`);
  }

  addRelated(p: Product) {
    if (p.stockCount != null && p.stockCount <= 0) {
      this.toast.warning('Out of stock', `${p.name} is currently unavailable.`);
      return;
    }
    this.cart.add(p);
    this.toast.success('Added to cart', p.name);
  }

  categoryLinkSlug(p: Product): string {
    return p.categorySlug ?? p.category.toLowerCase().replace(/\s+/g, '-');
  }
}
