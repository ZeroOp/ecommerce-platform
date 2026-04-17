import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BRANDS } from '../../data/mock-brands';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { BadgeComponent, BadgeTone } from '../../shared/components/badge/badge.component';

@Component({
  selector: 'rs-admin-sellers',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <rs-page-header eyebrow="Marketplace" title="Sellers" subtitle="Review seller applications and manage active brands."></rs-page-header>

    <div class="grid">
      <article *ngFor="let b of brands" class="card">
        <header>
          <div class="logo">{{ b.logo }}</div>
          <rs-badge [tone]="toneFor(b.status)" [soft]="true">{{ b.status }}</rs-badge>
        </header>
        <h3>{{ b.name }}</h3>
        <p>{{ b.description }}</p>
        <div class="meta">
          <span>{{ b.productCount }} products</span>
          <span>⭐ {{ b.rating }}</span>
        </div>
        <footer>
          <button class="approve" *ngIf="b.status === 'pending'">Approve</button>
          <button *ngIf="b.status !== 'pending'">View store</button>
          <button class="reject">{{ b.status === 'pending' ? 'Reject' : 'Suspend' }}</button>
        </footer>
      </article>
    </div>
  `,
  styles: [`
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }
    .card { background: white; border: 1px solid var(--rs-border); border-radius: var(--rs-radius-lg); padding: 22px; display: flex; flex-direction: column; gap: 8px; }
    .card header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
    .logo { width: 54px; height: 54px; border-radius: var(--rs-radius-md); background: var(--rs-surface-2); display: inline-flex; align-items: center; justify-content: center; font-size: 26px; }
    .card h3 { font-size: 18px; font-weight: 800; letter-spacing: -0.02em; }
    .card p { color: var(--rs-text-muted); font-size: 13px; line-height: 1.5; }
    .meta { display: flex; justify-content: space-between; font-size: 12px; color: var(--rs-text-subtle); margin-top: 6px; }
    footer { display: flex; gap: 8px; margin-top: 6px; }
    footer button { flex: 1; padding: 9px; background: var(--rs-surface-2); border-radius: var(--rs-radius-md); font-size: 13px; font-weight: 600; color: var(--rs-text); }
    footer button:hover { background: var(--rs-surface-3); }
    .approve { background: var(--rs-accent-500) !important; color: white !important; }
    .reject { background: #fee2e2 !important; color: var(--rs-danger) !important; }
  `],
})
export class AdminSellersComponent {
  brands = BRANDS;
  toneFor(s: string | undefined): BadgeTone {
    if (s === 'active') return 'success';
    if (s === 'pending') return 'warning';
    return 'danger';
  }
}
