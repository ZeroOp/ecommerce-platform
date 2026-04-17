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
      <rs-button variant="primary" (click)="openCreateDialog()"><rs-icon slot="icon" name="plus" [size]="16"></rs-icon>Add product</rs-button>
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

    <div class="dialog-backdrop" *ngIf="showCreateDialog()" (click)="closeCreateDialog()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <h3>Add product</h3>
        <p>Create a new product entry in your catalog.</p>
        <label>
          Product name
          <input type="text" [value]="newName()" (input)="newName.set(($any($event.target)).value)" placeholder="e.g. Galaxy S26" />
        </label>
        <label>
          Brand
          <input type="text" [value]="newBrand()" (input)="newBrand.set(($any($event.target)).value)" placeholder="e.g. Samsung" />
        </label>
        <label>
          Category
          <input type="text" [value]="newCategory()" (input)="newCategory.set(($any($event.target)).value)" placeholder="e.g. Mobiles" />
        </label>
        <label>
          Price
          <input type="number" min="1" [value]="newPrice()" (input)="newPrice.set(+($any($event.target)).value)" placeholder="999" />
        </label>
        <div class="dialog__actions">
          <rs-button variant="secondary" (click)="closeCreateDialog()">Cancel</rs-button>
          <rs-button variant="primary" (click)="createProduct()">Create</rs-button>
        </div>
      </div>
    </div>
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
    .dialog input {
      width: 100%;
      border: 1px solid var(--rs-border);
      border-radius: var(--rs-radius-md);
      padding: 10px 12px;
      font: inherit;
      color: var(--rs-text);
      background: white;
    }
    .dialog input:focus {
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
export class SellerProductsComponent {
  tabs = ['All', 'Active', 'Out of stock', 'Drafts'];
  activeTab = signal('All');
  query = signal('');
  products = signal(PRODUCTS.slice(0, 18));
  showCreateDialog = signal(false);
  newName = signal('');
  newBrand = signal('');
  newCategory = signal('');
  newPrice = signal<number>(0);

  rows = computed(() => {
    let items = this.products();
    const q = this.query().toLowerCase();
    if (q) items = items.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    if (this.activeTab() === 'Active') items = items.filter(p => p.inStock);
    if (this.activeTab() === 'Out of stock') items = items.filter(p => !p.inStock);
    return items;
  });

  onSearch(e: Event) { this.query.set((e.target as HTMLInputElement).value); }

  openCreateDialog(): void {
    this.showCreateDialog.set(true);
  }

  closeCreateDialog(): void {
    this.showCreateDialog.set(false);
  }

  createProduct(): void {
    const name = this.newName().trim();
    const brand = this.newBrand().trim() || 'Unbranded';
    const category = this.newCategory().trim() || 'General';
    const price = Number(this.newPrice()) || 0;
    if (!name || price <= 0) return;

    this.products.update((current) => ([
      {
        id: `prd-${Date.now()}`,
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        brand,
        category,
        description: 'New product created from Seller Hub.',
        price,
        originalPrice: price,
        discount: 0,
        rating: 0,
        reviews: 0,
        tags: [],
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=900&auto=format&fit=crop',
        inStock: true,
      },
      ...current,
    ]));

    this.newName.set('');
    this.newBrand.set('');
    this.newCategory.set('');
    this.newPrice.set(0);
    this.closeCreateDialog();
  }
}
