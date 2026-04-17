import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ORDERS } from '../../data/mock-orders';
import { BadgeComponent, BadgeTone } from '../../shared/components/badge/badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'rs-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, BadgeComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="rs-container orders">
      <header class="orders__head">
        <h1>My orders</h1>
        <p>{{ orders.length }} orders · Track shipments, returns, and more</p>
      </header>

      <div class="orders__tabs">
        <button *ngFor="let t of tabs" [class.is-active]="tab() === t.value" (click)="tab.set(t.value)">
          {{ t.label }}
        </button>
      </div>

      <div class="orders__list" *ngIf="filtered().length; else empty">
        <article *ngFor="let o of filtered()" class="order">
          <header class="order__head">
            <div>
              <div class="order__id">#{{ o.id }}</div>
              <div class="order__date">Placed {{ o.placedAt | date:'mediumDate' }}</div>
            </div>
            <rs-badge [tone]="badgeFor(o.status)" [soft]="true">{{ o.status }}</rs-badge>
          </header>
          <div class="order__items">
            <div *ngFor="let it of o.items" class="order__item">
              <img [src]="it.image" [alt]="it.name" />
              <div>
                <div class="order__item-name">{{ it.name }}</div>
                <div class="order__item-meta">Qty {{ it.quantity }} · \${{ it.price | number: '1.2-2' }}</div>
              </div>
            </div>
          </div>
          <footer class="order__foot">
            <div>
              <div class="order__total-label">Total</div>
              <div class="order__total">\${{ o.total | number: '1.2-2' }}</div>
            </div>
            <div class="order__actions">
              <button>Track order</button>
              <button>Invoice</button>
            </div>
          </footer>
        </article>
      </div>

      <ng-template #empty>
        <rs-empty icon="package" title="No orders yet" message="When you place an order, it will show up here.">
          <a routerLink="/" class="orders__cta">Start shopping</a>
        </rs-empty>
      </ng-template>
    </section>
  `,
  styles: [`
    .orders { padding: 40px 24px; }
    .orders__head h1 { font-size: clamp(28px, 3vw, 36px); font-weight: 800; letter-spacing: -0.03em; }
    .orders__head p { color: var(--rs-text-muted); margin-top: 4px; }
    .orders__tabs { display: flex; gap: 6px; padding: 6px; background: var(--rs-surface-2); border-radius: var(--rs-radius-pill); width: max-content; margin: 20px 0 24px; }
    .orders__tabs button {
      padding: 8px 18px; border-radius: var(--rs-radius-pill);
      font-size: 13px; font-weight: 600; color: var(--rs-text-muted);
    }
    .orders__tabs button.is-active { background: white; color: var(--rs-text); box-shadow: var(--rs-shadow-xs); }

    .orders__list { display: flex; flex-direction: column; gap: 14px; }
    .order {
      background: white; border: 1px solid var(--rs-border);
      border-radius: var(--rs-radius-lg); padding: 18px 20px;
      display: flex; flex-direction: column; gap: 14px;
    }
    .order__head { display: flex; justify-content: space-between; align-items: flex-start; }
    .order__id { font-weight: 700; font-size: 14px; }
    .order__date { font-size: 12px; color: var(--rs-text-subtle); margin-top: 2px; }

    .order__items { display: flex; flex-wrap: wrap; gap: 16px; padding: 14px 0; border-top: 1px solid var(--rs-border); border-bottom: 1px solid var(--rs-border); }
    .order__item { display: flex; gap: 12px; align-items: center; }
    .order__item img { width: 56px; height: 56px; border-radius: 10px; object-fit: cover; background: var(--rs-surface-2); }
    .order__item-name { font-size: 13px; font-weight: 600; color: var(--rs-text); }
    .order__item-meta { font-size: 12px; color: var(--rs-text-subtle); margin-top: 2px; }

    .order__foot { display: flex; justify-content: space-between; align-items: center; }
    .order__total-label { font-size: 12px; color: var(--rs-text-subtle); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; }
    .order__total { font-family: var(--rs-font-display); font-weight: 800; font-size: 20px; }
    .order__actions { display: flex; gap: 8px; }
    .order__actions button {
      padding: 8px 14px; background: var(--rs-surface-2); border-radius: var(--rs-radius-pill); font-size: 13px; font-weight: 600;
    }
    .order__actions button:hover { background: var(--rs-surface-3); }

    .orders__cta { padding: 12px 24px; background: #0a0a0a; color: white; border-radius: var(--rs-radius-pill); font-weight: 600; }
  `],
})
export class OrdersComponent {
  tabs = [
    { label: 'All', value: 'all' as const },
    { label: 'Pending', value: 'pending' as const },
    { label: 'Delivered', value: 'delivered' as const },
    { label: 'Cancelled', value: 'cancelled' as const },
  ];
  tab = signal<'all' | 'pending' | 'delivered' | 'cancelled'>('all');
  orders = ORDERS;

  filtered = () => this.tab() === 'all' ? this.orders : this.orders.filter(o => o.status === this.tab());

  badgeFor(s: string): BadgeTone {
    switch (s) {
      case 'delivered':  return 'success';
      case 'shipped':    return 'info';
      case 'processing': return 'info';
      case 'pending':    return 'warning';
      case 'cancelled':  return 'danger';
      case 'returned':   return 'danger';
      default: return 'neutral';
    }
  }
}
