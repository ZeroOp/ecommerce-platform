import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BRANDS } from '../../data/mock-brands';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { BadgeComponent, BadgeTone } from '../../shared/components/badge/badge.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { RatingComponent } from '../../shared/components/rating/rating.component';
import { BrandApiService } from '../../core/services/brand-api.service';
import { ToastService } from '../../core/services/toast.service';

interface BrandView {
  id: string;
  name: string;
  description: string;
  logo: string;
  logoUrl: string | null;
  categories: string[];
  rating: number;
  productCount: number;
  status: 'active' | 'pending' | 'suspended';
}

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
          <div class="brand__logo">
            <img *ngIf="b.logoUrl" [src]="b.logoUrl" [alt]="b.name" />
            <span *ngIf="!b.logoUrl">{{ b.logo }}</span>
          </div>
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
        <label>
          Brand logo image (optional)
          <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" (change)="onLogoFileChange($event)" />
        </label>
        <div class="dialog__actions">
          <rs-button variant="secondary" (click)="closeCreateDialog()">Cancel</rs-button>
          <rs-button variant="primary" [loading]="creating()" (click)="createBrand()">Create</rs-button>
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
    .brand__logo img { width: 100%; height: 100%; object-fit: cover; border-radius: inherit; }
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
export class SellerBrandsComponent implements OnInit {
  private brandApi = inject(BrandApiService);
  private toast = inject(ToastService);

  brands = signal<BrandView[]>(
    BRANDS.map((b) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      logo: this.logoFallback(b.logo),
      logoUrl: this.resolveLogoUrl(b.logo),
      categories: b.categories ?? [],
      rating: b.rating,
      productCount: b.productCount,
      status: b.status ?? 'pending',
    }))
  );
  showCreateDialog = signal(false);
  creating = signal(false);
  newName = signal('');
  newDescription = signal('');
  newLogo = signal('🏷️');
  selectedLogoFile = signal<File | null>(null);

  ngOnInit(): void {
    this.loadBrands();
  }

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

  onLogoFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.selectedLogoFile.set(file);
  }

  private loadBrands(): void {
    this.brandApi.getMyBrands().subscribe({
      next: (brands) => {
        this.brands.set(
          brands.map((b) => ({
            id: b.id,
            name: b.name,
            description: b.description,
            logo: this.logoFallback(b.logo),
            logoUrl: b.logoUrl || this.resolveLogoUrl(b.logo),
            categories: b.categoryIds ?? [],
            rating: 0,
            productCount: 0,
            status: this.normalizeStatus(b.status),
          }))
        );
      },
      error: () => {
        this.toast.warning('Could not load brands', 'Showing local data fallback.');
      },
    });
  }

  createBrand(): void {
    const name = this.newName().trim();
    if (!name) return;
    this.creating.set(true);
    const doCreate = (logoValue?: string) => {
      this.brandApi.createBrand({
        name,
        description: this.newDescription().trim() || 'New brand created from Seller Hub.',
        logo: logoValue || this.newLogo().trim() || undefined,
        categoryIds: [],
      }).subscribe({
        next: (created) => {
          this.brands.update((current) => ([
            {
              id: created.id,
              name: created.name,
              description: created.description,
              logo: this.logoFallback(created.logo),
              logoUrl: created.logoUrl || this.resolveLogoUrl(created.logo),
              categories: created.categoryIds ?? [],
              rating: 0,
              productCount: 0,
              status: this.normalizeStatus(created.status),
            },
            ...current,
          ]));
          this.toast.success('Brand created', created.name);
          this.newName.set('');
          this.newDescription.set('');
          this.newLogo.set('🏷️');
          this.selectedLogoFile.set(null);
          this.creating.set(false);
          this.closeCreateDialog();
        },
        error: (err) => {
          this.creating.set(false);
          this.toast.error('Failed to create brand', err?.error?.errors?.[0]?.message || 'Please try again.');
        },
      });
    };

    const file = this.selectedLogoFile();
    if (!file) {
      doCreate();
      return;
    }

    this.brandApi.createLogoUploadUrl(file.name, file.type).subscribe({
      next: (presigned) => {
        this.brandApi.uploadLogoToPresignedUrl(presigned.uploadUrl, file).subscribe({
          next: () => doCreate(presigned.objectKey),
          error: () => {
            this.creating.set(false);
            this.toast.error('Logo upload failed', 'Could not upload selected image.');
          },
        });
      },
      error: () => {
        this.creating.set(false);
        this.toast.error('Could not get upload URL', 'Please try again.');
      },
    });
  }

  private normalizeStatus(status?: string): 'pending' | 'active' | 'suspended' {
    const raw = (status || '').toUpperCase();
    if (raw === 'APPROVED' || raw === 'ACTIVE') return 'active';
    if (raw === 'SUSPENDED') return 'suspended';
    return 'pending';
  }

  private resolveLogoUrl(logo?: string | null): string | null {
    if (!logo) return null;
    const raw = logo.trim();
    if (!raw) return null;
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
    if (raw.startsWith('brand-logos/')) return `/redstore-main/${raw}`;
    if (raw.startsWith('/redstore-main/')) return raw;
    return null;
  }

  private logoFallback(logo?: string | null): string {
    const raw = (logo || '').trim();
    if (!raw) return '🏷️';
    if (this.resolveLogoUrl(raw)) return '🏷️';
    return raw;
  }
}
