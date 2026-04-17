import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

/** Role-aware guard. Pass `role` via route data: `data: { role: 'seller' }`. */
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.user();
  const requiredRole = route.data?.['role'] as UserRole | undefined;

  if (!user) {
    if (state.url.startsWith('/seller')) router.navigate(['/auth/seller-signin']);
    else if (state.url.startsWith('/admin')) router.navigate(['/auth/admin-signin']);
    else router.navigate(['/auth/signin'], { queryParams: { redirect: state.url } });
    return false;
  }

  if (requiredRole && user.role !== requiredRole) {
    auth.redirectAfterLogin();
    return false;
  }

  return true;
};
