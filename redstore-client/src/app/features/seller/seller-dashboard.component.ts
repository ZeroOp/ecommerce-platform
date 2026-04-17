import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ORDERS } from '../../data/mock-orders';
import { PRODUCTS } from '../../data/mock-products';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { BadgeComponent, BadgeTone } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'rs-seller-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe, PageHeaderComponent, StatCardComponent, BadgeComponent, ButtonComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <rs-page-header eyebrow="Seller Hub" title="Welcome back, Jane 👋" subtitle="Here's what's happening with your store today.">
      <rs-button variant="secondary"><rs-icon slot="icon" name="download" [size]="16"></rs-icon>Export</rs-button>
      <rs-button variant="primary"><rs-icon slot="icon" name="plus" [size]="16"></rs-icon>Add product</rs-button>
    </rs-page-header>

    <div class="stats">
      <rs-stat-card label="Revenue" value="$42,890" icon="dollar" [delta]="12.6" deltaNote="vs last week" accent="#10b981"></rs-stat-card>
      <rs-stat-card label="Orders" value="328" icon="truck" [delta]="8.2" deltaNote="this week" accent="#6366f1"></rs-stat-card>
      <rs-stat-card label="Products" value="{{ products }}" icon="box" [delta]="4.1" deltaNote="new this week" accent="#f59e0b"></rs-stat-card>
      <rs-stat-card label="Conversion" value="3.8%" icon="chart" [delta]="-1.2" deltaNote="vs last week" accent="#e11d48"></rs-stat-card>
    </div>

    <div class="grid">
      <section class="card chart">
        <header><h3>Sales overview</h3><div class="chart__filters"><button class="is-active">7d</button><button>30d</button><button>90d</button></div></header>
        <div class="chart__plot">
          <svg viewBox="0 0 400 160" preserveAspectRatio="none" width="100%" height="160">
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#f43f5e" stop-opacity="0.35"/>
                <stop offset="1" stop-color="#f43f5e" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <path d="M0,120 C40,80 80,130 120,90 C160,50 200,110 240,70 C280,30 320,90 360,60 L400,50 L400,160 L0,160 Z" fill="url(#g1)"/>
            <path d="M0,120 C40,80 80,130 120,90 C160,50 200,110 240,70 C280,30 320,90 360,60 L400,50" fill="none" stroke="#e11d48" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </div>
        <footer class="chart__foot">
          <div *ngFor="let d of days"><span>{{ d.label }}</span><strong>\${{ d.value }}</strong></div>
        </footer>
      </section>

      <section class="card top">
        <header><h3>Top products</h3></header>
        <ul>
          <li *ngFor="let p of top; let i = index">
            <span class="top__rank">{{ i + 1 }}</span>
            <img [src]="p.image" [alt]="p.name" />
            <div>
              <div class="top__name">{{ p.name }}</div>
              <div class="top__meta">{{ p.reviews }} orders</div>
            </div>
            <strong>\${{ p.price | number: '1.2-2' }}</strong>
          </li>
        </ul>
      </section>

      <section class="card orders">
        <header>
          <h3>Recent orders</h3>
          <a>View all</a>
        </header>
        <table>
          <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            <tr *ngFor="let o of recent">
              <td>#{{ o.id }}</td>
              <td>{{ o.customer }}</td>
              <td>{{ o.items.length }}</td>
              <td>\${{ o.total | number: '1.2-2' }}</td>
              <td><rs-badge [tone]="badgeFor(o.status)" [soft]="true">{{ o.status }}</rs-badge></td>
              <td>{{ o.placedAt | date:'mediumDate' }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 16px;
    }
    .card {
      background: white; border: 1px solid var(--rs-border);
      border-radius: var(--rs-radius-lg); padding: 20px 22px;
      box-shadow: var(--rs-shadow-xs);
      display: flex; flex-direction: column; gap: 14px;
    }
    .card header { display: flex; justify-content: space-between; align-items: center; }
    .card header h3 { font-size: 15px; font-weight: 700; letter-spacing: -0.01em; }
    .chart__filters { display: inline-flex; gap: 4px; padding: 4px; background: var(--rs-surface-2); border-radius: var(--rs-radius-pill); }
    .chart__filters button { padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 600; color: var(--rs-text-muted); }
    .chart__filters button.is-active { background: white; color: var(--rs-text); box-shadow: var(--rs-shadow-xs); }
    .chart__plot { border-radius: var(--rs-radius-md); background: var(--rs-surface-2); padding: 10px; }
    .chart__foot { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
    .chart__foot > div { text-align: center; font-size: 11px; color: var(--rs-text-subtle); }
    .chart__foot strong { display: block; color: var(--rs-text); font-size: 13px; margin-top: 2px; font-weight: 700; }

    .top ul { display: flex; flex-direction: column; gap: 10px; }
    .top li { display: grid; grid-template-columns: 24px 44px 1fr auto; gap: 12px; align-items: center; padding: 6px 0; }
    .top__rank { font-size: 11px; font-weight: 800; color: var(--rs-text-subtle); }
    .top li img { width: 44px; height: 44px; border-radius: 10px; object-fit: cover; background: var(--rs-surface-2); }
    .top__name { font-size: 13px; font-weight: 600; }
    .top__meta { font-size: 11px; color: var(--rs-text-subtle); }

    .orders { grid-column: 1 / -1; padding: 20px 0 10px; }
    .orders header { padding: 0 22px 14px; border-bottom: 1px solid var(--rs-border); }
    .orders header a { font-size: 13px; color: var(--rs-brand-600); font-weight: 600; cursor: pointer; }
    .orders table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .orders th {
      text-align: left; padding: 12px 22px;
      color: var(--rs-text-muted); font-weight: 600;
      font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;
    }
    .orders td { padding: 14px 22px; border-top: 1px solid var(--rs-border); color: var(--rs-text); }
    .orders tr:hover td { background: var(--rs-surface-2); }

    @media (max-width: 1100px) {
      .stats { grid-template-columns: repeat(2, 1fr); }
      .grid { grid-template-columns: 1fr; }
    }
  `],
})
export class SellerDashboardComponent {
  products = PRODUCTS.length;
  top = [...PRODUCTS].sort((a, b) => b.reviews - a.reviews).slice(0, 5);
  recent = ORDERS.slice(0, 6);
  days = [
    { label: 'Mon', value: '2,450' },
    { label: 'Tue', value: '3,120' },
    { label: 'Wed', value: '4,010' },
    { label: 'Thu', value: '5,340' },
    { label: 'Fri', value: '6,200' },
    { label: 'Sat', value: '8,150' },
    { label: 'Sun', value: '7,620' },
  ];

  badgeFor(s: string): BadgeTone {
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
