import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { API_URL } from '@/constants/api.constants';
import { AuthService } from '@/services/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  if (!req.url.startsWith(API_URL) || req.url.startsWith(`${API_URL}/auth/`)) return next(req);

  const withToken = (r: HttpRequest<unknown>) => {
    const token = auth.accessToken();
    return token ? r.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : r;
  };

  return next(withToken(req)).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || !auth.isLoggedIn()) {
        return throwError(() => error);
      }
      return auth.refresh().pipe(
        switchMap(() => next(withToken(req))),
        catchError((refreshError: unknown) => {
          auth.expire();
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
