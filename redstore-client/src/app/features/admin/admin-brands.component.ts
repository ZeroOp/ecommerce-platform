import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { BadgeComponent, BadgeTone } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { BrandApiService, BrandApiResponse } from '../../core/services/brand-api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'rs-admin-brands',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, BadgeComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <rs-page-header
      eyebrow="Catalog"
      title="Brands"
      subtitle="Approve new brands, reject applications, or suspend a brand to block new product listings."
    ></rs-page-header>

    <div class="toolbar">
      <label>
        Filter
        <select [value]="statusFilter()" (change)="statusFilter.set(($any($event.target)).value); reload()">
          <option value="">All</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </label>
      <rs-button variant="secondary" (click)="reload()">Refresh</rs-button>
    </div>

    <div class="grid" *ngIf="!loading(); else loadingTpl">
      <article *ngFor="let b of brands()" class="card">
        <header>
          <img *ngIf="b.logoUrl" [src]="b.logoUrl" [alt]="b.name" class="logo-img" />
          <div *ngIf="!b.logoUrl" class="logo-fallback">{{ b.name.charAt(0) }}</div>
          <rs-badge [tone]="toneFor(b.status)" [soft]="true">{{ b.status }}</rs-badge>
        </header>
        <h3>{{ b.name }}</h3>
        <p class="desc">{{ b.description }}</p>
        <div class="meta">
          <span>Seller: {{ b.sellerId }}</span>
        </div>
        <footer>
          <rs-button
            *ngIf="b.status === 'PENDING'"
            variant="primary"
            (click)="setStatus(b, 'APPROVED')"
            [disabled]="busyId() === b.id"
            >Approve</rs-button
          >
          <rs-button
            *ngIf="b.status === 'PENDING'"
            variant="secondary"
            (click)="setStatus(b, 'REJECTED')"
            [disabled]="busyId() === b.id"
            >Reject</rs-button
          >
          <rs-button
            *ngIf="b.status === 'APPROVED'"
            variant="secondary"
            (click)="setStatus(b, 'SUSPENDED')"
            [disabled]="busyId() === b.id"
            >Suspend</rs-button
          >
          <rs-button
            *ngIf="b.status === 'SUSPENDED' || b.status === 'REJECTED'"
            variant="primary"
            (click)="setStatus(b, 'APPROVED')"
            [disabled]="busyId() === b.id"
            >Approve</rs-button
          >
        </footer>
      </article>
    </div>
    <ng-template #loadingTpl>
      <p class="muted">Loading brands…</p>
    </ng-template>
  `,
  styles: [
    `
      .toolbar {
        display: flex;
        gap: 12px;
        align-items: flex-end;
        margin-bottom: 16px;
        flex-wrap: wrap;
      }
      .toolbar label {
        display: grid;
        gap: 6px;
        font-size: 12px;
        font-weight: 600;
        color: var(--rs-text-subtle);
      }
      .toolbar select {
        min-width: 180px;
        padding: 8px 10px;
        border-radius: var(--rs-radius-md);
        border: 1px solid var(--rs-border);
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 14px;
      }
      .card {
        background: white;
        border: 1px solid var(--rs-border);
        border-radius: var(--rs-radius-lg);
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .card header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 10px;
      }
      .logo-img {
        width: 48px;
        height: 48px;
        border-radius: var(--rs-radius-md);
        object-fit: cover;
        background: var(--rs-surface-2);
      }
      .logo-fallback {
        width: 48px;
        height: 48px;
        border-radius: var(--rs-radius-md);
        background: var(--rs-surface-2);
        display: grid;
        place-items: center;
        font-weight: 800;
        color: var(--rs-text-muted);
      }
      .card h3 {
        font-size: 17px;
        font-weight: 800;
        margin: 0;
      }
      .desc {
        color: var(--rs-text-muted);
        font-size: 13px;
        line-height: 1.45;
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .meta {
        font-size: 11px;
        color: var(--rs-text-subtle);
        word-break: break-all;
      }
      footer {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 8px;
      }
      .muted {
        color: var(--rs-text-muted);
      }
    `,
  ],
})
export class AdminBrandsComponent {
  private brandApi = inject(BrandApiService);
  private toast = inject(ToastService);

  brands = signal<BrandApiResponse[]>([]);
  loading = signal(false);
  busyId = signal<string | null>(null);
  statusFilter = signal('');

  constructor() {
    this.reload();
  }

  toneFor(status: string): BadgeTone {
    if (status === 'APPROVED') {
      return 'success';
    }
    if (status === 'PENDING') {
      return 'warning';
    }
    return 'danger';
  }

  reload(): void {
    this.loading.set(true);
    const st = this.statusFilter().trim();
    this.brandApi.getAllBrands(st ? { status: st } : {}).subscribe({
      next: (rows) => {
        this.brands.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Could not load brands');
        this.loading.set(false);
      },
    });
  }

  setStatus(b: BrandApiResponse, status: string): void {
    this.busyId.set(b.id);
    this.brandApi.patchBrandStatus(b.id, status).subscribe({
      next: () => {
        this.toast.success('Brand updated', b.name);
        this.reload();
        this.busyId.set(null);
      },
      error: () => {
        this.toast.error('Update failed');
        this.busyId.set(null);
      },
    });
  }
}
