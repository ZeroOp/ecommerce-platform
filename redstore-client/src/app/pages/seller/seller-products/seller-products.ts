import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductDialogComponent } from '../../../components/product-dialog/product-dialog';

@Component({
  selector: 'app-seller-products',
  standalone: true,
  imports: [CommonModule, ProductDialogComponent],
  templateUrl: './seller-products.html',
  styleUrls: ['./seller-products.scss']
})
export class SellerProductsComponent implements OnInit {
  products: any[] = [];
  isDialogOpen: boolean = false;

  ngOnInit() {
    // Initialize with mock data
    this.products = [
      { id: 1, name: 'Running Shoes', brand: 'Nike', price: 99.99, status: 'active' },
      { id: 2, name: 'Sports T-Shirt', brand: 'Adidas', price: 49.99, status: 'active' },
      { id: 3, name: 'Wireless Headphones', brand: 'Sony', price: 199.99, status: 'active' },
      { id: 4, name: 'Smart Watch', brand: 'Apple', price: 399.99, status: 'inactive' }
    ];
  }

  openProductDialog() {
    console.log('Opening product dialog...');
    this.isDialogOpen = true;
  }

  closeDialog() {
    this.isDialogOpen = false;
  }
}
