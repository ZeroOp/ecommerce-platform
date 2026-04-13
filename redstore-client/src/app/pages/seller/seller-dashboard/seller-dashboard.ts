import { Component, OnInit } from '@angular/core';
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
export class SellerDashboardComponent implements OnInit {
  currentTab: string = 'dashboard';

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
  }

  navigateToDashboard() {
    this.currentTab = 'dashboard';
    this.router.navigate(['/seller']);
  }

  navigateToProducts() {
    this.currentTab = 'products';
    this.router.navigate(['/seller/products']);
  }

  navigateToOrders() {
    this.currentTab = 'orders';
    this.router.navigate(['/seller/orders']);
  }

  navigateToAnalytics() {
    this.currentTab = 'analytics';
    this.router.navigate(['/seller/analytics']);
  }

  navigateToSettings() {
    this.currentTab = 'settings';
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
