import { LocalizationService } from 'src/app/shared/services/localization.service';
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';
import { AuthorizeService } from './authorize.service';
import {
  catchError,
  filter,
  map,
  mergeMap,
  switchMap,
  take,
} from 'rxjs/operators';
import { JWT } from '../../shared/models/jwt.model';
import { environment } from '../../../environments/environment';

import { WpSnackBar } from 'src/app/shared/services/wp-snackbar.service';

export const InterceptorSkipHandleErrors = 'X-Skip-Handle-Errors';

@Injectable({
  providedIn: 'root',
})
export class AuthorizeInterceptor implements HttpInterceptor {
  private refreshTokenInProgress: boolean = false;
  private refreshTokenSubject: Subject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authorize: AuthorizeService,
    private snackBar: WpSnackBar,
    private localization: LocalizationService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    request = this.injectToken(request);
    const skipHandleErrors = request.headers.has(InterceptorSkipHandleErrors);
    if (skipHandleErrors) {
      const headers = request.headers.delete(InterceptorSkipHandleErrors);
      request = request.clone({ headers });
    }

    const accessExpired =
      this.authorize.getAccessTokenExpiration() < new Date();

    const shouldProcessRequest = !this.authorize.isLoggedIn() || !accessExpired;
    if (shouldProcessRequest) {
      return next.handle(request).pipe(
        catchError((error) => {
          if (skipHandleErrors) {
            return throwError(error);
          }
          const errorResponse = <HttpErrorResponse>error;

          if (errorResponse.status == 400) {
            this.snackBar.open(
              errorResponse.error.text ?? errorResponse.error,
              5000,
              'error'
            );
          }
          return of(error);
        }),
        mergeMap((response) => {
          if (response instanceof HttpErrorResponse) {
            const errorResponse = <HttpErrorResponse>response;
            if (errorResponse.status == 401) {
              return this.refreshTokenAndContinue(request, next);
            }
          }
          return of(response);
        })
      );
    }

    if (request.url.indexOf('refresh') === -1) {
      return this.refreshTokenAndContinue(request, next);
    }

    this.refreshTokenInProgress = true;
    return next.handle(request).pipe(
      filter(
        (x) => x instanceof HttpResponse || x instanceof HttpErrorResponse
      ),
      map((response: HttpEvent<any>) => {
        if (response instanceof HttpErrorResponse) {
          this.authorize.logout();
          return response;
        }
        if (response instanceof HttpResponse) {
          const authResponse = <HttpResponse<JWT>>response;
          if (authResponse.body) {
            this.authorize.setJwt(authResponse.body);
            this.refreshTokenInProgress = false;
            this.refreshTokenSubject.next(this.authorize.getToken());
          } else {
            this.authorize.logout();
          }
        }
        return response;
      })
    );
  }

  private injectToken(request: HttpRequest<any>): HttpRequest<any> {
    let url = request.url;
    if (!url.includes(environment.apiUrl)) {
      url = environment.apiUrl + request.url;
    }
    if (this.authorize.isLoggedIn()) {
      const accessToken = this.authorize.getToken();
      request = request.clone({
        url: url,
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } else {
      request = request.clone({
        url: url,
      });
    }
    return request;
  }

  private refreshTokenAndContinue(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!this.authorize.canBeRefreshed()) {
      this.authorize.logout();
      return of(
        new HttpResponse({
          status: 401,
          statusText: 'Срок действия сессии истёк',
        })
      );
    }

    if (this.refreshTokenInProgress) {
      return this.refreshTokenSubject.pipe(
        filter((result) => result !== null),
        take(1),
        switchMap((res) => {
          return next.handle(this.injectToken(request));
        }),
        catchError((x: HttpErrorResponse) =>
          this.refreshTokenAndContinue(request, next)
        )
      );
    }

    this.refreshTokenInProgress = true;
    this.refreshTokenSubject.next(null);
    return this.authorize.refreshToken().pipe(
      switchMap((authResponse: JWT) => {
        if (authResponse) {
          return next.handle(this.injectToken(request));
        } else {
          this.authorize.logout();
        }
        return next
          .handle(this.injectToken(request))
          .pipe(
            catchError((x: HttpErrorResponse) =>
              this.refreshTokenAndContinue(request, next)
            )
          );
      })
    );
  }
}
