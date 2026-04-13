import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  userRole: 'admin' | 'seller' | 'user';
  token?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(private router: Router, private http: HttpClient) {
    // Check for existing user session on app load
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(email: string, password: string, loginType: 'user' | 'seller' | 'admin' = 'user'): Observable<AuthResponse> {
    // This method is for email/password login (not implemented yet)
    throw new Error('Email/password login not implemented. Use loginWithGoogle for OAuth.');
  }

  loginWithGoogle(idToken: string, loginType: 'user' | 'seller' | 'admin' = 'user'): Observable<AuthResponse> {
    // Different API endpoints based on login type
    let apiEndpoint: string;
    
    switch (loginType) {
      case 'seller':
        apiEndpoint = '/api/sellers/google';
        break;
      case 'admin':
        apiEndpoint = '/api/admin/google';
        break;
      default:
        apiEndpoint = '/api/users/google';
    }
    
    return this.http.post<any>(apiEndpoint, { token: idToken }).pipe(
      map(response => {
        // Backend returns user data, store it
        const user: User = {
          id: response.id,
          email: response.email,
          userRole: this.mapRoleFromBackend(response.role),
          token: 'session-token' // Session is managed via cookies
        };
        
        // Store user data in localStorage for session management
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        
        return {
          user: user,
          token: user.token!
        };
      }),
      catchError(error => {
        console.error('Login failed:', error);
        throw error;
      })
    );
  }

  // Fetch current user from API
  getCurrentUserFromAPI(): Observable<User | null> {
    return this.http.get<any>('/api/currentuser').pipe(
      map(response => {
        if (response && response.email) {
          const user: User = {
            id: response.id,
            email: response.email,
            userRole: this.mapRoleFromBackend(response.roles),
            token: 'session-token'
          };
          
          // Update stored user data
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          
          return user;
        }
        return null;
      }),
      catchError(error => {
        console.error('Failed to fetch current user:', error);
        // Clear invalid session
        this.logout();
        return of(null);
      })
    );
  }

  // Map backend role to frontend role
  private mapRoleFromBackend(backendRole: any): 'admin' | 'seller' | 'user' {
    if (Array.isArray(backendRole)) {
      // Backend returns Set<UserRole>, convert to string
      const roleString = backendRole[0];
      return this.mapSingleRole(roleString);
    } else if (typeof backendRole === 'string') {
      return this.mapSingleRole(backendRole);
    }
    return 'user'; // Default fallback
  }

  private mapSingleRole(role: string): 'admin' | 'seller' | 'user' {
    switch (role.toUpperCase()) {
      case 'ADMIN':
        return 'admin';
      case 'SELLER':
        return 'seller';
      case 'BUYER':
      case 'USER':
        return 'user';
      default:
        return 'user';
    }
  }

  logout(): void {
    // Call backend logout endpoint to clear cookies and Redis session
    this.http.post('/api/logout', {}, { withCredentials: true }).subscribe({
      next: () => {
        console.log('Logout successful');
      },
      error: (err) => {
        console.error('Logout error:', err);
      },
      complete: () => {
        // Clear local storage and current user immediately
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
        
        // Get current URL to determine appropriate login page
        const currentUrl = window.location.pathname;
        if (currentUrl && currentUrl.includes('/seller')) {
          window.location.href = '/auth/seller-signin';
        } else if (currentUrl && currentUrl.includes('/admin')) {
          window.location.href = '/auth/admin-signin';
        } else {
          window.location.href = '/auth/signin';
        }
      }
    });
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserRole(): 'admin' | 'seller' | 'user' | null {
    const user = this.getCurrentUser();
    return user ? user.userRole : null;
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }

  isSeller(): boolean {
    return this.getUserRole() === 'seller';
  }

  isRegularUser(): boolean {
    return this.getUserRole() === 'user';
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  // Redirect user based on role after login
  redirectBasedOnRole(): void {
    const user = this.getCurrentUser();
    if (!user) return;

    switch (user.userRole) {
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      case 'seller':
        this.router.navigate(['/seller']);
        break;
      case 'user':
        this.router.navigate(['/']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}
