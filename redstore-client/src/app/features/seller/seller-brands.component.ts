import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BRANDS } from '../../data/mock-brands';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { BadgeComponent, BadgeTone } from '../../shared/components/badge/badge.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { RatingComponent } from '../../shared/components/rating/rating.component';

@Component({
  selector: 'rs-seller-brands',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ButtonComponent, BadgeComponent, IconComponent, RatingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <rs-page-header eyebrow="Your brands" title="Brands" subtitle="Build, showcase and manage your brand portfolio.">
      <rs-button variant="primary"><rs-icon slot="icon" name="plus" [size]="16"></rs-icon>Create brand</rs-button>
    </rs-page-header>

    <div class="grid">
      <article *ngFor="let b of brands" class="brand">
        <header>
          <div class="brand__logo">{{ b.logo }}</div>
          <rs-badge [tone]="toneFor(b.status)" [soft]="true">{{ b.status }}</rs-badge>
        </header>
        <h3>{{ b.name }}</h3>
        <p>{{ b.description }}</p>
        <div class="brand__meta">
          <rs-rating [value]="b.rating"></rs-rating>
          <span>{{ b.productCount }} products</span>
        </div>
        <footer>
          <button>View</button>
          <button>Edit</button>
        </footer>
      </article>
    </div>
  `,
  styles: [`
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 14px;
    }
    .brand {
      padding: 22px;
      background: white; border: 1px solid var(--rs-border);
      border-radius: var(--rs-radius-lg); box-shadow: var(--rs-shadow-xs);
      display: flex; flex-direction: column; gap: 8px;
    }
    .brand header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
    .brand__logo { width: 54px; height: 54px; border-radius: var(--rs-radius-md); background: var(--rs-surface-2); display: inline-flex; align-items: center; justify-content: center; font-size: 26px; }
    .brand h3 { font-size: 17px; font-weight: 800; letter-spacing: -0.02em; }
    .brand p { color: var(--rs-text-muted); font-size: 13px; line-height: 1.5; }
    .brand__meta { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--rs-text-subtle); margin-top: 6px; }
    .brand footer { display: flex; gap: 8px; margin-top: 6px; }
    .brand footer button { flex: 1; padding: 8px; background: var(--rs-surface-2); border-radius: var(--rs-radius-md); font-size: 13px; font-weight: 600; color: var(--rs-text); }
    .brand footer button:hover { background: var(--rs-surface-3); }
  `],
})
export class SellerBrandsComponent {
  brands = BRANDS;
  toneFor(s: string | undefined): BadgeTone {
    if (s === 'active') return 'success';
    if (s === 'pending') return 'warning';
    return 'danger';
  }
}
