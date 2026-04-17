import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'rs-seller-settings',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, InputComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <rs-page-header eyebrow="Preferences" title="Settings" subtitle="Manage your store, payouts and account preferences."></rs-page-header>

    <div class="layout">
      <aside class="tabs">
        <button *ngFor="let t of tabs" [class.is-active]="tab() === t" (click)="tab.set(t)">{{ t }}</button>
      </aside>
      <section class="card">
        <header><h3>{{ tab() }}</h3></header>

        <ng-container *ngIf="tab() === 'Store'">
          <div class="row row--2">
            <rs-input label="Store name" placeholder="RedStore Apparel Co."></rs-input>
            <rs-input label="Support email" placeholder="support@redstore.io" type="email"></rs-input>
          </div>
          <div class="row"><rs-input label="Store description" placeholder="Tell customers about your store"></rs-input></div>
        </ng-container>

        <ng-container *ngIf="tab() === 'Payouts'">
          <div class="row row--2">
            <rs-input label="Bank name" placeholder="Chase"></rs-input>
            <rs-input label="Account number" placeholder="•••• 0242"></rs-input>
          </div>
          <div class="row"><rs-input label="Routing" placeholder="021000021"></rs-input></div>
        </ng-container>

        <ng-container *ngIf="tab() === 'Notifications'">
          <label class="switch"><input type="checkbox" checked/><span>Order alerts</span></label>
          <label class="switch"><input type="checkbox" checked/><span>Weekly revenue summary</span></label>
          <label class="switch"><input type="checkbox"/><span>Product out-of-stock alerts</span></label>
        </ng-container>

        <ng-container *ngIf="tab() === 'Security'">
          <div class="row row--2">
            <rs-input label="Current password" type="password" placeholder="••••••"></rs-input>
            <rs-input label="New password" type="password" placeholder="New strong password"></rs-input>
          </div>
          <label class="switch"><input type="checkbox"/><span>Two-factor authentication</span></label>
        </ng-container>

        <footer>
          <rs-button variant="primary">Save changes</rs-button>
          <rs-button variant="ghost">Cancel</rs-button>
        </footer>
      </section>
    </div>
  `,
  styles: [`
    .layout { display: grid; grid-template-columns: 220px 1fr; gap: 20px; }
    .tabs { display: flex; flex-direction: column; gap: 2px; }
    .tabs button { padding: 10px 14px; border-radius: 10px; color: var(--rs-text-muted); text-align: left; font-size: 13px; font-weight: 600; }
    .tabs button:hover { background: white; color: var(--rs-text); }
    .tabs button.is-active { background: white; color: var(--rs-text); box-shadow: var(--rs-shadow-xs); border: 1px solid var(--rs-border); }
    .card { background: white; border: 1px solid var(--rs-border); border-radius: var(--rs-radius-lg); padding: 24px; display: flex; flex-direction: column; gap: 14px; }
    .card header h3 { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
    .row { display: flex; gap: 12px; }
    .row--2 { display: grid; grid-template-columns: 1fr 1fr; }
    .switch { display: flex; align-items: center; justify-content: space-between; padding: 14px; background: var(--rs-surface-2); border-radius: 10px; font-size: 13px; font-weight: 600; }
    .switch input { accent-color: var(--rs-brand-600); width: 18px; height: 18px; }
    footer { display: flex; gap: 8px; margin-top: 8px; }
    @media (max-width: 700px) { .layout { grid-template-columns: 1fr; } }
  `],
})
export class SellerSettingsComponent {
  tabs = ['Store', 'Payouts', 'Notifications', 'Security'];
  tab = signal('Store');
}
