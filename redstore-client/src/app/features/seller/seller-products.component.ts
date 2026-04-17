import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, firstValueFrom } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { CategoryApiService, CategoryApiResponse, MetadataFieldApi } from '../../core/services/category-api.service';
import { BrandApiService } from '../../core/services/brand-api.service';
import { mapProductApiToModel, ProductApiService } from '../../core/services/product-api.service';
import { Product } from '../../core/models/product.model';
import { ToastService } from '../../core/services/toast.service';

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
  myBrandsSignal = signal<{ id: string; name: string; categoryIds: string[] }[]>([]);
  categories = signal<CategoryApiResponse[]>([]);

  constructor() {
    this.reloadCatalogData();
  }

  private reloadCatalogData(): void {
    this.brandApi.getMyBrands().subscribe({
      next: (rows) =>
        this.myBrandsSignal.set(rows.map((b) => ({ id: b.id, name: b.name, categoryIds: b.categoryIds ?? [] }))),
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

  showCreateDialog = signal(false);
  saving = signal(false);

  formBrandId = signal('');
  formCategoryId = signal('');
  formName = signal('');
  formDescription = signal('');
  formPrice = signal<number>(0);
  imageFiles = signal<File[]>([]);
  metaValues = signal<Record<string, string>>({});

  myBrands = computed(() => this.myBrandsSignal());

  categoriesForBrand = computed(() => {
    const bid = this.formBrandId();
    const b = this.myBrandsSignal().find((x) => x.id === bid);
    if (!b?.categoryIds?.length) {
      return [];
    }
    return this.categories().filter((c) => b.categoryIds.includes(c.id));
  });

  metadataFields = computed((): MetadataFieldApi[] => {
    const cid = this.formCategoryId();
    return this.categories().find((c) => c.id === cid)?.metadataFields ?? [];
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
    this.formBrandId.set('');
    this.formCategoryId.set('');
    this.formName.set('');
    this.formDescription.set('');
    this.formPrice.set(0);
    this.imageFiles.set([]);
    this.metaValues.set({});
    this.showCreateDialog.set(true);
  }

  closeCreateDialog(): void {
    this.showCreateDialog.set(false);
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

  onImagesPicked(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (files.length < 3 || files.length > 6) {
      this.toast.error('Please choose between 3 and 6 images.');
      input.value = '';
      return;
    }
    this.imageFiles.set(files);
  }

  async submitCreate() {
    const brandId = this.formBrandId().trim();
    const categoryId = this.formCategoryId().trim();
    const name = this.formName().trim();
    const description = this.formDescription().trim();
    const price = Number(this.formPrice());
    const files = this.imageFiles();
    const meta = this.metaValues();

    if (!brandId || !categoryId || !name || !description || price <= 0) {
      this.toast.error('Please fill brand, category, name, description, and a valid price.');
      return;
    }
    if (files.length < 3 || files.length > 6) {
      this.toast.error('Upload between 3 and 6 images.');
      return;
    }
    const fields = this.metadataFields();
    for (const f of fields) {
      if (!meta[f.key]?.trim()) {
        this.toast.error(`Please fill "${f.label}".`);
        return;
      }
    }

    this.saving.set(true);
    try {
      const pipelines = files.map((file) =>
        this.productApi.createImageUploadUrl(file.name, file.type || 'application/octet-stream').pipe(
          switchMap((presign) =>
            this.productApi.uploadImageToPresignedUrl(presign.uploadUrl, file).pipe(map(() => presign.objectKey)),
          ),
        ),
      );
      const imageKeys = await firstValueFrom(forkJoin(pipelines));

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
      this.toast.error('Could not create product. Check your inputs and try again.');
    } finally {
      this.saving.set(false);
    }
  }
}
