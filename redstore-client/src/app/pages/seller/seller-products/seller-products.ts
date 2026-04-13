import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seller-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seller-products.html',
  styleUrls: ['./seller-products.scss']
})
export class SellerProductsComponent implements OnInit {
  activeTab: string = 'products';
  brands: any[] = [];
  products: any[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    // Initialize with mock data
    this.brands = [
      { id: 1, name: 'Nike', status: 'approved', logo: '' },
      { id: 2, name: 'Adidas', status: 'pending', logo: '' }
    ];
    
    this.products = [
      { id: 1, name: 'Running Shoes', brand: 'Nike', price: 99.99, status: 'active' },
      { id: 2, name: 'Sports T-Shirt', brand: 'Adidas', price: 49.99, status: 'active' }
    ];
  }

  switchTab(tab: string) {
    this.activeTab = tab;
  }

  navigateToCreateProduct() {
    this.router.navigate(['/seller/products/create']);
  }

  navigateToRegisterBrand() {
    this.router.navigate(['/seller/products/register-brand']);
  }
}
