import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'rs-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent, ButtonComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent {
  cart = inject(CartService);
  toast = inject(ToastService);
  private router = inject(Router);

  shipping = computed(() => this.cart.subtotal() > 50 || this.cart.subtotal() === 0 ? 0 : 6.99);
  tax = computed(() => +(this.cart.subtotal() * 0.08).toFixed(2));
  total = computed(() => +(this.cart.subtotal() + this.shipping() + this.tax()).toFixed(2));

  inc(id: string, q: number) { this.cart.update(id, q + 1); }
  dec(id: string, q: number) { this.cart.update(id, q - 1); }
  remove(id: string) { this.cart.remove(id); this.toast.info('Removed from cart'); }

  checkout() { this.router.navigate(['/checkout']); }
}
