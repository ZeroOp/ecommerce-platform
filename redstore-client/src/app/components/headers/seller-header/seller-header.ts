import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-seller-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seller-header.html',
  styleUrls: ['./seller-header.scss']
})
export class SellerHeaderComponent {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout() {
    this.authService.logout();
  }

  handleLogout(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    console.log('Logout clicked, preventing default behavior');
    this.authService.logout();
  }

  navigateToDashboard() {
    this.router.navigate(['/seller']);
  }
}
