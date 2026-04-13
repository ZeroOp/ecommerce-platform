import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seller-dashboard.html',
  styleUrls: ['./seller-dashboard.scss']
})
export class SellerDashboardComponent {
  
  constructor(private router: Router, private authService: AuthService) {}

  navigateToProducts() {
    this.router.navigate(['/seller/products']);
  }

  navigateToOrders() {
    this.router.navigate(['/seller/orders']);
  }

  navigateToAnalytics() {
    this.router.navigate(['/seller/analytics']);
  }

  navigateToSettings() {
    this.router.navigate(['/seller/settings']);
  }

  logout() {
    this.authService.logout();
  }

  handleLogout(event: Event) {
    alert('Logout button clicked!');
    event.preventDefault();
    event.stopPropagation();
    console.log('Logout clicked, preventing default behavior');
    this.authService.logout();
  }

  testClick() {
    alert('Test button clicked!');
    console.log('Test button clicked!');
  }
}
