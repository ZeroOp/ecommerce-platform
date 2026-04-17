import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PRODUCTS } from '../../data/mock-products';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'rs-seller-products',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ButtonComponent, BadgeComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <rs-page-header eyebrow="Catalog" title="Products" subtitle="Manage, update, and launch products across your brands.">
      <rs-button variant="secondary"><rs-icon slot="icon" name="upload" [size]="16"></rs-icon>Import</rs-button>
      <rs-button variant="primary"><rs-icon slot="icon" name="plus" [size]="16"></rs-icon>Add product</rs-button>
    </rs-page-header>

    <div class="toolbar">
      <div class="toolbar__search">
        <rs-icon name="search" [size]="16"></rs-icon>
        <input type="search" placeholder="Search products..." [value]="query()" (input)="onSearch($event)" />
      </div>
      <div class="toolbar__tabs">
        <button *ngFor="let t of tabs" [class.is-active]="activeTab() === t" (click)="activeTab.set(t)">{{ t }}</button>
      </div>
    </div>

    <section class="card">
      <table>
        <thead>
          <tr>
            <th><input type="checkbox" /></th>
            <th>Product</th>
            <th>Brand</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Rating</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of rows()">
            <td><input type="checkbox" /></td>
            <td class="product-cell">
              <img [src]="p.image" [alt]="p.name" />
              <div>
                <div class="product-cell__name">{{ p.name }}</div>
                <div class="product-cell__id">ID: {{ p.id }}</div>
              </div>
            </td>
            <td>{{ p.brand }}</td>
            <td><rs-badge [soft]="true" tone="neutral">{{ p.category }}</rs-badge></td>
            <td><strong>\${{ p.price | number: '1.2-2' }}</strong></td>
            <td>
              <rs-badge *ngIf="p.inStock" tone="success" [soft]="true">In stock</rs-badge>
              <rs-badge *ngIf="!p.inStock" tone="danger" [soft]="true">Out</rs-badge>
            </td>
            <td>⭐ {{ p.rating | number: '1.1-1' }} <span class="muted">({{ p.reviews }})</span></td>
            <td class="actions">
              <button><rs-icon name="edit" [size]="14"></rs-icon></button>
              <button><rs-icon name="trash" [size]="14"></rs-icon></button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  `,
  styles: [`
    .toolbar { display: flex; justify-content: space-between; gap: 14px; margin-bottom: 16px; align-items: center; flex-wrap: wrap; }
    .toolbar__search {
      display: flex; align-items: center; gap: 10px;
      padding: 0 14px; height: 42px;
      background: white; border: 1px solid var(--rs-border);
      border-radius: var(--rs-radius-pill); flex: 0 1 360px;
      color: var(--rs-text-subtle);
    }
    .toolbar__search:focus-within { border-color: var(--rs-brand-500); box-shadow: var(--rs-shadow-ring); }
    .toolbar__search input { flex: 1; border: 0; outline: 0; background: transparent; font-size: 13px; color: var(--rs-text); }

    .toolbar__tabs { display: inline-flex; padding: 4px; background: var(--rs-surface-2); border-radius: var(--rs-radius-pill); gap: 4px; }
    .toolbar__tabs button { padding: 8px 16px; font-size: 13px; font-weight: 600; color: var(--rs-text-muted); border-radius: var(--rs-radius-pill); }
    .toolbar__tabs button.is-active { background: white; color: var(--rs-text); box-shadow: var(--rs-shadow-xs); }

    .card {
      background: white; border: 1px solid var(--rs-border);
      border-radius: var(--rs-radius-lg); overflow: hidden;
      box-shadow: var(--rs-shadow-xs);
    }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; padding: 14px 20px; color: var(--rs-text-muted); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; background: var(--rs-surface-2); }
    td { padding: 14px 20px; border-top: 1px solid var(--rs-border); vertical-align: middle; }
    tr:hover td { background: var(--rs-surface-2); }
    .product-cell { display: flex; align-items: center; gap: 12px; }
    .product-cell img { width: 48px; height: 48px; border-radius: 10px; object-fit: cover; }
    .product-cell__name { font-weight: 600; color: var(--rs-text); }
    .product-cell__id { font-size: 11px; color: var(--rs-text-subtle); }
    .muted { color: var(--rs-text-subtle); }
    .actions button { width: 32px; height: 32px; border-radius: 8px; color: var(--rs-text-subtle); }
    .actions button:hover { background: var(--rs-surface-2); color: var(--rs-text); }
    input[type="checkbox"] { accent-color: var(--rs-brand-600); }
  `],
})
export class SellerProductsComponent {
  tabs = ['All', 'Active', 'Out of stock', 'Drafts'];
  activeTab = signal('All');
  query = signal('');

  rows = computed(() => {
    let items = PRODUCTS.slice(0, 18);
    const q = this.query().toLowerCase();
    if (q) items = items.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    if (this.activeTab() === 'Active') items = items.filter(p => p.inStock);
    if (this.activeTab() === 'Out of stock') items = items.filter(p => !p.inStock);
    return items;
  });

  onSearch(e: Event) { this.query.set((e.target as HTMLInputElement).value); }
}
