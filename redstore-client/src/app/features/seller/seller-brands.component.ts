import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
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
      <rs-button variant="primary" (click)="openCreateDialog()"><rs-icon slot="icon" name="plus" [size]="16"></rs-icon>Create brand</rs-button>
    </rs-page-header>

    <div class="grid">
      <article *ngFor="let b of brands()" class="brand">
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

    <div class="dialog-backdrop" *ngIf="showCreateDialog()" (click)="closeCreateDialog()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <h3>Create brand</h3>
        <p>Add a new brand to your seller portfolio.</p>
        <label>
          Brand name
          <input type="text" [value]="newName()" (input)="newName.set(($any($event.target)).value)" placeholder="e.g. Nova Mobile" />
        </label>
        <label>
          Description
          <textarea rows="3" [value]="newDescription()" (input)="newDescription.set(($any($event.target)).value)" placeholder="Short brand description"></textarea>
        </label>
        <label>
          Logo (emoji or short text)
          <input type="text" [value]="newLogo()" (input)="newLogo.set(($any($event.target)).value)" placeholder="🏷️" />
        </label>
        <div class="dialog__actions">
          <rs-button variant="secondary" (click)="closeCreateDialog()">Cancel</rs-button>
          <rs-button variant="primary" (click)="createBrand()">Create</rs-button>
        </div>
      </div>
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
    .dialog-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(10, 10, 12, 0.45);
      display: grid;
      place-items: center;
      z-index: 80;
      padding: 16px;
    }
    .dialog {
      width: min(520px, 100%);
      background: white;
      border: 1px solid var(--rs-border);
      border-radius: var(--rs-radius-lg);
      box-shadow: var(--rs-shadow-lg);
      padding: 20px;
      display: grid;
      gap: 12px;
    }
    .dialog h3 { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; }
    .dialog p { color: var(--rs-text-muted); font-size: 13px; }
    .dialog label { display: grid; gap: 6px; font-size: 12px; color: var(--rs-text-subtle); font-weight: 600; }
    .dialog input, .dialog textarea {
      width: 100%;
      border: 1px solid var(--rs-border);
      border-radius: var(--rs-radius-md);
      padding: 10px 12px;
      font: inherit;
      color: var(--rs-text);
      background: white;
      resize: vertical;
    }
    .dialog input:focus, .dialog textarea:focus {
      outline: none;
      border-color: var(--rs-brand-500);
      box-shadow: var(--rs-shadow-ring);
    }
    .dialog__actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding-top: 4px;
    }
  `],
})
export class SellerBrandsComponent {
  brands = signal(BRANDS.slice());
  showCreateDialog = signal(false);
  newName = signal('');
  newDescription = signal('');
  newLogo = signal('🏷️');

  toneFor(s: string | undefined): BadgeTone {
    if (s === 'active') return 'success';
    if (s === 'pending') return 'warning';
    return 'danger';
  }

  openCreateDialog(): void {
    this.showCreateDialog.set(true);
  }

  closeCreateDialog(): void {
    this.showCreateDialog.set(false);
  }

  createBrand(): void {
    const name = this.newName().trim();
    if (!name) return;

    this.brands.update((current) => ([
      {
        id: `brand-${Date.now()}`,
        name,
        description: this.newDescription().trim() || 'New brand created from Seller Hub.',
        logo: this.newLogo().trim() || '🏷️',
        categories: [],
        rating: 0,
        productCount: 0,
        status: 'pending',
      },
      ...current,
    ]));

    this.newName.set('');
    this.newDescription.set('');
    this.newLogo.set('🏷️');
    this.closeCreateDialog();
  }
}
