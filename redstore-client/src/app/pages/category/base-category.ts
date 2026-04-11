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
  products: Product[] = [];
  viewMode: 'grid' | 'list' = 'grid';
  Math = Math; // Make Math available in template

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Get category name from route if not provided as input
    if (!this.categoryName) {
      this.route.paramMap.subscribe(params => {
        this.categoryName = params.get('name') || 'Category';
        this.loadCategoryData();
        this.loadProducts();
      });
    } else {
      this.loadCategoryData();
      this.loadProducts();
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

  private loadProducts() {
    // Get products for this category
    const categoryKey = this.categoryName.toLowerCase();
    this.products = PRODUCTS_DATA[categoryKey] || [];
  }

  sortBy(criteria: 'popular' | 'price-low' | 'price-high' | 'rating') {
    switch (criteria) {
      case 'price-low':
        this.products.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        this.products.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        this.products.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
      default:
        // Sort by reviews count (popularity)
        this.products.sort((a, b) => b.reviews - a.reviews);
        break;
    }
  }

  setView(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  toggleWishlist(productId: string) {
    console.log('Toggle wishlist for product:', productId);
    // TODO: Implement wishlist functionality
  }

  addToCart(product: Product) {
    console.log('Add to cart:', product.name);
    // TODO: Implement add to cart functionality
  }

  quickView(productId: string) {
    console.log('Quick view for product:', productId);
    // TODO: Implement quick view modal
  }

  loadMoreProducts() {
    console.log('Load more products');
    // TODO: Implement pagination/infinite scroll
  }
}
