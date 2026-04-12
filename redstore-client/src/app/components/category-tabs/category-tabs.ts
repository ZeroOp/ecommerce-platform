import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-category-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-tabs.html',
  styleUrls: ['./category-tabs.scss']
})
export class CategoryTabsComponent {
  
  categories = [
    { name: 'For You', icon: 'star', path: '/', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b922?w=200&h=200&fit=crop' },
    { name: 'Fashion', icon: 'shirt', path: '/category/fashion', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8b?w=200&h=200&fit=crop' },
    { name: 'Mobiles', icon: 'smartphone', path: '/category/mobiles', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop' },
    { name: 'Electronics', icon: 'laptop', path: '/category/electronics', image: 'https://images.unsplash.com/photo-1498049799929-963b8dd2aeb3?w=200&h=200&fit=crop' },
    { name: 'Appliances', icon: 'home', path: '/category/appliances', image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=200&h=200&fit=crop' },
    { name: 'Sports', icon: 'football', path: '/category/sports', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop' },
    { name: 'Books', icon: 'book', path: '/category/books', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
    { name: 'Furniture', icon: 'sofa', path: '/category/furniture', image: 'https://images.unsplash.com/photo-1586023492125-27b2c5458cca?w=200&h=200&fit=crop' },
    { name: 'Beauty', icon: 'sparkles', path: '/category/beauty', image: 'https://images.unsplash.com/photo-1596462502278-27d52b40a0b2?w=200&h=200&fit=crop' },
    { name: 'Toys', icon: 'gamepad', path: '/category/toys', image: 'https://images.unsplash.com/photo-1591733254037-e4942e77e11e?w=200&h=200&fit=crop' }
  ];

  activeCategory = 'For You';

  constructor(private router: Router) {}

  navigateToCategory(category: any) {
    this.activeCategory = category.name;
    this.router.navigate([category.path]);
  }

  getCategoryIcon(iconName: string): string {
    const icons: { [key: string]: string } = {
      'star': 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
      'shirt': 'M7 2a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H7zm0 2h10v1H7V4zm0 4l-2 2 2 2v4a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-4l2-2-2-2H7z',
      'smartphone': 'M7 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H7zm0 2h10v16H7V4zm5 14a1 1 0 1 1 0-2 1 1 0 0 1 0 2z',
      'laptop': 'M4 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4zm2 0h12v10H6V4zm-4 14h16a1 1 0 0 1 0 2H2a1 1 0 0 1 0-2z',
      'home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9zm2 0l7-5.5L19 9v10H5V9z',
      'football': 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm0 4a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0V9a1 1 0 0 0-1-1zm0 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z',
      'book': 'M4 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4zm2 0h16v16H6V4zm2 2h12v2H8V6zm0 4h12v2H8v-2zm0 4h8v2H8v-2z',
      'sofa': 'M4 8a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H4zm0 2h16v4H4v-4zm-2 8h20a1 1 0 0 1 0 2H2a1 1 0 0 1 0-2z',
      'sparkles': 'M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.3L12 17l-6.2 4.2L8 14l-6.2-4.6H9.6L12 2zM9 15l3-2 3 2-1-3 2-2h-3l-1-3-1 3H8l2 2-1 3z',
      'gamepad': 'M5 8a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5zm0 2h14v4H5v-4zm3 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm8 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z'
    };
    return icons[iconName] || icons['star'];
  }
}
