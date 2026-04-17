import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ORDERS } from '../../data/mock-orders';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { BadgeComponent, BadgeTone } from '../../shared/components/badge/badge.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'rs-seller-orders',
  standalone: true,
  imports: [CommonModule, DatePipe, PageHeaderComponent, BadgeComponent, IconComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <rs-page-header eyebrow="Fulfillment" title="Orders" subtitle="Track, ship and manage every order in your pipeline.">
      <rs-button variant="secondary"><rs-icon slot="icon" name="download" [size]="16"></rs-icon>Export</rs-button>
    </rs-page-header>

    <div class="summary">
      <div><strong>{{ counts.pending }}</strong><span>Pending</span></div>
      <div><strong>{{ counts.processing }}</strong><span>Processing</span></div>
      <div><strong>{{ counts.shipped }}</strong><span>Shipped</span></div>
      <div><strong>{{ counts.delivered }}</strong><span>Delivered</span></div>
      <div><strong>{{ counts.cancelled }}</strong><span>Cancelled</span></div>
    </div>

    <div class="tabs">
      <button *ngFor="let t of tabs" [class.is-active]="tab() === t" (click)="tab.set(t)">{{ t }}</button>
    </div>

    <section class="card">
      <table>
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Placed</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let o of rows()">
            <td><strong>#{{ o.id }}</strong></td>
            <td>
              <div class="customer">
                <div class="customer__name">{{ o.customer }}</div>
                <div class="customer__email">{{ o.customerEmail }}</div>
              </div>
            </td>
            <td>{{ o.items.length }}</td>
            <td>\${{ o.total | number: '1.2-2' }}</td>
            <td><rs-badge [tone]="toneFor(o.status)" [soft]="true">{{ o.status }}</rs-badge></td>
            <td>{{ o.placedAt | date: 'mediumDate' }}</td>
            <td class="actions"><button><rs-icon name="more" [size]="16"></rs-icon></button></td>
          </tr>
        </tbody>
      </table>
    </section>
  `,
  styles: [`
    .summary { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; margin-bottom: 18px; }
    .summary > div { background: white; padding: 18px 20px; border: 1px solid var(--rs-border); border-radius: var(--rs-radius-lg); }
    .summary strong { display: block; font-size: 26px; font-weight: 800; font-family: var(--rs-font-display); letter-spacing: -0.03em; }
    .summary span { font-size: 12px; color: var(--rs-text-subtle); text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; }
    .tabs { display: inline-flex; gap: 4px; padding: 4px; background: var(--rs-surface-2); border-radius: var(--rs-radius-pill); margin-bottom: 14px; }
    .tabs button { padding: 8px 16px; font-size: 13px; font-weight: 600; color: var(--rs-text-muted); border-radius: 999px; }
    .tabs button.is-active { background: white; color: var(--rs-text); box-shadow: var(--rs-shadow-xs); }
    .card { background: white; border: 1px solid var(--rs-border); border-radius: var(--rs-radius-lg); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; padding: 14px 20px; color: var(--rs-text-muted); background: var(--rs-surface-2); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; }
    td { padding: 14px 20px; border-top: 1px solid var(--rs-border); }
    tr:hover td { background: var(--rs-surface-2); }
    .customer__name { font-weight: 600; color: var(--rs-text); }
    .customer__email { font-size: 12px; color: var(--rs-text-subtle); }
    .actions button { width: 32px; height: 32px; border-radius: 8px; color: var(--rs-text-subtle); }
    .actions button:hover { background: var(--rs-surface-2); color: var(--rs-text); }
    @media (max-width: 900px) { .summary { grid-template-columns: repeat(2, 1fr); } }
  `],
})
export class SellerOrdersComponent {
  tabs = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  tab = signal('All');
  rows = computed(() => this.tab() === 'All'
    ? ORDERS
    : ORDERS.filter(o => o.status === this.tab().toLowerCase())
  );
  counts = {
    pending: ORDERS.filter(o => o.status === 'pending').length,
    processing: ORDERS.filter(o => o.status === 'processing').length,
    shipped: ORDERS.filter(o => o.status === 'shipped').length,
    delivered: ORDERS.filter(o => o.status === 'delivered').length,
    cancelled: ORDERS.filter(o => o.status === 'cancelled').length,
  };
  toneFor(s: string): BadgeTone {
    switch (s) {
      case 'delivered': return 'success';
      case 'shipped':
      case 'processing': return 'info';
      case 'pending': return 'warning';
      case 'cancelled':
      case 'returned': return 'danger';
      default: return 'neutral';
    }
  }
}
