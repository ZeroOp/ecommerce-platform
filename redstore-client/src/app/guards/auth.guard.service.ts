import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    // Always validate session via API to ensure cookies are checked
    return this.authService.getCurrentUserFromAPI().pipe(
      map(user => this.checkRouteAccess(route, state, user)),
      catchError(error => {
        // If API call fails, redirect based on route
        const currentUrl = state.url.toLowerCase();
        if (currentUrl.includes('/seller')) {
          this.router.navigate(['/auth/seller-signin']);
        } else if (currentUrl.includes('/admin')) {
          this.router.navigate(['/auth/admin-signin']);
        } else {
          this.router.navigate(['/auth/signin']);
        }
        return of(false);
      })
    );
  }

  private checkRouteAccess(
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot, 
    currentUser: any
  ): boolean {
    const currentUrl = state.url.toLowerCase();
    
    // If user is not authenticated
    if (!currentUser) {
      if (currentUrl.includes('/seller')) {
        this.router.navigate(['/auth/seller-signin']);
      } else if (currentUrl.includes('/admin')) {
        this.router.navigate(['/auth/admin-signin']);
      } else {
        this.router.navigate(['/auth/signin']);
      }
      return false;
    }

    const userRole = currentUser.userRole;
    const requiredRole = route.data?.['role'];

    // Check route-specific access rules
    if (currentUrl.includes('/seller')) {
      // Seller routes - only sellers can access
      if (userRole !== 'seller') {
        this.authService.redirectBasedOnRole();
        return false;
      }
    } else if (currentUrl.includes('/admin')) {
      // Admin routes - only admins can access
      if (userRole !== 'admin') {
        this.authService.redirectBasedOnRole();
        return false;
      }
    }

    // If route requires specific role, check if user has it
    if (requiredRole && userRole !== requiredRole) {
      this.authService.redirectBasedOnRole();
      return false;
    }

    return true;
  }
}
