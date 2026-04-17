import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { AdminSellerApiService, AdminSellerRow } from '../../core/services/admin-seller-api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'rs-admin-sellers',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, BadgeComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <rs-page-header
      eyebrow="Marketplace"
      title="Sellers"
      subtitle="Suspend a seller to block new products while they can still sign in and view the dashboard."
    ></rs-page-header>

    <div class="toolbar">
      <rs-button variant="secondary" (click)="reload()">Refresh</rs-button>
    </div>

    <div class="grid" *ngIf="!loading(); else loadingTpl">
      <article *ngFor="let s of sellers()" class="card">
        <header>
          <div>
            <h3>{{ s.email }}</h3>
            <p class="sub">ID: {{ s.userId }}</p>
          </div>
          <rs-badge [tone]="s.active ? 'success' : 'danger'" [soft]="true">{{ s.active ? 'Active' : 'Suspended' }}</rs-badge>
        </header>
        <footer>
          <rs-button
            *ngIf="s.active"
            variant="secondary"
            (click)="setActive(s, false)"
            [disabled]="busyEmail() === s.email"
            >Suspend seller</rs-button
          >
          <rs-button
            *ngIf="!s.active"
            variant="primary"
            (click)="setActive(s, true)"
            [disabled]="busyEmail() === s.email"
            >Reactivate</rs-button
          >
        </footer>
      </article>
    </div>
    <ng-template #loadingTpl>
      <p class="muted">Loading sellers…</p>
    </ng-template>
  `,
  styles: [
    `
      .toolbar {
        margin-bottom: 16px;
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
        gap: 12px;
      }
      .card header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 10px;
      }
      .card h3 {
        font-size: 16px;
        font-weight: 800;
        margin: 0;
        word-break: break-all;
      }
      .sub {
        font-size: 11px;
        color: var(--rs-text-subtle);
        margin: 4px 0 0;
        word-break: break-all;
      }
      footer {
        display: flex;
        gap: 8px;
      }
      .muted {
        color: var(--rs-text-muted);
      }
    `,
  ],
})
export class AdminSellersComponent {
  private api = inject(AdminSellerApiService);
  private toast = inject(ToastService);

  sellers = signal<AdminSellerRow[]>([]);
  loading = signal(false);
  busyEmail = signal<string | null>(null);

  constructor() {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.api.listSellers().subscribe({
      next: (rows) => {
        this.sellers.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Could not load sellers (is identity running on 8081 for local proxy?)');
        this.loading.set(false);
      },
    });
  }

  setActive(s: AdminSellerRow, active: boolean): void {
    this.busyEmail.set(s.email);
    this.api.setSellerActive(s.email, active).subscribe({
      next: () => {
        this.toast.success(active ? 'Seller reactivated' : 'Seller suspended', s.email);
        this.reload();
        this.busyEmail.set(null);
      },
      error: () => {
        this.toast.error('Update failed');
        this.busyEmail.set(null);
      },
    });
  }
}
