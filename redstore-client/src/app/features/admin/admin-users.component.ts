import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ADMIN_USERS } from '../../data/mock-users';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { BadgeComponent, BadgeTone } from '../../shared/components/badge/badge.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'rs-admin-users',
  standalone: true,
  imports: [CommonModule, DatePipe, PageHeaderComponent, BadgeComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <rs-page-header eyebrow="Accounts" title="Users" subtitle="All buyers, sellers and admins on the platform."></rs-page-header>

    <div class="toolbar">
      <div class="toolbar__search">
        <rs-icon name="search" [size]="16"></rs-icon>
        <input type="search" placeholder="Search users..." [value]="q()" (input)="q.set($any($event.target).value)" />
      </div>
      <div class="toolbar__tabs">
        <button *ngFor="let r of roles" [class.is-active]="role() === r" (click)="role.set(r)">{{ r | titlecase }}</button>
      </div>
    </div>

    <section class="card">
      <table>
        <thead><tr>
          <th>User</th><th>Role</th><th>Status</th><th>Orders</th><th>Spent</th><th>Joined</th>
        </tr></thead>
        <tbody>
          <tr *ngFor="let u of filtered()">
            <td>
              <div class="user">
                <div class="user__avatar">{{ u.name.charAt(0) }}</div>
                <div>
                  <div class="user__name">{{ u.name }}</div>
                  <div class="user__email">{{ u.email }}</div>
                </div>
              </div>
            </td>
            <td><rs-badge tone="neutral" [soft]="true">{{ u.role }}</rs-badge></td>
            <td><rs-badge [tone]="toneFor(u.status)" [soft]="true">{{ u.status }}</rs-badge></td>
            <td>{{ u.orders }}</td>
            <td>\${{ u.spent | number: '1.2-2' }}</td>
            <td>{{ u.joined | date: 'mediumDate' }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  `,
  styles: [`
    .toolbar { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
    .toolbar__search { display: flex; align-items: center; gap: 10px; padding: 0 14px; height: 42px; background: white; border: 1px solid var(--rs-border); border-radius: var(--rs-radius-pill); flex: 0 1 360px; color: var(--rs-text-subtle); }
    .toolbar__search:focus-within { border-color: var(--rs-brand-500); box-shadow: var(--rs-shadow-ring); }
    .toolbar__search input { flex: 1; border: 0; outline: 0; background: transparent; font-size: 13px; color: var(--rs-text); }
    .toolbar__tabs { display: inline-flex; padding: 4px; background: var(--rs-surface-2); border-radius: var(--rs-radius-pill); gap: 4px; }
    .toolbar__tabs button { padding: 8px 14px; font-size: 13px; font-weight: 600; color: var(--rs-text-muted); border-radius: 999px; }
    .toolbar__tabs button.is-active { background: white; color: var(--rs-text); box-shadow: var(--rs-shadow-xs); }

    .card { background: white; border: 1px solid var(--rs-border); border-radius: var(--rs-radius-lg); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; padding: 14px 20px; color: var(--rs-text-muted); background: var(--rs-surface-2); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
    td { padding: 14px 20px; border-top: 1px solid var(--rs-border); }
    tr:hover td { background: var(--rs-surface-2); }
    .user { display: flex; align-items: center; gap: 10px; }
    .user__avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--rs-gradient-brand); color: white; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; }
    .user__name { font-weight: 600; color: var(--rs-text); }
    .user__email { font-size: 12px; color: var(--rs-text-subtle); }
  `],
})
export class AdminUsersComponent {
  roles: ('all' | 'user' | 'seller' | 'admin')[] = ['all', 'user', 'seller', 'admin'];
  role = signal<'all' | 'user' | 'seller' | 'admin'>('all');
  q = signal('');

  filtered = computed(() => {
    let rows = ADMIN_USERS;
    if (this.role() !== 'all') rows = rows.filter(r => r.role === this.role());
    const q = this.q().toLowerCase();
    if (q) rows = rows.filter(r => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q));
    return rows;
  });

  toneFor(s: string): BadgeTone {
    if (s === 'active') return 'success';
    if (s === 'pending') return 'warning';
    return 'danger';
  }
}
