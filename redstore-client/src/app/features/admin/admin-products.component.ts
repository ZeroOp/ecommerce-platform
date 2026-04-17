import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SellerProductsComponent } from '../seller/seller-products.component';

@Component({
  selector: 'rs-admin-products',
  standalone: true,
  imports: [SellerProductsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<rs-seller-products></rs-seller-products>`,
})
export class AdminProductsComponent {}
