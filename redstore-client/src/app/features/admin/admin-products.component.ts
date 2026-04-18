import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { mapProductApiToModel, ProductApiService } from '../../core/services/product-api.service';
import { InventoryApiService } from '../../core/services/inventory-api.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'rs-admin-products',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent, BadgeComponent, IconComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.scss'],
})
export class AdminProductsComponent {
  private productApi = inject(ProductApiService);
  private inventoryApi = inject(InventoryApiService);

  products = signal<Product[]>([]);
  stockByProductId = signal<Record<string, number>>({});
  loading = signal(true);
  query = signal('');

  tabs = ['All', 'In Stock', 'Out of Stock'];
  activeTab = signal('All');

  rows = computed(() => {
    const stockMap = this.stockByProductId();
    let items = this.products().map((p) => ({
      ...p,
      stock: stockMap[p.id] ?? 0,
    }));
    const q = this.query().toLowerCase();
    if (q) {
      items = items.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    }
    if (this.activeTab() === 'In Stock') {
      items = items.filter((p) => p.stock > 0);
    }
    if (this.activeTab() === 'Out of Stock') {
      items = items.filter((p) => p.stock === 0);
    }
    return items;
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.productApi.getAdminProducts().subscribe({
      next: (rows) => {
        const mapped = rows.map(mapProductApiToModel);
        this.products.set(mapped);
        const ids = mapped.map((p) => p.id);
        this.inventoryApi.getBatchQuantities(ids).subscribe({
          next: (map) => {
            this.stockByProductId.set(map);
            this.loading.set(false);
          },
          error: () => {
            this.stockByProductId.set({});
            this.loading.set(false);
          },
        });
      },
      error: () => {
        this.products.set([]);
        this.loading.set(false);
      },
    });
  }

  onSearch(e: Event): void {
    this.query.set((e.target as HTMLInputElement).value);
  }
}
