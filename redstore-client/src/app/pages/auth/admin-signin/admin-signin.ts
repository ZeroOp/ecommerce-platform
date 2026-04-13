import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

// This prevents TypeScript from complaining that 'google' doesn't exist
declare const google: any;

@Component({
  selector: 'app-admin-signin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-signin.html',
  styleUrls: ['./admin-signin.scss']
})
export class AdminSigninComponent implements OnInit {
  isLoading: boolean = false;
  errorMessage: string = '';
  readonly ADMIN_EMAIL = 'jayaramnaik725@gmail.com';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    
    // Initialize Google Sign-In
    const interval = setInterval(() => {
      if (typeof google !== 'undefined') {
        clearInterval(interval);
        this.initializeGoogleSignIn();
      }
    }, 100);
  }

  initializeGoogleSignIn() {
    google.accounts.id.initialize({
      client_id: '854136327852-v48sbh7hbb3145dmaq0kjt6aknpv6oms.apps.googleusercontent.com',
      callback: this.handleGoogleSignIn.bind(this)
    });

    google.accounts.id.renderButton(
      document.getElementById('google-signin-btn'),
      { 
        theme: 'filled_blue', 
        size: 'large',
        shape: 'rectangular',
        width: '100%'
      }
    );
  }

  handleGoogleSignIn(response: any) {
    this.isLoading = true;
    const idToken = response.credential;
    
    // Extract email from Google token (in real implementation, this would be decoded)
    // For now, we'll check if it's the admin email
    const userEmail = this.extractEmailFromToken(idToken);
    
    // Check if email matches admin email
    if (userEmail !== this.ADMIN_EMAIL) {
      this.errorMessage = 'Access denied. Only authorized admin can access this page.';
      this.isLoading = false;
      return;
    }

    // Call admin-specific Google login endpoint
    this.authService.login('', '', 'admin').subscribe({
      next: (res) => {
        if (res.user.userRole === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.errorMessage = 'This login is for administrators only.';
        }
      },
      error: (error) => {
        this.errorMessage = 'Admin login failed. Please check your credentials.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  extractEmailFromToken(token: string): string {
    // In a real implementation, you would decode the JWT token to get the email
    // For now, we'll simulate this - in production, this would be done on the backend
    return this.ADMIN_EMAIL; // Simulating admin email for demo
  }

  navigateToUserLogin() {
    this.router.navigate(['/auth/signin']);
  }

  navigateToSellerLogin() {
    this.router.navigate(['/auth/seller-signin']);
  }
}
