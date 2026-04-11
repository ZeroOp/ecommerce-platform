import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

// This prevents TypeScript from complaining that 'google' doesn't exist
declare const google: any;

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './signin.html',
  styleUrls: ['./signin.scss']
})
export class SigninComponent implements OnInit {
  signinForm: FormGroup;
  isLoading = false;
  showPassword = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

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
    
    this.http.post('/api/users/google', { token: idToken }, { withCredentials: true })
      .subscribe({
        next: (res: any) => {
          console.log('Google Sign-In successful:', res);
          this.successMessage = 'Sign-in successful! Redirecting...';
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1500);
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

  onSubmit() {
    if (this.signinForm.invalid) {
      this.signinForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { email, password, rememberMe } = this.signinForm.value;

    // Regular email/password sign-in
    this.http.post('/api/users/signin', { email, password }, { withCredentials: true })
      .subscribe({
        next: (res: any) => {
          console.log('Sign-in successful:', res);
          this.successMessage = 'Sign-in successful! Redirecting...';
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1500);
        },
        error: (err) => {
          console.error('Sign-in failed:', err);
          this.errorMessage = err.error?.message || 'Invalid email or password. Please try again.';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  navigateToSignup() {
    this.router.navigate(['/auth/signup']);
  }

  navigateToForgotPassword() {
    this.router.navigate(['/auth/forgot-password']);
  }

  // Form getters for template access
  get email() { return this.signinForm.get('email'); }
  get password() { return this.signinForm.get('password'); }
  get rememberMe() { return this.signinForm.get('rememberMe'); }
}
