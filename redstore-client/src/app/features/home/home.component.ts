import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CATEGORIES } from '../../data/mock-categories';
import { getDeals } from '../../data/mock-products';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/product.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { mapProductApiToModel, ProductApiService } from '../../core/services/product-api.service';
import { map } from 'rxjs';

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

  categories = CATEGORIES;

  private catalog = toSignal(
    this.productApi.getProducts({ limit: 24 }).pipe(map((rows) => rows.map(mapProductApiToModel))),
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
  deals = getDeals(6);

  add(p: Product) {
    this.cart.add(p);
    this.toast.success('Added to cart', p.name);
  }
}
