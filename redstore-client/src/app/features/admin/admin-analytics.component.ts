import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SellerAnalyticsComponent } from '../seller/seller-analytics.component';

@Component({
  selector: 'rs-admin-analytics',
  standalone: true,
  imports: [SellerAnalyticsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<rs-seller-analytics></rs-seller-analytics>`,
})
export class AdminAnalyticsComponent {}
