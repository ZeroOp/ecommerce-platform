import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

// Define a quick interface for your User model
// (Match this with what your Java backend returns)
export interface User {
  id: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // A BehaviorSubject acts like a local state store holding the current user.
  // This allows any component to subscribe and know if someone is logged in.
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Change this to match your backend URL if needed
  private baseUrl = '/api/users';

  constructor(private http: HttpClient) { }

  /**
   * 1. Google Login
   * Sends the Google ID token to the Java backend to exchange for cookies
   */
  loginWithGoogle(idToken: string): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/google`, { token: idToken }, { withCredentials: true })
      .pipe(
        tap(user => {
          // Save the user data in our local state
          this.currentUserSubject.next(user);
        })
      );
  }

  /**
   * 2. Silent Refresh
   * This is what the Interceptor calls when it hits a 401 Unauthorized error!
   */
  refreshToken(): Observable<any> {
    // { withCredentials: true } is vital here so the browser automatically
    // attaches the secure HTTP-only refresh_token cookie!
    return this.http.post(`${this.baseUrl}/refresh`, {}, { withCredentials: true });
  }

  /**
   * 3. Logout
   * Wipes the local state and can be hooked to a backend logout if needed
   */
  logout(): void {
    // 1. Hit backend /logout endpoint to clear cookies first
    this.http.post(`${this.baseUrl}/logout`, {}, { withCredentials: true }).subscribe({
      next: (response) => {
        // 2. Wipe the current user from Angular state
        this.currentUserSubject.next(null);
        // 3. Reload page to ensure all app states are fully cleared
        window.location.reload();
      },
      error: (error) => {
        // Still clear local state and reload even if backend fails
        this.currentUserSubject.next(null);
        window.location.reload();
      }
    });
  }

  /**
   * Get current user from backend
   */
  getCurrentUser(): Observable<User | null> {
    return this.http.get<User | null>(`${this.baseUrl}/currentuser`, { withCredentials: true })
      .pipe(
        tap(user => {
          // Check if user object has valid data (not just null values)
          const isValidUser = user && user.email && user.id;
          this.currentUserSubject.next(isValidUser ? user : null);
        })
      );
  }

  /**
   * Helper getter to check if a user is logged in
   */
  public get isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }
}
