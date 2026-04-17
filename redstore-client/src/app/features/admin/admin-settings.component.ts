import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SellerSettingsComponent } from '../seller/seller-settings.component';

@Component({
  selector: 'rs-admin-settings',
  standalone: true,
  imports: [SellerSettingsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<rs-seller-settings></rs-seller-settings>`,
})
export class AdminSettingsComponent {}
