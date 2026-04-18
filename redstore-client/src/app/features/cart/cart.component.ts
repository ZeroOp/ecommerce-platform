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

  inc(id: string, q: number, available?: number) {
    if (available != null && q + 1 > available) {
      this.toast.warning('Stock limit', `Only ${available} unit(s) in stock.`);
      return;
    }
    this.cart.update(id, q + 1);
  }
  dec(id: string, q: number) { this.cart.update(id, q - 1); }
  remove(id: string) {
    this.cart.remove(id);
    this.toast.info('Removed from cart');
  }

  /** Checkout is blocked client-side if any line exceeds available stock. */
  async checkout() {
    if (this.cart.hasStockIssue()) {
      this.toast.error(
        'Stock issue',
        'Some items exceed the available quantity — please adjust or remove them.',
      );
      return;
    }
    // Run a dry-run against inventory through the cart-service so we catch
    // any race (someone else reserved the last unit) before the user sees
    // the payment form.
    const result = await this.cart.checkout(true).catch(() => null);
    if (result && !result.ok) {
      for (const issue of result.issues) {
        this.toast.error(
          issue.reason === 'OUT_OF_STOCK' ? 'Out of stock' : 'Not enough stock',
          `${issue.name ?? issue.productId}: only ${issue.available} available (you have ${issue.requested}).`,
        );
      }
      return;
    }
    this.router.navigate(['/checkout']);
  }
}
