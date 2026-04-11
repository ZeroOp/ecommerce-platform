import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

// This prevents TypeScript from complaining that 'google' doesn't exist
declare const google: any;

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  errorMessage = '';
  successMessage = '';
  passwordStrength = 0;
  passwordStrengthText = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      agreeToTerms: [false, [Validators.requiredTrue]],
      newsletter: [false]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit() {
    // Initialize Google Sign-Up
    const interval = setInterval(() => {
      if (typeof google !== 'undefined') {
        clearInterval(interval);
        this.initializeGoogleSignUp();
      }
    }, 100);
  }

  initializeGoogleSignUp() {
    google.accounts.id.initialize({
      client_id: '854136327852-v48sbh7hbb3145dmaq0kjt6aknpv6oms.apps.googleusercontent.com',
      callback: this.handleGoogleSignUp.bind(this)
    });

    google.accounts.id.renderButton(
      document.getElementById('google-signup-btn'),
      { 
        theme: 'filled_blue', 
        size: 'large',
        shape: 'rectangular',
        width: '100%'
      }
    );
  }

  handleGoogleSignUp(response: any) {
    this.isLoading = true;
    const idToken = response.credential;
    
    this.http.post('/api/users/google', { token: idToken }, { withCredentials: true })
      .subscribe({
        next: (res: any) => {
          console.log('Google Sign-Up successful:', res);
          this.successMessage = 'Account created successfully! Redirecting...';
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1500);
        },
        error: (err) => {
          console.error('Google Sign-Up failed:', err);
          this.errorMessage = 'Failed to create account with Google. Please try again.';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onPasswordChange() {
    const password = this.signupForm.get('password')?.value || '';
    this.calculatePasswordStrength(password);
  }

  calculatePasswordStrength(password: string) {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    
    // Character variety checks
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    this.passwordStrength = (strength / 6) * 100;
    
    if (this.passwordStrength <= 33) {
      this.passwordStrengthText = 'Weak';
    } else if (this.passwordStrength <= 66) {
      this.passwordStrengthText = 'Medium';
    } else {
      this.passwordStrengthText = 'Strong';
    }
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { firstName, lastName, email, password, newsletter } = this.signupForm.value;

    // Regular email/password sign-up
    this.http.post('/api/users/signup', { 
      firstName, 
      lastName, 
      email, 
      password, 
      newsletter 
    }, { withCredentials: true })
      .subscribe({
        next: (res: any) => {
          console.log('Sign-up successful:', res);
          this.successMessage = 'Account created successfully! Please check your email for verification.';
          setTimeout(() => {
            this.router.navigate(['/auth/signin']);
          }, 2000);
        },
        error: (err) => {
          console.error('Sign-up failed:', err);
          this.errorMessage = err.error?.message || 'Failed to create account. Please try again.';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  navigateToSignin() {
    this.router.navigate(['/auth/signin']);
  }

  // Form getters for template access
  get firstName() { return this.signupForm.get('firstName'); }
  get lastName() { return this.signupForm.get('lastName'); }
  get email() { return this.signupForm.get('email'); }
  get password() { return this.signupForm.get('password'); }
  get confirmPassword() { return this.signupForm.get('confirmPassword'); }
  get agreeToTerms() { return this.signupForm.get('agreeToTerms'); }
  get newsletter() { return this.signupForm.get('newsletter'); }
}
