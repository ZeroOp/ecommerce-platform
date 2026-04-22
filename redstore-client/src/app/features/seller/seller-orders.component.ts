import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { BadgeComponent, BadgeTone } from '../../shared/components/badge/badge.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { OrderApi, OrderApiService } from '../../core/services/order-api.service';
import { ToastService } from '../../core/services/toast.service';
import { AnalyticsApiService, AnalyticsSummaryApi } from '../../core/services/analytics-api.service';

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
      <div><strong>{{ summary().pendingCount }}</strong><span>Pending</span></div>
      <div><strong>{{ summary().inProgressCount }}</strong><span>Processing</span></div>
      <div><strong>{{ summary().shippedCount }}</strong><span>Shipped</span></div>
      <div><strong>{{ summary().completedCount }}</strong><span>Delivered</span></div>
      <div><strong>{{ summary().cancelledCount }}</strong><span>Cancelled</span></div>
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
            <td class="actions">
              <button *ngIf="o.rawStatus === 'IN_PROGRESS'" (click)="ship(o.id)">Ship</button>
              <button *ngIf="o.rawStatus !== 'COMPLETED' && o.rawStatus !== 'CANCELLED' && o.rawStatus !== 'EXPIRED'" (click)="cancel(o.id)">Cancel</button>
            </td>
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
    .actions { display: flex; gap: 8px; }
    .actions button { padding: 8px 12px; border-radius: 999px; background: var(--rs-surface-2); font-weight: 600; }
    .actions button:hover { background: var(--rs-surface-3); color: var(--rs-text); }
    @media (max-width: 900px) { .summary { grid-template-columns: repeat(2, 1fr); } }
  `],
})
export class SellerOrdersComponent {
  private orderApi = inject(OrderApiService);
  private analyticsApi = inject(AnalyticsApiService);
  private toast = inject(ToastService);

  tabs = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  tab = signal('All');
  orders = signal<OrderApi[]>([]);
  summary = signal<AnalyticsSummaryApi>({
    totalOrders: 0,
    pendingCount: 0,
    inProgressCount: 0,
    shippedCount: 0,
    completedCount: 0,
    cancelledCount: 0,
    grossRevenue: 0,
  });
  rows = computed(() => {
    const all = this.orders().map((o) => this.fromApi(o));
    if (this.tab() === 'All') return all;
    return all.filter(o => this.statusBucket(o.status) === this.tab());
  });
  constructor() {
    void Promise.all([this.load(), this.loadSummary()]);
  }

  async ship(orderId: string): Promise<void> {
    try {
      await firstValueFrom(this.orderApi.sellerShip(orderId));
      this.toast.success('Order shipped', 'The order has moved to delivered state.');
      await Promise.all([this.load(), this.loadSummary()]);
    } catch {
      this.toast.error('Ship failed', 'Unable to ship this order right now.');
    }
  }

  async cancel(orderId: string): Promise<void> {
    try {
      await firstValueFrom(this.orderApi.sellerCancel(orderId));
      this.toast.success('Order cancelled', 'Cancellation event was published.');
      await Promise.all([this.load(), this.loadSummary()]);
    } catch {
      this.toast.error('Cancel failed', 'Unable to cancel this order right now.');
    }
  }

  private async load(): Promise<void> {
    try {
      this.orders.set(await firstValueFrom(this.orderApi.listSeller()));
    } catch {
      this.orders.set([]);
    }
  }

  private async loadSummary(): Promise<void> {
    try {
      this.summary.set(await firstValueFrom(this.analyticsApi.sellerSummary()));
    } catch {
      this.summary.set({
        totalOrders: this.orders().length,
        pendingCount: this.orders().filter((o) => o.status === 'CREATED').length,
        inProgressCount: this.orders().filter((o) => o.status === 'IN_PROGRESS').length,
        shippedCount: this.orders().filter((o) => o.status === 'SHIPPED').length,
        completedCount: this.orders().filter((o) => o.status === 'COMPLETED').length,
        cancelledCount: this.orders().filter((o) => o.status === 'CANCELLED' || o.status === 'EXPIRED').length,
        grossRevenue: 0,
      });
    }
  }

  private fromApi(o: OrderApi) {
    return {
      id: o.id,
      customer: o.userEmail,
      customerEmail: o.userEmail,
      rawStatus: o.status,
      status: this.friendlyStatus(o.status),
      placedAt: o.createdAt,
      total: Number(o.subtotal ?? 0),
      items: o.items ?? [],
    };
  }

  private statusBucket(s: string): string {
    switch (s) {
      case 'Pending': return 'Pending';
      case 'Processing': return 'Processing';
      case 'Shipped': return 'Shipped';
      case 'Delivered': return 'Delivered';
      case 'Cancelled': return 'Cancelled';
      default: return 'All';
    }
  }

  friendlyStatus(s: string): string {
    switch (s) {
      case 'CREATED': return 'Pending';
      case 'IN_PROGRESS': return 'Processing';
      case 'SHIPPED': return 'Shipped';
      case 'COMPLETED': return 'Delivered';
      case 'CANCELLED':
      case 'EXPIRED': return 'Cancelled';
      default: return s;
    }
  }

  toneFor(s: string): BadgeTone {
    switch (s) {
      case 'Delivered': return 'success';
      case 'Processing': return 'info';
      case 'Pending': return 'warning';
      case 'Cancelled': return 'danger';
      default: return 'neutral';
    }
  }
}
