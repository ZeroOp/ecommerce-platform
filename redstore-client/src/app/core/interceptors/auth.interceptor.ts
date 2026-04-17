import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
const refreshSubject = new BehaviorSubject<boolean | null>(null);

/** Attaches credentials and transparently refreshes session on 401. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  // Only add credentials to same-origin /api requests
  const apiReq = req.url.startsWith('/api')
    ? req.clone({ withCredentials: true })
    : req;

  return next(apiReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && apiReq.url.startsWith('/api')) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshSubject.next(null);

          return auth.refreshToken().pipe(
            switchMap(() => {
              isRefreshing = false;
              refreshSubject.next(true);
              return next(apiReq);
            }),
            catchError((err) => {
              isRefreshing = false;
              auth.logoutLocal();
              return throwError(() => err);
            }),
          );
        }

        return refreshSubject.pipe(
          filter((v) => v !== null),
          take(1),
          switchMap(() => next(apiReq)),
        );
      }
      return throwError(() => error);
    }),
  );
};
