import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { BadgeComponent, BadgeTone } from '../../shared/components/badge/badge.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { OrderApi, OrderApiService } from '../../core/services/order-api.service';
import { ToastService } from '../../core/services/toast.service';
import { AnalyticsApiService, AnalyticsSummaryApi } from '../../core/services/analytics-api.service';

@Component({
  selector: 'rs-admin-orders',
  standalone: true,
  imports: [CommonModule, DatePipe, BadgeComponent, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <rs-page-header eyebrow="Operations" title="Orders" subtitle="Close or cancel shipped orders."></rs-page-header>
    <div class="summary">
      <div><strong>{{ summary().pendingCount }}</strong><span>Pending</span></div>
      <div><strong>{{ summary().inProgressCount }}</strong><span>In Progress</span></div>
      <div><strong>{{ summary().shippedCount }}</strong><span>Shipped</span></div>
      <div><strong>{{ summary().completedCount }}</strong><span>Closed</span></div>
      <div><strong>{{ summary().cancelledCount }}</strong><span>Cancelled</span></div>
    </div>
    <section class="card">
      <table>
        <thead>
          <tr>
            <th>Order</th>
            <th>Buyer</th>
            <th>Status</th>
            <th>Placed</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let o of rows()">
            <td><strong>#{{ o.id }}</strong></td>
            <td>{{ o.userEmail }}</td>
            <td><rs-badge [tone]="toneFor(o.status)" [soft]="true">{{ friendly(o.status) }}</rs-badge></td>
            <td>{{ o.createdAt | date: 'mediumDate' }}</td>
            <td class="actions">
              <button *ngIf="o.status === 'SHIPPED'" (click)="close(o.id)">Close</button>
              <button *ngIf="o.status !== 'COMPLETED' && o.status !== 'CANCELLED' && o.status !== 'EXPIRED'" (click)="cancel(o.id)">Cancel</button>
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
    .card { background: white; border: 1px solid var(--rs-border); border-radius: var(--rs-radius-lg); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; padding: 14px 20px; color: var(--rs-text-muted); background: var(--rs-surface-2); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; }
    td { padding: 14px 20px; border-top: 1px solid var(--rs-border); }
    tr:hover td { background: var(--rs-surface-2); }
    .actions { display: flex; gap: 8px; }
    .actions button { padding: 8px 12px; border-radius: 999px; background: var(--rs-surface-2); font-weight: 600; }
  `],
})
export class AdminOrdersComponent {
  private orderApi = inject(OrderApiService);
  private analyticsApi = inject(AnalyticsApiService);
  private toast = inject(ToastService);
  rows = signal<OrderApi[]>([]);
  summary = signal<AnalyticsSummaryApi>({
    totalOrders: 0,
    pendingCount: 0,
    inProgressCount: 0,
    shippedCount: 0,
    completedCount: 0,
    cancelledCount: 0,
    grossRevenue: 0,
  });

  constructor() {
    void Promise.all([this.load(), this.loadSummary()]);
  }

  async close(orderId: string): Promise<void> {
    try {
      await firstValueFrom(this.orderApi.adminClose(orderId));
      this.toast.success('Order closed', 'Completion event was published.');
      await Promise.all([this.load(), this.loadSummary()]);
    } catch {
      this.toast.error('Close failed', 'Could not close this order right now.');
    }
  }

  async cancel(orderId: string): Promise<void> {
    try {
      await firstValueFrom(this.orderApi.adminCancel(orderId));
      this.toast.success('Order cancelled', 'Cancellation event was published.');
      await Promise.all([this.load(), this.loadSummary()]);
    } catch {
      this.toast.error('Cancel failed', 'Could not cancel this order right now.');
    }
  }

  private async load(): Promise<void> {
    try {
      this.rows.set(await firstValueFrom(this.orderApi.listAdmin()));
    } catch {
      this.rows.set([]);
    }
  }

  private async loadSummary(): Promise<void> {
    try {
      this.summary.set(await firstValueFrom(this.analyticsApi.adminSummary()));
    } catch {
      this.summary.set({
        totalOrders: this.rows().length,
        pendingCount: this.rows().filter((o) => o.status === 'CREATED').length,
        inProgressCount: this.rows().filter((o) => o.status === 'IN_PROGRESS').length,
        shippedCount: this.rows().filter((o) => o.status === 'SHIPPED').length,
        completedCount: this.rows().filter((o) => o.status === 'COMPLETED').length,
        cancelledCount: this.rows().filter((o) => o.status === 'CANCELLED' || o.status === 'EXPIRED').length,
        grossRevenue: 0,
      });
    }
  }

  friendly(s: string): string {
    switch (s) {
      case 'CREATED': return 'Pending';
      case 'IN_PROGRESS': return 'Shipped';
      case 'SHIPPED': return 'Shipped';
      case 'COMPLETED': return 'Closed';
      case 'CANCELLED':
      case 'EXPIRED': return 'Cancelled';
      default: return s;
    }
  }

  toneFor(s: string): BadgeTone {
    if (s === 'COMPLETED') return 'success';
    if (s === 'CANCELLED' || s === 'EXPIRED') return 'danger';
    if (s === 'IN_PROGRESS' || s === 'SHIPPED') return 'info';
    return 'warning';
  }
}
