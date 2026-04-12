import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Product, PRODUCTS_DATA } from '../../data/products.data';
import { CategoryData, CATEGORIES_DATA, SubCategory, Brand, PriceRange } from '../../data/category.data';
import { SubcategoryCardComponent } from '../../components/category/subcategory-card/subcategory-card';
import { BrandSectionComponent } from '../../components/category/brand-section/brand-section';
import { PriceFilterComponent } from '../../components/category/price-filter/price-filter';

@Component({
  selector: 'app-base-category',
  standalone: true,
  imports: [CommonModule, SubcategoryCardComponent, BrandSectionComponent, PriceFilterComponent],
  templateUrl: './base-category.html',
  styleUrls: ['./base-category.scss']
})
export class BaseCategoryComponent implements OnInit {
  @Input() categoryName: string = '';
  @Input() categoryDescription: string = '';
  @Input() categoryIcon: string = '';
  
  categoryData: CategoryData | null = null;
  Math = Math; // Make Math available in template

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Get category name from route if not provided as input
    if (!this.categoryName) {
      this.route.paramMap.subscribe(params => {
        this.categoryName = params.get('name') || 'Category';
        this.loadCategoryData();
      });
    } else {
      this.loadCategoryData();
    }
  }

  private loadCategoryData() {
    // Get category data
    const categoryKey = this.categoryName.toLowerCase();
    this.categoryData = CATEGORIES_DATA[categoryKey] || null;
    
    // Update category info if not provided
    if (this.categoryData && !this.categoryDescription) {
      this.categoryDescription = this.categoryData.description;
    }
    if (this.categoryData && !this.categoryIcon) {
      this.categoryIcon = this.categoryData.icon;
    }
  }
}
