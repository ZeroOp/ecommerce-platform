import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SellerOrdersComponent } from '../seller/seller-orders.component';

@Component({
  selector: 'rs-admin-orders',
  standalone: true,
  imports: [SellerOrdersComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<rs-seller-orders></rs-seller-orders>`,
})
export class AdminOrdersComponent {}
