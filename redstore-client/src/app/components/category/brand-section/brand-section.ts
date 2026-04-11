import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Brand } from '../../../data/category.data';

@Component({
  selector: 'app-brand-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './brand-section.html',
  styleUrls: ['./brand-section.scss']
})
export class BrandSectionComponent {
  @Input() brands: Brand[] = [];
  @Input() categoryId: string = '';
  @Input() title: string = 'Popular Brands';

  constructor(private router: Router) {}

  navigateToBrand(brand: Brand) {
    this.router.navigate(['/products', this.categoryId], { 
      queryParams: { brand: brand.id } 
    });
  }

  viewAllBrands() {
    this.router.navigate(['/brands', this.categoryId]);
  }
}
