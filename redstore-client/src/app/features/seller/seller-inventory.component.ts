import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { InventoryApiService } from '../../core/services/inventory-api.service';
import { mapProductApiToModel, ProductApiService } from '../../core/services/product-api.service';
import { Product } from '../../core/models/product.model';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'rs-seller-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, ButtonComponent, BadgeComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './seller-inventory.component.html',
  styleUrls: ['./seller-inventory.component.scss'],
})
export class SellerInventoryComponent {
  private productApi = inject(ProductApiService);
  private inventoryApi = inject(InventoryApiService);
  private toast = inject(ToastService);

  products = signal<Product[]>([]);
  /** productId -> quantity */
  stockByProductId = signal<Record<string, number>>({});
  addQty = signal<Record<string, number>>({});
  savingId = signal<string | null>(null);
  loading = signal(true);

  rows = computed(() => {
    const map = this.stockByProductId();
    return this.products().map((p) => ({
      product: p,
      quantity: map[p.id] ?? 0,
      addInput: this.addQty()[p.id] ?? 1,
    }));
  });

  constructor() {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.productApi.getMyProducts().subscribe({
      next: (rows) => {
        this.products.set(rows.map(mapProductApiToModel));
        this.inventoryApi.getSellerInventory().subscribe({
          next: (inv) => {
            const m: Record<string, number> = {};
            for (const line of inv) {
              m[line.productId] = line.quantity;
            }
            this.stockByProductId.set(m);
            this.loading.set(false);
          },
          error: () => {
            this.stockByProductId.set({});
            this.loading.set(false);
            this.toast.warning('Could not load stock levels', 'Showing catalog without inventory.');
          },
        });
      },
      error: () => {
        this.products.set([]);
        this.loading.set(false);
        this.toast.error('Could not load products');
      },
    });
  }

  setAddInput(productId: string, value: string | number): void {
    const n = typeof value === 'string' ? parseInt(value, 10) : value;
    this.addQty.update((q) => ({ ...q, [productId]: Math.max(1, Math.floor(Number.isFinite(n) ? n : 1) || 1) }));
  }

  addStock(productId: string): void {
    const n = this.addQty()[productId] ?? 1;
    if (n < 1) {
      this.toast.error('Enter a positive number of units');
      return;
    }
    this.savingId.set(productId);
    this.inventoryApi.addStock(productId, n).subscribe({
      next: (line) => {
        this.stockByProductId.update((m) => ({ ...m, [line.productId]: line.quantity }));
        this.savingId.set(null);
        this.toast.success(`Added ${n} units. New on-hand: ${line.quantity}.`);
      },
      error: () => {
        this.savingId.set(null);
        this.toast.error('Could not update stock. Ensure you own the product.');
      },
    });
  }
}
