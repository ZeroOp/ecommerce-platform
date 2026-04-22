import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ToastService } from '../../core/services/toast.service';
import { OrderApi, OrderApiService } from '../../core/services/order-api.service';
import { PaymentApi, PaymentApiService } from '../../core/services/payment-api.service';

@Component({
  selector: 'rs-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="rs-container od" *ngIf="order(); else loading">
      <a routerLink="/orders" class="od__back">← My orders</a>
      <header class="od__head">
        <div>
          <h1>Order #{{ order()!.id }}</h1>
          <p>Placed {{ order()!.createdAt | date:'medium' }}</p>
        </div>
        <rs-badge [tone]="statusTone()">{{ statusText() }}</rs-badge>
      </header>

      <div class="od__timer" *ngIf="showTimer()">
        Please complete payment in <strong>{{ timeLeft() }}</strong> or this order will expire.
      </div>

      <article class="od__card">
        <h3>Items</h3>
        <div class="od__row" *ngFor="let it of order()!.items">
          <img [src]="it.imageUrl || ''" [alt]="it.name || 'Product'" />
          <div>
            <div class="od__name">{{ it.name }}</div>
            <div class="od__meta">Qty {{ it.quantity }}</div>
          </div>
          <strong>\${{ it.lineTotal | number:'1.2-2' }}</strong>
        </div>
        <footer class="od__total">Total: <strong>\${{ order()!.subtotal | number:'1.2-2' }}</strong></footer>
      </article>

      <article class="od__card" *ngIf="payment()">
        <h3>Payment</h3>
        <p>Status: <strong>{{ paymentStatusText() }}</strong></p>
        <div class="od__actions">
          <rs-button
            *ngIf="canPay()"
            variant="primary"
            [loading]="paying()"
            (click)="payNow()"
          >
            Pay with Stripe
          </rs-button>
          <button class="od__stripe" *ngIf="canPay()" (click)="openStripeTest()">Open Stripe test portal</button>
        </div>
      </article>
    </section>

    <ng-template #loading>
      <section class="rs-container od"><p>Loading order...</p></section>
    </ng-template>
  `,
  styles: [`
    .od { padding: 28px 24px 56px; display: flex; flex-direction: column; gap: 14px; }
    .od__back { color: var(--rs-text-muted); font-size: 13px; font-weight: 600; width: fit-content; }
    .od__head { display: flex; justify-content: space-between; align-items: flex-start; }
    .od__head h1 { font-size: clamp(24px, 3vw, 34px); font-weight: 800; letter-spacing: -0.03em; }
    .od__head p { color: var(--rs-text-muted); margin-top: 4px; }
    .od__timer { background: #fff4df; color: #7a4e00; border: 1px solid #ffd698; padding: 12px 14px; border-radius: 12px; font-size: 14px; }
    .od__card { background: #fff; border: 1px solid var(--rs-border); border-radius: var(--rs-radius-lg); padding: 18px; display: flex; flex-direction: column; gap: 10px; }
    .od__card h3 { font-size: 16px; font-weight: 700; }
    .od__row { display: grid; grid-template-columns: 52px 1fr auto; gap: 12px; align-items: center; }
    .od__row img { width: 52px; height: 52px; border-radius: 10px; object-fit: cover; background: var(--rs-surface-2); }
    .od__name { font-weight: 600; }
    .od__meta { font-size: 12px; color: var(--rs-text-subtle); }
    .od__total { padding-top: 10px; border-top: 1px solid var(--rs-border); display: flex; justify-content: space-between; font-size: 15px; }
    .od__actions { display: flex; gap: 10px; align-items: center; }
    .od__stripe { padding: 10px 14px; border-radius: 999px; background: #f5f7ff; font-weight: 600; }
  `],
})
export class OrderDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderApi = inject(OrderApiService);
  private paymentApi = inject(PaymentApiService);
  private toast = inject(ToastService);

  order = signal<OrderApi | null>(null);
  payment = signal<PaymentApi | null>(null);
  paying = signal(false);
  private tick = signal(Date.now());
  private timerId: ReturnType<typeof setInterval> | null = null;

  private normalizedPaymentStatus(): string {
    const status = String(this.payment()?.status ?? '');
    if (!status) return '';
    // Be tolerant to malformed status payloads in stale environments.
    return status === 'APID' ? 'PAID' : status;
  }

  canPay = computed(() => {
    const o = this.order();
    const p = this.normalizedPaymentStatus();
    if (!o || !p) return false;
    return o.status === 'CREATED' && p === 'AWAITING_PAYMENT' && this.secondsLeft() > 0;
  });

  showTimer = computed(() => this.order()?.status === 'CREATED'
    && this.normalizedPaymentStatus() === 'AWAITING_PAYMENT'
    && this.secondsLeft() > 0);

  timeLeft = computed(() => {
    const left = this.secondsLeft();
    const m = Math.floor(left / 60).toString().padStart(2, '0');
    const s = Math.floor(left % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  });

  statusText = computed(() => {
    const o = this.order();
    if (!o) return '—';
    const p = this.normalizedPaymentStatus();
    if (o.status === 'CREATED' && p === 'PAID') return 'IN_PROGRESS';
    return o.status;
  });
  statusTone = computed<'info' | 'success' | 'danger'>(() => {
    const s = this.statusText();
    if (s === 'COMPLETED') return 'success';
    if (s === 'CANCELLED' || s === 'EXPIRED') return 'danger';
    return 'info';
  });
  paymentStatusText = computed(() => this.normalizedPaymentStatus() || '—');

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/orders']);
      return;
    }
    await this.load(id);
    this.timerId = setInterval(() => this.tick.set(Date.now()), 1000);
  }

  ngOnDestroy(): void {
    if (this.timerId) clearInterval(this.timerId);
  }

  async payNow(): Promise<void> {
    const o = this.order();
    if (!o) return;
    this.paying.set(true);
    try {
      this.openStripeTest();
      await firstValueFrom(this.paymentApi.confirm(o.id, 'card'));
      this.toast.success('Payment completed', 'Order is now marked as completed.');
      await this.load(o.id);
    } catch {
      this.toast.error('Payment failed', 'Could not confirm payment for this order.');
    } finally {
      this.paying.set(false);
    }
  }

  openStripeTest(): void {
    window.open('https://dashboard.stripe.com/test/payments', '_blank', 'noopener');
  }

  private secondsLeft(): number {
    this.tick();
    const expiry = this.order()?.expiresAt;
    if (!expiry) return 0;
    const secs = Math.floor((new Date(expiry).getTime() - Date.now()) / 1000);
    return Math.max(0, secs);
  }

  private async load(orderId: string): Promise<void> {
    try {
      const [o, p] = await Promise.all([
        firstValueFrom(this.orderApi.getMine(orderId)),
        firstValueFrom(this.paymentApi.byOrder(orderId)),
      ]);
      this.order.set(o);
      this.payment.set(p);
    } catch {
      this.toast.error('Order not available', 'Unable to load this order right now.');
      this.router.navigate(['/orders']);
    }
  }
}
