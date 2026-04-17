import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { getProduct, getProductsByCategory } from '../../data/mock-products';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { RatingComponent } from '../../shared/components/rating/rating.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/product.model';

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
  cart = inject(CartService);
  toast = inject(ToastService);

  private params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  id = computed(() => this.params()?.get('id') ?? '');
  product = computed(() => getProduct(this.id()));

  quantity = signal(1);
  activeImage = signal(0);

  gallery = computed(() => {
    const p = this.product();
    if (!p) return [];
    return p.images?.length ? p.images : [p.image, p.image.replace('w=600', 'w=700'), p.image.replace('w=600', 'w=800')];
  });

  related = computed(() => {
    const p = this.product();
    if (!p) return [];
    return getProductsByCategory(p.category).filter(x => x.id !== p.id).slice(0, 4);
  });

  inc() { this.quantity.update(q => q + 1); }
  dec() { this.quantity.update(q => Math.max(1, q - 1)); }

  addToCart() {
    const p = this.product();
    if (!p) return;
    this.cart.add(p, this.quantity());
    this.toast.success('Added to cart', `${this.quantity()} × ${p.name}`);
  }

  addRelated(p: Product) {
    this.cart.add(p);
    this.toast.success('Added to cart', p.name);
  }
}
