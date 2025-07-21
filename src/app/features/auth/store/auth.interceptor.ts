import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, from } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/shared/components/toast/toast.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token: any = JSON.parse(localStorage.getItem('auth_token') || '{}');
    let authReq = req;

    if (token?.accessToken && !req.url.includes('auth/refresh-token')) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token.accessToken}`,
        },
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !req.url.includes('auth/refresh-token')) {
          return this.handle401Error(authReq, next);
        }
        return throwError(() => error);
      })
    );
  }

  private handle401Error(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return from(this.authService.refreshToken()).pipe(
        switchMap((success: boolean) => {
          this.isRefreshing = false;
          if (success) {
            const token: any = JSON.parse(
              localStorage.getItem('auth_token') || '{}'
            );
            this.refreshTokenSubject.next(token.accessToken);
            return next.handle(
              request.clone({
                setHeaders: {
                  Authorization: `Bearer ${token.accessToken}`,
                },
              })
            );
          } else {
            this.router.navigate(['/login'], {
              queryParams: { returnUrl: this.router.url },
            });
            return throwError(
              () => new Error('Échec du rafraîchissement du token')
            );
          }
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.authService.logout();
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: this.router.url },
          });
          return throwError(() => err);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter((token) => token !== null),
        take(1),
        switchMap((token) => {
          return next.handle(
            request.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`,
              },
            })
          );
        })
      );
    }
  }
}
