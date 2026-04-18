import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';

@Component({
  selector: 'rs-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent, ButtonComponent, InputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="rs-container co">
      <a routerLink="/cart" class="co__back"><rs-icon name="chevron-left" [size]="14"></rs-icon> Back to cart</a>
      <h1 class="co__title">Checkout</h1>

      <div class="co__grid">
        <form class="co__form" (submit)="place($event)">
          <section class="co__card">
            <header><h3>1. Contact</h3></header>
            <div class="co__row"><rs-input label="Email" type="email" placeholder="jane@example.com"></rs-input></div>
          </section>

          <section class="co__card">
            <header><h3>2. Shipping address</h3></header>
            <div class="co__row co__row--2">
              <rs-input label="First name" placeholder="Jane"></rs-input>
              <rs-input label="Last name"  placeholder="Doe"></rs-input>
            </div>
            <div class="co__row"><rs-input label="Address" placeholder="Street address"></rs-input></div>
            <div class="co__row co__row--3">
              <rs-input label="City" placeholder="Brooklyn"></rs-input>
              <rs-input label="State" placeholder="NY"></rs-input>
              <rs-input label="ZIP" placeholder="11201"></rs-input>
            </div>
          </section>

          <section class="co__card">
            <header><h3>3. Payment</h3></header>
            <div class="co__pay">
              <label><input type="radio" name="pay" value="card" checked /><span>💳 Card</span></label>
              <label><input type="radio" name="pay" value="upi" /><span>💠 UPI</span></label>
              <label><input type="radio" name="pay" value="paypal" /><span>🅿️ PayPal</span></label>
              <label><input type="radio" name="pay" value="apple" /><span>🍎 Apple Pay</span></label>
            </div>
            <div class="co__row"><rs-input label="Card number" placeholder="1234 5678 9012 3456"></rs-input></div>
            <div class="co__row co__row--2">
              <rs-input label="Expiry" placeholder="MM/YY"></rs-input>
              <rs-input label="CVV" placeholder="•••" type="password"></rs-input>
            </div>
          </section>
        </form>

        <aside class="co__summary">
          <h3>Summary</h3>
          <div class="co__items">
            <div *ngFor="let it of cart.items()" class="co__line">
              <img [src]="it.product.image" [alt]="it.product.name" />
              <div>
                <div class="co__line-name">{{ it.product.name }}</div>
                <div class="co__line-sub">Qty {{ it.quantity }}</div>
              </div>
              <strong>\${{ (it.product.price * it.quantity) | number: '1.2-2' }}</strong>
            </div>
          </div>
          <div class="co__totals">
            <div><span>Subtotal</span><span>\${{ cart.subtotal() | number: '1.2-2' }}</span></div>
            <div><span>Shipping</span><span>{{ shipping() === 0 ? 'Free' : ('$' + (shipping() | number: '1.2-2')) }}</span></div>
            <div><span>Tax</span><span>\${{ tax() | number: '1.2-2' }}</span></div>
          </div>
          <div class="co__total">
            <span>Total</span>
            <strong>\${{ total() | number: '1.2-2' }}</strong>
          </div>
          <rs-button variant="primary" size="lg" [block]="true" [loading]="placing()" (click)="place($event)">
            Place order
          </rs-button>
        </aside>
      </div>
    </section>
  `,
  styles: [`
    .co { padding: 32px 24px 64px; }
    .co__back { display: inline-flex; align-items: center; gap: 4px; color: var(--rs-text-muted); font-size: 13px; font-weight: 600; }
    .co__back:hover { color: var(--rs-text); }
    .co__title { font-size: clamp(28px, 3vw, 38px); font-weight: 800; letter-spacing: -0.03em; margin: 10px 0 24px; }
    .co__grid { display: grid; grid-template-columns: 1fr 380px; gap: 28px; align-items: start; }

    .co__form { display: flex; flex-direction: column; gap: 16px; }
    .co__card {
      background: white; border: 1px solid var(--rs-border);
      border-radius: var(--rs-radius-lg); padding: 24px;
      display: flex; flex-direction: column; gap: 14px;
      box-shadow: var(--rs-shadow-xs);
    }
    .co__card header h3 { font-size: 16px; font-weight: 700; letter-spacing: -0.01em; }
    .co__row { display: flex; gap: 12px; }
    .co__row rs-input { flex: 1; }
    .co__row--2 { display: grid; grid-template-columns: 1fr 1fr; }
    .co__row--3 { display: grid; grid-template-columns: 1.5fr 1fr 1fr; }

    .co__pay { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
    .co__pay label {
      display: inline-flex; align-items: center; justify-content: center;
      padding: 12px; cursor: pointer; font-weight: 600; font-size: 14px;
      border: 1px solid var(--rs-border); border-radius: var(--rs-radius-md);
      background: var(--rs-surface);
      transition: border-color var(--rs-dur-fast) var(--rs-ease), background var(--rs-dur-fast) var(--rs-ease);
    }
    .co__pay label:has(input:checked) { border-color: var(--rs-brand-500); background: var(--rs-brand-50); }
    .co__pay input { display: none; }

    .co__summary {
      position: sticky; top: calc(var(--rs-nav-h) + 20px);
      padding: 24px;
      background: white; border: 1px solid var(--rs-border);
      border-radius: var(--rs-radius-lg); box-shadow: var(--rs-shadow-sm);
      display: flex; flex-direction: column; gap: 14px;
    }
    .co__summary h3 { font-size: 16px; font-weight: 700; }
    .co__items { display: flex; flex-direction: column; gap: 10px; max-height: 280px; overflow-y: auto; }
    .co__line { display: grid; grid-template-columns: 44px 1fr auto; gap: 10px; align-items: center; font-size: 13px; }
    .co__line img { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; }
    .co__line-name { font-weight: 600; font-size: 13px; color: var(--rs-text); }
    .co__line-sub { font-size: 11px; color: var(--rs-text-subtle); }
    .co__totals { display: flex; flex-direction: column; gap: 8px; font-size: 14px; color: var(--rs-text-muted); padding-top: 12px; border-top: 1px solid var(--rs-border); }
    .co__totals > div { display: flex; justify-content: space-between; }
    .co__total { display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid var(--rs-border); }
    .co__total strong { font-size: 22px; font-weight: 800; font-family: var(--rs-font-display); }

    @media (max-width: 900px) {
      .co__grid { grid-template-columns: 1fr; }
      .co__summary { position: static; }
      .co__row--3 { grid-template-columns: 1fr 1fr; }
      .co__pay { grid-template-columns: 1fr 1fr; }
    }
  `],
})
export class CheckoutComponent {
  cart = inject(CartService);
  toast = inject(ToastService);
  private router = inject(Router);

  placing = signal(false);
  shipping = computed(() => this.cart.subtotal() > 50 || this.cart.subtotal() === 0 ? 0 : 6.99);
  tax = computed(() => +(this.cart.subtotal() * 0.08).toFixed(2));
  total = computed(() => +(this.cart.subtotal() + this.shipping() + this.tax()).toFixed(2));

  async place(e: Event) {
    e.preventDefault();
    if (this.cart.items().length === 0) {
      this.toast.warning('Your cart is empty');
      return;
    }
    this.placing.set(true);
    try {
      const result = await this.cart.checkout(false);
      if (result && !result.ok) {
        for (const issue of result.issues) {
          this.toast.error(
            issue.reason === 'OUT_OF_STOCK' ? 'Out of stock' : 'Not enough stock',
            `${issue.name ?? issue.productId}: only ${issue.available} available (you had ${issue.requested}).`,
          );
        }
        return;
      }
      // Local/demo mode returns null — treat that as a successful placeholder.
      if (!result) {
        this.cart.clear();
      }
      this.toast.success('Order placed!', 'We\u2019ll email your confirmation shortly.');
      this.router.navigate(['/orders']);
    } catch (err) {
      this.toast.error('Checkout failed', 'Please try again in a moment.');
    } finally {
      this.placing.set(false);
    }
  }
}
