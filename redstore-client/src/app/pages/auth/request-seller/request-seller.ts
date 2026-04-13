import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-request-seller',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './request-seller.html',
  styleUrls: ['./request-seller.scss']
})
export class RequestSellerComponent implements OnInit {
  formData = {
    name: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: '',
    businessDescription: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  };
  
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Automatically logout any existing user when visiting request-seller page
    this.authService.logout();
  }

  onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Simulate API call to request seller account
    setTimeout(() => {
      this.isLoading = false;
      this.successMessage = 'Your seller account request has been submitted successfully! We will review your application and contact you within 3-5 business days.';
      
      // Reset form
      this.formData = {
        name: '',
        email: '',
        phone: '',
        businessName: '',
        businessType: '',
        businessDescription: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
      };
    }, 2000);
  }

  validateForm(): boolean {
    if (!this.formData.name || !this.formData.email || !this.formData.businessName) {
      this.errorMessage = 'Please fill in all required fields.';
      return false;
    }

    if (!this.isValidEmail(this.formData.email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return false;
    }

    return true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  navigateToSellerLogin() {
    this.router.navigate(['/auth/seller-signin']);
  }

  navigateToUserLogin() {
    this.router.navigate(['/auth/signin']);
  }
}
