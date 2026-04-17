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
import { mapProductApiToModel, ProductApiService } from '../../core/services/product-api.service';

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
  private productApi = inject(ProductApiService);
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
        return this.productApi.getProductById(productId).pipe(
          map(mapProductApiToModel),
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
        return this.productApi.getProducts({ categoryId: p.categoryId, limit: 12 }).pipe(
          map((list) =>
            list
              .filter((x) => x.id !== p.id)
              .slice(0, 4)
              .map(mapProductApiToModel),
          ),
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
    this.cart.add(p, this.quantity());
    this.toast.success('Added to cart', `${this.quantity()} × ${p.name}`);
  }

  addRelated(p: Product) {
    this.cart.add(p);
    this.toast.success('Added to cart', p.name);
  }

  categoryLinkSlug(p: Product): string {
    return p.categorySlug ?? p.category.toLowerCase().replace(/\s+/g, '-');
  }
}
