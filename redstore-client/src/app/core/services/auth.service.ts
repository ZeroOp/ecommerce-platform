import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthResponse, User, UserRole } from '../models/user.model';

export type LoginKind = 'user' | 'seller' | 'admin';

const STORAGE_KEY = 'rs_current_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _user = signal<User | null>(this.loadFromStorage());
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly role = computed<UserRole | null>(() => this._user()?.role ?? null);

  private currentUserSubject = new BehaviorSubject<User | null>(this._user());
  readonly currentUser$ = this.currentUserSubject.asObservable();

  /** Google OAuth client id for GIS */
  readonly googleClientId =
    '854136327852-v48sbh7hbb3145dmaq0kjt6aknpv6oms.apps.googleusercontent.com';

  private endpointFor(kind: LoginKind): string {
    switch (kind) {
      case 'seller': return '/api/sellers/google';
      case 'admin':  return '/api/admin/google';
      default:       return '/api/users/google';
    }
  }

  loginWithGoogle(idToken: string, kind: LoginKind = 'user'): Observable<User> {
    return this.http
      .post<AuthResponse>(this.endpointFor(kind), { token: idToken }, { withCredentials: true })
      .pipe(
        map((res) => this.normalize(res)),
        tap((user) => this.setUser(user)),
      );
  }

  /** For demo/dummy login flow (used in dev when backend is not available). */
  loginAsDemo(kind: LoginKind = 'user', email = 'demo@redstore.io'): User {
    const user: User = {
      id: `demo-${kind}`,
      email,
      name: kind === 'admin' ? 'Admin Demo' : kind === 'seller' ? 'Seller Demo' : 'Buyer Demo',
      role: kind,
      avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(email)}`,
    };
    this.setUser(user);
    return user;
  }

  refreshToken(): Observable<unknown> {
    return this.http.post('/api/users/refresh', {}, { withCredentials: true });
  }

  fetchCurrentUser(): Observable<User | null> {
    return this.http.get<AuthResponse>('/api/currentuser', { withCredentials: true }).pipe(
      map((res) => (res && res.email ? this.normalize(res) : null)),
      tap((user) => user ? this.setUser(user) : this.clearUser()),
      catchError(() => {
        this.clearUser();
        return of(null);
      }),
    );
  }

  logout(): void {
    this.http.post('/api/logout', {}, { withCredentials: true }).subscribe({
      next: () => this.finishLogout(),
      error: () => this.finishLogout(),
    });
  }

  /** Client-only sign out for dummy/demo mode */
  logoutLocal(): void {
    this.finishLogout();
  }

  redirectAfterLogin(): void {
    const role = this.role();
    switch (role) {
      case 'admin':  return void this.router.navigate(['/admin']);
      case 'seller': return void this.router.navigate(['/seller']);
      default:       return void this.router.navigate(['/']);
    }
  }

  // ---------- helpers ----------
  private normalize(res: AuthResponse): User {
    return {
      id: res.id,
      email: res.email,
      name: res.name ?? res.email?.split('@')[0],
      role: this.mapRole(res.role),
      avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(res.email)}`,
    };
  }

  private mapRole(role: string | string[] | undefined): UserRole {
    const raw = Array.isArray(role) ? role[0] : role;
    switch ((raw || '').toUpperCase()) {
      case 'ADMIN':  return 'admin';
      case 'SELLER': return 'seller';
      default:       return 'user';
    }
  }

  private setUser(user: User): void {
    this._user.set(user);
    this.currentUserSubject.next(user);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(user)); } catch {}
  }

  private clearUser(): void {
    this._user.set(null);
    this.currentUserSubject.next(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }

  private finishLogout(): void {
    this.clearUser();
    const url = this.router.url || '/';
    if (url.startsWith('/seller'))      this.router.navigate(['/auth/seller-signin']);
    else if (url.startsWith('/admin'))  this.router.navigate(['/auth/admin-signin']);
    else                                this.router.navigate(['/auth/signin']);
  }

  private loadFromStorage(): User | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch { return null; }
  }
}
