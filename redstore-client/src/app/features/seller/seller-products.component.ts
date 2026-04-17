import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { CategoryApiService, CategoryApiResponse, MetadataFieldApi } from '../../core/services/category-api.service';
import { BrandApiService } from '../../core/services/brand-api.service';
import { mapProductApiToModel, ProductApiService } from '../../core/services/product-api.service';
import { Product } from '../../core/models/product.model';
import { ToastService } from '../../core/services/toast.service';

type BrandRow = { id: string; name: string; categoryIds: string[]; status: string };

type UploadedSlot = { key: string; preview: string };

@Component({
  selector: 'rs-seller-products',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent, ButtonComponent, BadgeComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './seller-products.component.html',
  styleUrls: ['./seller-products.component.scss'],
})
export class SellerProductsComponent {
  private productApi = inject(ProductApiService);
  private brandApi = inject(BrandApiService);
  private categoryApi = inject(CategoryApiService);
  private toast = inject(ToastService);

  tabs = ['All', 'Active', 'Out of stock', 'Drafts'];
  activeTab = signal('All');
  query = signal('');

  products = signal<Product[]>([]);
  myBrandsSignal = signal<BrandRow[]>([]);
  categories = signal<CategoryApiResponse[]>([]);

  constructor() {
    this.reloadCatalogData();
  }

  private reloadCatalogData(): void {
    this.brandApi.getMyBrands().subscribe({
      next: (rows) =>
        this.myBrandsSignal.set(
          rows.map((b) => ({
            id: b.id,
            name: b.name,
            categoryIds: b.categoryIds ?? [],
            status: (b.status ?? '').toUpperCase(),
          })),
        ),
      error: () => this.myBrandsSignal.set([]),
    });
    this.categoryApi.getCategories().subscribe({
      next: (rows) => this.categories.set(rows),
      error: () => this.categories.set([]),
    });
    this.productApi.getMyProducts().subscribe({
      next: (rows) => this.products.set(rows.map(mapProductApiToModel)),
      error: () => this.products.set([]),
    });
  }

  /** Only approved brands may list products. */
  approvedBrands = computed(() => this.myBrandsSignal().filter((b) => b.status === 'APPROVED'));

  showCreateDialog = signal(false);
  saving = signal(false);

  formBrandId = signal('');
  formCategoryId = signal('');
  formName = signal('');
  formDescription = signal('');
  formPrice = signal<number>(0);
  /** Presigned object keys + local preview URLs (revoked on remove / close). */
  uploadedImages = signal<UploadedSlot[]>([]);
  metaValues = signal<Record<string, string>>({});

  myBrands = computed(() => this.myBrandsSignal());

  categoriesForPicker = computed(() => {
    if (!this.formBrandId()) {
      return [];
    }
    return this.categories();
  });

  metadataFields = computed((): MetadataFieldApi[] => {
    const cid = this.formCategoryId();
    return this.categories().find((c) => c.id === cid)?.metadataFields ?? [];
  });

  imageCount = computed(() => this.uploadedImages().length);

  canSubmitCreate = computed(() => {
    const n = this.uploadedImages().length;
    const metaOk = this.metadataFields().every((f) => (this.metaValues()[f.key] ?? '').trim().length > 0);
    return (
      this.formBrandId().trim() !== '' &&
      this.formCategoryId().trim() !== '' &&
      this.formName().trim() !== '' &&
      this.formDescription().trim() !== '' &&
      Number(this.formPrice()) > 0 &&
      n >= 3 &&
      n <= 6 &&
      metaOk
    );
  });

  rows = computed(() => {
    let items = this.products();
    const q = this.query().toLowerCase();
    if (q) {
      items = items.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    }
    if (this.activeTab() === 'Active') {
      items = items.filter((p) => p.inStock);
    }
    if (this.activeTab() === 'Out of stock') {
      items = items.filter((p) => !p.inStock);
    }
    return items;
  });

  onSearch(e: Event) {
    this.query.set((e.target as HTMLInputElement).value);
  }

  openCreateDialog(): void {
    this.reloadCatalogData();
    this.revokeAllPreviews();
    this.formBrandId.set('');
    this.formCategoryId.set('');
    this.formName.set('');
    this.formDescription.set('');
    this.formPrice.set(0);
    this.uploadedImages.set([]);
    this.metaValues.set({});
    this.showCreateDialog.set(true);
  }

  closeCreateDialog(): void {
    this.revokeAllPreviews();
    this.uploadedImages.set([]);
    this.showCreateDialog.set(false);
  }

  private revokeAllPreviews(): void {
    for (const u of this.uploadedImages()) {
      URL.revokeObjectURL(u.preview);
    }
  }

  onBrandChange(e: Event) {
    const v = (e.target as HTMLSelectElement).value;
    this.formBrandId.set(v);
    this.formCategoryId.set('');
    this.metaValues.set({});
  }

  onCategoryChange(e: Event) {
    const v = (e.target as HTMLSelectElement).value;
    this.formCategoryId.set(v);
    const cat = this.categories().find((c) => c.id === v);
    const next: Record<string, string> = {};
    for (const f of cat?.metadataFields ?? []) {
      next[f.key] = '';
    }
    this.metaValues.set(next);
  }

  metaValue(key: string): string {
    return this.metaValues()[key] ?? '';
  }

  setMeta(key: string, value: string) {
    this.metaValues.update((m) => ({ ...m, [key]: value }));
  }

  async onPickOneImage(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    if (this.uploadedImages().length >= 6) {
      this.toast.error('You can add at most 6 images.');
      return;
    }
    const preview = URL.createObjectURL(file);
    try {
      const presign = await firstValueFrom(
        this.productApi.createImageUploadUrl(file.name, file.type || 'application/octet-stream'),
      );
      await firstValueFrom(this.productApi.uploadImageToPresignedUrl(presign.uploadUrl, file));
      this.uploadedImages.update((arr) => [...arr, { key: presign.objectKey, preview }]);
    } catch {
      URL.revokeObjectURL(preview);
      this.toast.error('Image upload failed. Try again.');
    }
  }

  removeImageAt(index: number) {
    const arr = [...this.uploadedImages()];
    const [removed] = arr.splice(index, 1);
    if (removed) {
      URL.revokeObjectURL(removed.preview);
    }
    this.uploadedImages.set(arr);
  }

  async submitCreate() {
    if (!this.canSubmitCreate()) {
      this.toast.error('Complete all fields, metadata, and add 3–6 images.');
      return;
    }

    const brandId = this.formBrandId().trim();
    const categoryId = this.formCategoryId().trim();
    const name = this.formName().trim();
    const description = this.formDescription().trim();
    const price = Number(this.formPrice());
    const meta = this.metaValues();
    const imageKeys = this.uploadedImages().map((u) => u.key);

    this.saving.set(true);
    try {
      await firstValueFrom(
        this.productApi.createProduct({
          brandId,
          categoryId,
          name,
          description,
          price,
          imageKeys,
          metadata: meta,
        }),
      );
      this.toast.success('Product created', name);
      this.closeCreateDialog();
      this.productApi.getMyProducts().subscribe({
        next: (rows) => this.products.set(rows.map(mapProductApiToModel)),
        error: () => undefined,
      });
    } catch {
      this.toast.error('Could not create product. Ensure the brand is approved and your account is active.');
    } finally {
      this.saving.set(false);
    }
  }
}
