import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss']
})
export class AdminDashboardComponent {
  
  constructor(private router: Router, private authService: AuthService) {}

  navigateToUsers() {
    this.router.navigate(['/admin/users']);
  }

  navigateToProducts() {
    this.router.navigate(['/admin/products']);
  }

  navigateToOrders() {
    this.router.navigate(['/admin/orders']);
  }

  navigateToSellers() {
    this.router.navigate(['/admin/sellers']);
  }

  navigateToAnalytics() {
    this.router.navigate(['/admin/analytics']);
  }

  navigateToSettings() {
    this.router.navigate(['/admin/settings']);
  }

  logout() {
    this.authService.logout();
  }

  handleLogout(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    console.log('Logout clicked, preventing default behavior');
    this.authService.logout();
  }
}
