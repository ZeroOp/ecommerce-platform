import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';


export interface User {
  id: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  
  private baseUrl = '/api/users';

  constructor(private http: HttpClient, private router: Router) { }

  
  loginWithGoogle(idToken: string): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/google`, { token: idToken }, { withCredentials: true })
      .pipe(
        tap(user => {
          
          this.currentUserSubject.next(user);
        })
      );
  }

  
  refreshToken(): Observable<any> {
    return this.http.post(`${this.baseUrl}/refresh`, {}, { withCredentials: true });
  }

  logout(): void {
    this.http.post(`/api/logout`, {}, { withCredentials: true }).subscribe({
      next: (response) => {
        this.currentUserSubject.next(null);
        this.router.navigate(['/auth/signin']);
      },
      error: (error) => {
        this.currentUserSubject.next(null);
        this.router.navigate(['/auth/signin']);
      }
    });
  }

  getCurrentUser(): Observable<User | null> {
    return this.http.get<User | null>(`${this.baseUrl}/currentuser`, { withCredentials: true })
      .pipe(
        tap(user => {
          const isValidUser = user && user.email && user.id;
          this.currentUserSubject.next(isValidUser ? user : null);
        })
      );
  }

  public get isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }
}
