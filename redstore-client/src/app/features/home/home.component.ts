import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CATEGORIES } from '../../data/mock-categories';
import { getDeals, getFeatured, getTrending } from '../../data/mock-products';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/product.model';

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

  categories = CATEGORIES;
  featured = getFeatured(8);
  deals = getDeals(6);
  trending = getTrending(8);

  add(p: Product) {
    this.cart.add(p);
    this.toast.success('Added to cart', p.name);
  }
}
