import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Product, PRODUCTS_DATA } from '../../data/products.data';
import { CategoryData, CATEGORIES_DATA } from '../../data/category.data';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './products.html',
  styleUrls: ['./products.scss']
})
export class ProductsComponent implements OnInit {
  categoryId: string = '';
  subcategoryId: string | null = null;
  brandId: string | null = null;
  minPrice: number | null = null;
  maxPrice: number | null = null;
  
  categoryData: CategoryData | null = null;
  products: Product[] = [];
  filteredProducts: Product[] = [];
  
  viewMode: 'grid' | 'list' = 'grid';
  Math = Math;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.categoryId = params['categoryId'];
      this.subcategoryId = params['subcategoryId'] || null;
      
      this.loadCategoryData();
      this.loadProducts();
      this.applyFilters();
    });

    this.route.queryParams.subscribe(queryParams => {
      this.brandId = queryParams['brand'] || null;
      this.minPrice = queryParams['minPrice'] ? Number(queryParams['minPrice']) : null;
      this.maxPrice = queryParams['maxPrice'] ? Number(queryParams['maxPrice']) : null;
      
      this.applyFilters();
    });
  }

  private loadCategoryData() {
    this.categoryData = CATEGORIES_DATA[this.categoryId] || null;
  }

  private loadProducts() {
    this.products = PRODUCTS_DATA[this.categoryId] || [];
    this.filteredProducts = [...this.products];
  }

  private applyFilters() {
    this.filteredProducts = this.products.filter(product => {
      let matches = true;
      
      // Filter by subcategory
      if (this.subcategoryId) {
        // For now, we'll assume all products match the subcategory
        // In a real app, products would have subcategory field
      }
      
      // Filter by brand
      if (this.brandId) {
        matches = matches && product.brand.toLowerCase().replace(/\s+/g, '-') === this.brandId;
      }
      
      // Filter by price range
      if (this.minPrice !== null) {
        matches = matches && product.price >= this.minPrice;
      }
      if (this.maxPrice !== null && this.maxPrice !== 9999) {
        matches = matches && product.price <= this.maxPrice;
      }
      
      return matches;
    });
  }

  sortBy(criteria: 'popular' | 'price-low' | 'price-high' | 'rating') {
    switch (criteria) {
      case 'price-low':
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        this.filteredProducts.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
      default:
        this.filteredProducts.sort((a, b) => b.reviews - a.reviews);
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

  getPageTitle(): string {
    if (this.subcategoryId && this.categoryData) {
      const subcategory = this.categoryData.subcategories.find(sub => sub.id === this.subcategoryId);
      return subcategory ? subcategory.name : 'Products';
    }
    if (this.categoryData) {
      return this.categoryData.name;
    }
    return 'Products';
  }

  getPageDescription(): string {
    if (this.subcategoryId && this.categoryData) {
      const subcategory = this.categoryData.subcategories.find(sub => sub.id === this.subcategoryId);
      return subcategory ? subcategory.description : '';
    }
    if (this.categoryData) {
      return this.categoryData.description;
    }
    return '';
  }

  clearFilters() {
    this.brandId = null;
    this.minPrice = null;
    this.maxPrice = null;
    
    // Clear query parameters
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });
    
    // Re-apply filters
    this.applyFilters();
  }
}
