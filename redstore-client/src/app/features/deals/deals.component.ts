import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getDeals } from '../../data/mock-products';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/product.model';

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
        <rs-product-card *ngFor="let p of deals" [product]="p" (add)="add($event)"></rs-product-card>
      </div>
    </section>
  `,
  styles: [`
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
  `],
})
export class DealsComponent {
  cart = inject(CartService);
  toast = inject(ToastService);
  deals = getDeals(20);
  add(p: Product) { this.cart.add(p); this.toast.success('Added to cart', p.name); }
}
