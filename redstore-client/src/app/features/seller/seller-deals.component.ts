import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { DealApiService, DealDto, DealScope } from '../../core/services/deal-api.service';
import { ProductApiService } from '../../core/services/product-api.service';
import { BrandApiService } from '../../core/services/brand-api.service';
import { CategoryApiService } from '../../core/services/category-api.service';

@Component({
  selector: 'rs-seller-deals',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, PageHeaderComponent, ButtonComponent, BadgeComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <rs-page-header eyebrow="Seller Hub" title="Deals & Offers" subtitle="Create offers on your store, products, brands, or categories."></rs-page-header>

    <section class="card form">
      <h3>Create deal</h3>
      <div class="grid">
        <label>
          <span>Scope</span>
          <select [(ngModel)]="scope">
            <option value="SELLER">Whole seller account</option>
            <option value="PRODUCT">Specific product</option>
            <option value="BRAND">Specific brand</option>
            <option value="CATEGORY">Specific category</option>
          </select>
        </label>

        <label *ngIf="scope==='PRODUCT'">
          <span>Product</span>
          <select [(ngModel)]="productId">
            <option value="">Select product</option>
            <option *ngFor="let p of products()" [value]="p.id">{{ p.name }}</option>
          </select>
        </label>

        <label *ngIf="scope==='BRAND'">
          <span>Brand</span>
          <select [(ngModel)]="brandId">
            <option value="">Select brand</option>
            <option *ngFor="let b of brands()" [value]="b.id">{{ b.name }}</option>
          </select>
        </label>

        <label *ngIf="scope==='CATEGORY'">
          <span>Category</span>
          <select [(ngModel)]="categoryId">
            <option value="">Select category</option>
            <option *ngFor="let c of categories()" [value]="c.id">{{ c.name }}</option>
          </select>
        </label>

        <label>
          <span>Title</span>
          <input type="text" [(ngModel)]="title" placeholder="Summer sale 20% off" />
        </label>
        <label>
          <span>Discount %</span>
          <input type="number" min="0.01" max="99.99" step="0.01" [(ngModel)]="discountPercentage" />
        </label>
        <label>
          <span>Expires at</span>
          <input type="datetime-local" [(ngModel)]="expiresAtLocal" />
        </label>
      </div>
      <div class="actions">
        <rs-button variant="primary" [disabled]="saving()" (click)="createDeal()">
          <rs-icon slot="icon" name="plus" [size]="16"></rs-icon>Create Deal
        </rs-button>
      </div>
      <p *ngIf="error()" class="error">{{ error() }}</p>
    </section>

    <section class="card">
      <h3>My deals</h3>
      <table>
        <thead>
          <tr><th>Title</th><th>Scope</th><th>Discount</th><th>Status</th><th>Expires</th><th></th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let d of deals()">
            <td>{{ d.title }}</td>
            <td>{{ d.scope }}</td>
            <td>{{ d.discountPercentage }}%</td>
            <td><rs-badge [tone]="toneFor(d)">{{ d.status }}</rs-badge></td>
            <td>{{ d.expiresAt | date:'medium' }}</td>
            <td>
              <button class="link danger" *ngIf="d.status==='ACTIVE'" (click)="cancel(d)">Cancel</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  `,
  styles: [`
    :host { display:block; }
    .card { background:#fff; border:1px solid var(--rs-border); border-radius:14px; padding:18px; margin-bottom:16px; }
    .form .grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }
    label { display:flex; flex-direction:column; gap:6px; }
    label span { font-size:12px; color:var(--rs-text-muted); font-weight:600; }
    input, select { border:1px solid var(--rs-border); border-radius:10px; padding:10px; font-size:13px; }
    .actions { margin-top:12px; }
    table { width:100%; border-collapse:collapse; font-size:13px; }
    th, td { padding:10px; border-top:1px solid var(--rs-border); text-align:left; }
    th { color:var(--rs-text-muted); border-top:0; }
    .link { background:transparent; border:0; cursor:pointer; font-weight:600; }
    .danger { color:#b91c1c; }
    .error { margin-top:8px; color:#b91c1c; font-size:12px; }
  `],
})
export class SellerDealsComponent {
  private dealApi = inject(DealApiService);
  private productApi = inject(ProductApiService);
  private brandApi = inject(BrandApiService);
  private categoryApi = inject(CategoryApiService);

  deals = signal<DealDto[]>([]);
  products = signal<{ id: string; name: string; brandId: string; categoryId: string }[]>([]);
  brands = signal<{ id: string; name: string }[]>([]);
  categories = signal<{ id: string; name: string }[]>([]);
  saving = signal(false);
  error = signal('');

  scope: DealScope = 'SELLER';
  productId = '';
  brandId = '';
  categoryId = '';
  title = '';
  discountPercentage = 10;
  expiresAtLocal = '';

  constructor() {
    void this.loadAll();
  }

  async loadAll() {
    const [deals, products, brands, categories] = await Promise.all([
      firstValueFrom(this.dealApi.listMyDeals()),
      firstValueFrom(this.productApi.getMyProducts()),
      firstValueFrom(this.brandApi.getMyBrands()),
      firstValueFrom(this.categoryApi.getCategories()),
    ]);
    this.deals.set(deals);
    this.products.set(products.map((p) => ({
      id: p.id,
      name: p.name,
      brandId: p.brandId,
      categoryId: p.categoryId,
    })));
    this.brands.set(brands.map((b) => ({ id: b.id, name: b.name })));
    this.categories.set(categories.map((c) => ({ id: c.id, name: c.name })));
  }

  async createDeal() {
    this.error.set('');
    if (!this.title.trim()) return this.error.set('Title is required');
    if (!this.expiresAtLocal) return this.error.set('Expires at is required');
    const payload: any = {
      scope: this.scope,
      title: this.title.trim(),
      discountPercentage: this.discountPercentage,
      expiresAt: new Date(this.expiresAtLocal).toISOString(),
    };
    if (this.scope === 'PRODUCT') {
      payload.productId = this.productId;
      const selectedProduct = this.products().find((p) => p.id === this.productId);
      if (selectedProduct) {
        payload.brandId = selectedProduct.brandId;
        payload.categoryId = selectedProduct.categoryId;
      }
    }
    if (this.scope === 'BRAND') payload.brandId = this.brandId;
    if (this.scope === 'CATEGORY') payload.categoryId = this.categoryId;
    this.saving.set(true);
    try {
      await firstValueFrom(this.dealApi.createDeal(payload));
      this.title = '';
      await this.loadAll();
    } catch (e: any) {
      this.error.set(e?.error?.message || 'Failed to create deal');
    } finally {
      this.saving.set(false);
    }
  }

  async cancel(deal: DealDto) {
    await firstValueFrom(this.dealApi.cancelDeal(deal.id));
    await this.loadAll();
  }

  toneFor(d: DealDto): 'success' | 'warning' | 'danger' | 'neutral' {
    if (d.status === 'ACTIVE') return 'success';
    if (d.status === 'EXPIRED') return 'warning';
    if (d.status === 'CANCELLED') return 'danger';
    return 'neutral';
  }
}
