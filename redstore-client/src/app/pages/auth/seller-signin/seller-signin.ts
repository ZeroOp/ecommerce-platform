import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

// This prevents TypeScript from complaining that 'google' doesn't exist
declare const google: any;

@Component({
  selector: 'app-seller-signin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seller-signin.html',
  styleUrls: ['./seller-signin.scss']
})
export class SellerSigninComponent implements OnInit {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

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
    
    // Call seller-specific login endpoint with real Google token
    this.authService.loginWithGoogle(idToken, 'seller').subscribe({
      next: (res) => {
        console.log('Google Sign-In successful:', res);
        if (res.user.userRole === 'seller') {
          this.router.navigate(['/seller']);
        } else {
          this.errorMessage = 'This login is for sellers only. Please use the correct login page.';
        }
      },
      error: (err) => {
        console.error('Google Sign-In failed:', err);
        this.errorMessage = 'Failed to sign in with Google. Please try again.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onLoginSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter email and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Call seller-specific login endpoint
    this.authService.login(this.email, this.password, 'seller').subscribe({
      next: (response) => {
        if (response.user.userRole === 'seller') {
          this.router.navigate(['/seller']);
        } else {
          this.errorMessage = 'This login is for sellers only. Please use the correct login page.';
        }
      },
      error: (error) => {
        this.errorMessage = 'Login failed. Please check your credentials.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  navigateToUserLogin() {
    this.router.navigate(['/auth/signin']);
  }

  navigateToAdminLogin() {
    this.router.navigate(['/auth/admin-signin']);
  }

  requestSellerAccount() {
    // Navigate to seller account request page
    this.router.navigate(['/auth/request-seller']);
  }
}
