import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrandDialogComponent } from '../../../components/brand-dialog/brand-dialog';

@Component({
  selector: 'app-seller-brands',
  standalone: true,
  imports: [CommonModule, BrandDialogComponent],
  templateUrl: './seller-brands.html',
  styleUrls: ['./seller-brands.scss']
})
export class SellerBrandsComponent {
  isDialogOpen: boolean = false;

  openBrandDialog() {
    console.log('Opening brand dialog...');
    this.isDialogOpen = true;
  }

  closeDialog() {
    this.isDialogOpen = false;
  }
}
