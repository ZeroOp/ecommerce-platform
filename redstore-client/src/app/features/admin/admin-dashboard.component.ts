import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { BadgeComponent, BadgeTone } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ORDERS } from '../../data/mock-orders';
import { ADMIN_USERS } from '../../data/mock-users';

@Component({
  selector: 'rs-admin-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe, PageHeaderComponent, StatCardComponent, BadgeComponent, ButtonComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <rs-page-header eyebrow="Admin Console" title="Platform overview" subtitle="High-level pulse across all sellers, users and orders.">
      <rs-button variant="secondary"><rs-icon slot="icon" name="download" [size]="16"></rs-icon>Export</rs-button>
    </rs-page-header>

    <div class="stats">
      <rs-stat-card label="Total revenue" value="$2.84M"  icon="dollar"  [delta]="22.4" accent="#e11d48"></rs-stat-card>
      <rs-stat-card label="Active users"  value="48,392"  icon="users"   [delta]="12.1" accent="#6366f1"></rs-stat-card>
      <rs-stat-card label="Sellers"       value="1,284"   icon="shield"  [delta]="3.2"  accent="#10b981"></rs-stat-card>
      <rs-stat-card label="Orders today"  value="3,492"   icon="truck"   [delta]="6.8"  accent="#f59e0b"></rs-stat-card>
    </div>

    <div class="grid">
      <section class="card chart">
        <header><h3>Platform growth</h3></header>
        <svg viewBox="0 0 500 180">
          <defs>
            <linearGradient id="gg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#e11d48" stop-opacity=".35"/>
              <stop offset="1" stop-color="#e11d48" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <polygon points="0,150 50,130 100,110 150,125 200,90 250,70 300,85 350,55 400,40 450,55 500,30 500,180 0,180" fill="url(#gg)"/>
          <polyline points="0,150 50,130 100,110 150,125 200,90 250,70 300,85 350,55 400,40 450,55 500,30" fill="none" stroke="#e11d48" stroke-width="2.5"/>
        </svg>
      </section>

      <section class="card approvals">
        <header><h3>Pending approvals</h3><a>View all</a></header>
        <ul>
          <li *ngFor="let u of pendingApprovals">
            <div class="approvals__avatar">{{ u.name.charAt(0) }}</div>
            <div>
              <div class="approvals__name">{{ u.name }}</div>
              <div class="approvals__meta">{{ u.role | titlecase }} · {{ u.joined | date:'mediumDate' }}</div>
            </div>
            <div class="approvals__actions">
              <button class="approve">Approve</button>
              <button class="reject">Reject</button>
            </div>
          </li>
        </ul>
      </section>

      <section class="card recent">
        <header><h3>Recent orders</h3><a>View all</a></header>
        <table>
          <thead><tr><th>ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Placed</th></tr></thead>
          <tbody>
            <tr *ngFor="let o of recent">
              <td>#{{ o.id }}</td>
              <td>{{ o.customer }}</td>
              <td>\${{ o.total | number: '1.2-2' }}</td>
              <td><rs-badge [tone]="toneFor(o.status)" [soft]="true">{{ o.status }}</rs-badge></td>
              <td>{{ o.placedAt | date:'mediumDate' }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  `,
  styles: [`
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
    .card { background: white; border: 1px solid var(--rs-border); border-radius: var(--rs-radius-lg); padding: 20px 22px; }
    .card header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    .card h3 { font-size: 15px; font-weight: 700; }
    .card header a { color: var(--rs-brand-600); font-size: 13px; font-weight: 600; cursor: pointer; }
    .chart svg { width: 100%; height: 260px; }

    .approvals ul { display: flex; flex-direction: column; gap: 10px; }
    .approvals li { display: grid; grid-template-columns: 38px 1fr auto; gap: 12px; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--rs-border); }
    .approvals li:last-child { border-bottom: 0; }
    .approvals__avatar { width: 38px; height: 38px; border-radius: 50%; background: var(--rs-gradient-brand); color: white; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; }
    .approvals__name { font-weight: 600; font-size: 13px; }
    .approvals__meta { font-size: 11px; color: var(--rs-text-subtle); }
    .approvals__actions { display: flex; gap: 4px; }
    .approvals__actions button { padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; }
    .approve { background: var(--rs-accent-500); color: white; }
    .reject { background: var(--rs-surface-2); color: var(--rs-text-muted); }

    .recent { grid-column: 1 / -1; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; padding: 12px; color: var(--rs-text-muted); background: var(--rs-surface-2); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
    td { padding: 12px; border-top: 1px solid var(--rs-border); }

    @media (max-width: 1000px) { .stats { grid-template-columns: repeat(2, 1fr); } .grid { grid-template-columns: 1fr; } }
  `],
})
export class AdminDashboardComponent {
  recent = ORDERS.slice(0, 6);
  pendingApprovals = ADMIN_USERS.filter(u => u.status === 'pending').slice(0, 5);

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
