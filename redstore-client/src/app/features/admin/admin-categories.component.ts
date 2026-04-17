import { ChangeDetectionStrategy, Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { CategoryApiService, CategoryApiResponse, CreateCategoryPayload, PresignedUploadResponse } from '../../core/services/category-api.service';
import { finalize, switchMap } from 'rxjs/operators';

@Component({
  selector: 'rs-admin-categories',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ButtonComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <rs-page-header eyebrow="Catalog" title="Categories" subtitle="Manage product categories and their hierarchy.">
      <rs-button variant="primary" (click)="openCreateDialog()"><rs-icon slot="icon" name="plus" [size]="16"></rs-icon>Add category</rs-button>
    </rs-page-header>

    <div class="toolbar">
      <div class="toolbar__search">
        <rs-icon name="search" [size]="16"></rs-icon>
        <input type="search" placeholder="Search categories..." [value]="query()" (input)="onSearch($event)" />
      </div>
      <div class="toolbar__tabs">
        <button *ngFor="let t of tabs" [class.is-active]="activeTab() === t" (click)="activeTab.set(t)">{{ t }}</button>
      </div>
    </div>

    <!-- Loading state -->
    <div class="loading-state" *ngIf="isLoading()">
      <div class="loading-spinner"></div>
      <p>Loading categories...</p>
    </div>

    <!-- Categories grid -->
    <section class="categories-grid" *ngIf="!isLoading()">
      <div *ngFor="let category of filteredCategories()" class="category-card">
        <div class="category-card__header">
          <div class="category-card__icon">
            <img *ngIf="category.iconUrl; else placeholder" [src]="category.iconUrl" [alt]="category.name" />
            <ng-template #placeholder>
              <rs-icon name="box" [size]="24"></rs-icon>
            </ng-template>
          </div>
          <div class="category-card__info">
            <h3>{{ category.name }}</h3>
            <p>{{ category.description || 'No description' }}</p>
          </div>
          <div class="category-card__actions">
            <button><rs-icon name="edit" [size]="14"></rs-icon></button>
            <button><rs-icon name="trash" [size]="14"></rs-icon></button>
          </div>
        </div>
        <div class="category-card__footer">
          <div class="category-card__meta">
            <span class="id">ID: {{ category.id }}</span>
            <span class="slug">{{ category.slug }}</span>
          </div>
          <div class="category-card__parent" *ngIf="category.parentCategoryName">
            <rs-icon name="chevron-up" [size]="12"></rs-icon>
            <span>{{ category.parentCategoryName }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Create Category Dialog -->
    <div class="dialog-backdrop" *ngIf="showCreateDialog()" (click)="closeCreateDialog()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <h3>Add category</h3>
        <p>Create a new product category for the catalog.</p>
        
        <label>
          Category name
          <input type="text" [value]="newName()" (input)="newName.set(($any($event.target)).value)" placeholder="e.g. Electronics" />
        </label>

        <label>
          Description
          <textarea [value]="newDescription()" (input)="newDescription.set(($any($event.target)).value)" placeholder="Brief description of the category" rows="3"></textarea>
        </label>

        <label>
          Parent category
          <select [value]="newParentId()" (change)="newParentId.set(($any($event.target)).value)">
            <option value="">None (Root category)</option>
            <option *ngFor="let cat of availableParentCategories()" [value]="cat.id">{{ cat.name }}</option>
          </select>
        </label>

        <label>
          Category icon
          <div class="icon-upload">
            <input type="file" accept="image/*" (change)="onIconSelect($event)" #iconInput />
            <div class="icon-upload__preview" *ngIf="iconPreview()">
              <img [src]="iconPreview()" [alt]="newName()" />
              <button type="button" class="remove-icon" (click)="removeIcon()">
                <rs-icon name="close" [size]="12"></rs-icon>
              </button>
            </div>
            <div class="icon-upload__placeholder" *ngIf="!iconPreview()" (click)="iconInput.click()">
              <rs-icon name="upload" [size]="20"></rs-icon>
              <span>Click to upload icon</span>
              <small>PNG, JPG, WEBP up to 2MB</small>
            </div>
          </div>
        </label>

        <div class="dialog__actions">
          <rs-button variant="secondary" (click)="closeCreateDialog()">Cancel</rs-button>
          <rs-button variant="primary" (click)="createCategory()" [disabled]="!canCreateCategory() || isCreating()">
            <span *ngIf="!isCreating()">Create category</span>
            <span *ngIf="isCreating()">Creating...</span>
          </rs-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toolbar { 
      display: flex; 
      justify-content: space-between; 
      gap: 14px; 
      margin-bottom: 24px; 
      align-items: center; 
      flex-wrap: wrap; 
    }
    
    .toolbar__search {
      display: flex; align-items: center; gap: 10px;
      padding: 0 14px; height: 42px;
      background: white; border: 1px solid var(--rs-border);
      border-radius: var(--rs-radius-pill); 
      flex: 0 1 360px;
      color: var(--rs-text-subtle);
    }
    
    .toolbar__search:focus-within { 
      border-color: var(--rs-brand-500); 
      box-shadow: var(--rs-shadow-ring); 
    }
    
    .toolbar__search input { 
      flex: 1; 
      border: 0; 
      outline: 0; 
      background: transparent; 
      font-size: 13px; 
      color: var(--rs-text); 
    }

    .toolbar__tabs { 
      display: inline-flex; 
      padding: 4px; 
      background: var(--rs-surface-2); 
      border-radius: var(--rs-radius-pill); 
      gap: 4px; 
    }
    
    .toolbar__tabs button { 
      padding: 8px 16px; 
      font-size: 13px; 
      font-weight: 600; 
      color: var(--rs-text-muted); 
      border-radius: var(--rs-radius-pill); 
      border: none; 
      background: transparent; 
      cursor: pointer; 
    }
    
    .toolbar__tabs button.is-active { 
      background: white; 
      color: var(--rs-text); 
      box-shadow: var(--rs-shadow-xs); 
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: var(--rs-text-subtle);
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--rs-surface-2);
      border-top: 3px solid var(--rs-brand-500);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }

    .category-card {
      background: white;
      border: 1px solid var(--rs-border);
      border-radius: var(--rs-radius-lg);
      overflow: hidden;
      box-shadow: var(--rs-shadow-xs);
      transition: box-shadow var(--rs-dur-fast) var(--rs-ease);
    }

    .category-card:hover {
      box-shadow: var(--rs-shadow-sm);
    }

    .category-card__header {
      display: flex;
      gap: 16px;
      padding: 20px;
      align-items: flex-start;
    }

    .category-card__icon {
      width: 56px;
      height: 56px;
      border-radius: var(--rs-radius-md);
      background: var(--rs-surface-2);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      overflow: hidden;
    }

    .category-card__icon img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .category-card__info {
      flex: 1;
      min-width: 0;
    }

    .category-card__info h3 {
      font-size: 16px;
      font-weight: 700;
      margin: 0 0 4px 0;
      color: var(--rs-text);
    }

    .category-card__info p {
      font-size: 13px;
      color: var(--rs-text-subtle);
      margin: 0;
      line-height: 1.4;
    }

    .category-card__actions {
      display: flex;
      gap: 4px;
    }

    .category-card__actions button {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: var(--rs-text-subtle);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .category-card__actions button:hover {
      background: var(--rs-surface-2);
      color: var(--rs-text);
    }

    .category-card__footer {
      padding: 16px 20px;
      border-top: 1px solid var(--rs-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .category-card__meta {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .category-card__meta .id {
      font-size: 11px;
      color: var(--rs-text-subtle);
    }

    .category-card__meta .slug {
      font-size: 12px;
      color: var(--rs-text-muted);
      font-family: 'Monaco', 'Menlo', monospace;
    }

    .category-card__parent {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: var(--rs-text-subtle);
    }

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
      gap: 16px;
    }

    .dialog h3 { 
      font-size: 20px; 
      font-weight: 800; 
      letter-spacing: -0.02em; 
      margin: 0;
    }

    .dialog p { 
      color: var(--rs-text-muted); 
      font-size: 13px; 
      margin: 0;
    }

    .dialog label { 
      display: grid; 
      gap: 6px; 
      font-size: 12px; 
      color: var(--rs-text-subtle); 
      font-weight: 600; 
    }

    .dialog input,
    .dialog textarea,
    .dialog select {
      width: 100%;
      border: 1px solid var(--rs-border);
      border-radius: var(--rs-radius-md);
      padding: 10px 12px;
      font: inherit;
      color: var(--rs-text);
      background: white;
    }

    .dialog textarea {
      resize: vertical;
      min-height: 80px;
    }

    .dialog input:focus,
    .dialog textarea:focus,
    .dialog select:focus {
      outline: none;
      border-color: var(--rs-brand-500);
      box-shadow: var(--rs-shadow-ring);
    }

    .icon-upload {
      position: relative;
    }

    .icon-upload input[type="file"] {
      display: none;
    }

    .icon-upload__preview {
      position: relative;
      width: 80px;
      height: 80px;
      border-radius: var(--rs-radius-md);
      overflow: hidden;
      border: 2px solid var(--rs-border);
    }

    .icon-upload__preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .remove-icon {
      position: absolute;
      top: -6px;
      right: -6px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--rs-danger-500);
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-upload__placeholder {
      width: 80px;
      height: 80px;
      border: 2px dashed var(--rs-border);
      border-radius: var(--rs-radius-md);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      cursor: pointer;
      transition: border-color var(--rs-dur-fast) var(--rs-ease);
    }

    .icon-upload__placeholder:hover {
      border-color: var(--rs-brand-500);
    }

    .icon-upload__placeholder span {
      font-size: 11px;
      font-weight: 600;
      color: var(--rs-text);
    }

    .icon-upload__placeholder small {
      font-size: 10px;
      color: var(--rs-text-subtle);
    }

    .dialog__actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding-top: 4px;
    }

    @media (max-width: 768px) {
      .categories-grid {
        grid-template-columns: 1fr;
      }
      
      .category-card__header {
        padding: 16px;
        gap: 12px;
      }
      
      .category-card__icon {
        width: 48px;
        height: 48px;
      }
    }
  `],
})
export class AdminCategoriesComponent {
  private categoryApi = inject(CategoryApiService);
  
  tabs = ['All', 'Root categories', 'Subcategories'];
  activeTab = signal('All');
  query = signal('');
  categories = signal<CategoryApiResponse[]>([]);
  isLoading = signal(true);
  isCreating = signal(false);

  // Form state
  showCreateDialog = signal(false);
  newName = signal('');
  newDescription = signal('');
  newParentId = signal('');
  selectedIconFile = signal<File | null>(null);
  iconPreview = signal<string>('');

  constructor() {
    this.loadCategories();
  }

  filteredCategories = computed(() => {
    let items = this.categories();
    const q = this.query().toLowerCase();
    
    if (q) {
      items = items.filter(cat => 
        cat.name.toLowerCase().includes(q) || 
        (cat.description && cat.description.toLowerCase().includes(q)) ||
        cat.slug.toLowerCase().includes(q)
      );
    }

    if (this.activeTab() === 'Root categories') {
      items = items.filter(cat => !cat.parentCategoryId);
    } else if (this.activeTab() === 'Subcategories') {
      items = items.filter(cat => cat.parentCategoryId);
    }

    return items;
  });

  availableParentCategories = computed(() => {
    return this.categories().filter(cat => !cat.parentCategoryId);
  });

  canCreateCategory = computed(() => {
    return this.newName().trim().length > 0;
  });

  loadCategories(): void {
    this.isLoading.set(true);
    this.categoryApi.getCategories().pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (categories: CategoryApiResponse[]) => {
        this.categories.set(categories);
      },
      error: (error: any) => {
        console.error('Failed to load categories:', error);
        // TODO: Show error toast
      }
    });
  }

  onSearch(e: Event) {
    this.query.set((e.target as HTMLInputElement).value);
  }

  openCreateDialog(): void {
    this.showCreateDialog.set(true);
    this.resetForm();
  }

  closeCreateDialog(): void {
    this.showCreateDialog.set(false);
    this.resetForm();
  }

  resetForm(): void {
    this.newName.set('');
    this.newDescription.set('');
    this.newParentId.set('');
    this.selectedIconFile.set(null);
    this.iconPreview.set('');
  }

  onIconSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedIconFile.set(file);
      const reader = new FileReader();
      reader.onload = () => {
        this.iconPreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeIcon(): void {
    this.selectedIconFile.set(null);
    this.iconPreview.set('');
  }

  createCategory(): void {
    const name = this.newName().trim();
    if (!name) return;

    this.isCreating.set(true);
    
    const createCategory$ = this.selectedIconFile() 
      ? this.uploadIconAndCreateCategory()
      : this.createCategoryWithoutIcon();

    createCategory$.pipe(
      finalize(() => this.isCreating.set(false))
    ).subscribe({
      next: (category: CategoryApiResponse) => {
        this.categories.update(current => [category, ...current]);
        this.closeCreateDialog();
        // TODO: Show success toast
      },
      error: (error: any) => {
        console.error('Failed to create category:', error);
        // TODO: Show error toast
      }
    });
  }

  private uploadIconAndCreateCategory() {
    const file = this.selectedIconFile()!;
    
    return this.categoryApi.createIconUploadUrl(file.name, file.type).pipe(
      switchMap((uploadResponse: PresignedUploadResponse) => {
        return this.categoryApi.uploadIconToPresignedUrl(uploadResponse.uploadUrl, file).pipe(
          switchMap(() => {
            const payload: CreateCategoryPayload = {
              name: this.newName().trim(),
              description: this.newDescription().trim() || undefined,
              parentCategoryId: this.newParentId() || undefined,
              icon: uploadResponse.objectKey
            };
            return this.categoryApi.createCategory(payload);
          })
        );
      })
    );
  }

  private createCategoryWithoutIcon() {
    const payload: CreateCategoryPayload = {
      name: this.newName().trim(),
      description: this.newDescription().trim() || undefined,
      parentCategoryId: this.newParentId() || undefined
    };
    
    return this.categoryApi.createCategory(payload);
  }
}
