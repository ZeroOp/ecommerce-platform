import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss']
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
  
  constructor(private router: Router) {}

  subscribeToNewsletter(email: string) {
    if (email && email.includes('@')) {
      // Here you would typically call an API to subscribe
      console.log('Subscribing to newsletter with email:', email);
      alert('Thank you for subscribing to our newsletter!');
      // Clear the input
      const input = document.querySelector('.newsletter-input') as HTMLInputElement;
      if (input) {
        input.value = '';
      }
    } else {
      alert('Please enter a valid email address.');
    }
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  socialLinks = [
    { name: 'Facebook', icon: 'facebook', url: '#' },
    { name: 'Twitter', icon: 'twitter', url: '#' },
    { name: 'Instagram', icon: 'instagram', url: '#' },
    { name: 'LinkedIn', icon: 'linkedin', url: '#' }
  ];

  customerService = [
    { name: 'Contact Us', path: '/contact' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Shipping & Returns', path: '/shipping' },
    { name: 'Order Tracking', path: '/tracking' },
    { name: 'Product Care', path: '/product-care' }
  ];

  aboutCompany = [
    { name: 'About RedStore', path: '/about' },
    { name: 'Careers', path: '/careers' },
    { name: 'Press', path: '/press' },
    { name: 'Sustainability', path: '/sustainability' },
    { name: 'Investors', path: '/investors' }
  ];

  shoppingCategories = [
    { name: 'New Arrivals', path: '/new-arrivals' },
    { name: 'Best Sellers', path: '/best-sellers' },
    { name: 'Sale', path: '/sale' },
    { name: 'Gift Cards', path: '/gift-cards' },
    { name: 'Store Locator', path: '/stores' }
  ];

  legalInfo = [
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Cookie Policy', path: '/cookies' },
    { name: 'Accessibility', path: '/accessibility' }
  ];
}
