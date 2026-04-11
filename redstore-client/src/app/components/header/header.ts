import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;
  isProfileDropdownOpen = false;
  searchQuery = '';
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.checkCurrentUser();
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  checkCurrentUser() {
    this.http.get<User | null>('/api/users/currentuser', { withCredentials: true })
      .subscribe({
        next: (user) => {
          // Check if user object has valid data (not just null values)
          const isValidUser = user && user.email && user.id;
          this.currentUser = isValidUser ? user : null;
          
          if (isValidUser) {
            this.authService['currentUserSubject'].next(user);
          } else {
            this.authService['currentUserSubject'].next(null);
          }
        },
        error: (error) => {
          // Handle connection errors gracefully - assume user is not logged in
          this.currentUser = null;
          this.authService['currentUserSubject'].next(null);
        }
      });
  }

  toggleProfileDropdown() {
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
  }

  closeProfileDropdown() {
    this.isProfileDropdownOpen = false;
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
      this.searchQuery = '';
    }
  }

  navigateToCart() {
    this.router.navigate(['/cart']);
  }

  navigateToOrders() {
    this.router.navigate(['/orders']);
  }

  navigateToWishlist() {
    this.router.navigate(['/wishlist']);
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    this.authService.logout();
    this.currentUser = null; // Clear local user state too!
    this.closeProfileDropdown();
  }

  navigateToLogin() {
    this.router.navigate(['/auth/signin']);
    this.closeProfileDropdown();
  }

  navigateToSignup() {
    this.router.navigate(['/auth/signup']);
    this.closeProfileDropdown();
  }
}
