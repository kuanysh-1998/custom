import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { JwtHelperService } from '@auth0/angular-jwt';
import { ActivatedRoute, Router } from '@angular/router';
import { PermissionEnum } from 'src/app/shared/models/permission.enum';
import { JWT } from '../../shared/models/jwt.model';
import { UtilsService } from '../../shared/services/utils.service';
import { PubSubService } from '../../shared/services/pub-sub.service';
import { InterceptorSkipHandleErrors } from './authorize.interceptor';

@Injectable({
  providedIn: 'root',
})
export class AuthorizeService {
  public static readonly IssueNewTokenUrl: string = 'api/auth/refresh';
  public readonly RefreshTokenKey: string = 'refresh-jwt';
  public readonly AccessTokenKey: string = 'auth-jwt';
  public readonly RoleClaimKey: string =
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

  private _intervalId: any;
  private jwtHelper: JwtHelperService;
  private accessTokenRefreshTimeoutInMs = 2 * 60 * 1000;
  private lastReceivedAccessToken: string | null = null;

  constructor(
    private http: HttpClient,
    private utils: UtilsService,
    private pubsub: PubSubService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.jwtHelper = new JwtHelperService();
  }

  loginByEmailAndPassword(email: string, password: string) {
    const headers = {};
    headers[InterceptorSkipHandleErrors] = 'true';
    return this.http
      .post<JWT>(
        'api/auth',
        {
          login: email,
          password: password,
        },
        { headers: headers }
      )
      .pipe(map(this.handleAuthorizationResponse.bind(this)));
  }

  public handleAuthorizationResponse(result: JWT): JWT {
    if (result) {
      this.setJwt(result);
      this.setupTokenRefreshTimer();
      this.pubsub.publishEvent('login');
    }
    return result;
  }

  isLoggedIn(): Boolean {
    const token = this.getToken();
    return !!token;
  }

  getToken(): string {
    return localStorage.getItem(this.AccessTokenKey);
  }

  getPermissions(): PermissionEnum[] {
    const token = this.getToken();
    if (token == null) {
      return new Array<PermissionEnum>();
    }
    const decodedJwt = this.jwtHelper.decodeToken(token);
    const permissionIdList = <Array<string>>(
      decodedJwt[this.RoleClaimKey].split(',')
    );
    if (permissionIdList == null) {
      return [];
    }
    return permissionIdList.map((x) => {
      return <PermissionEnum>parseInt(x);
    });
  }

  logout(): void {
    this.clearAuthorizationData();
    this.router.navigate(['login'], { replaceUrl: true }).then((x) => x);
  }

  getRefreshToken() {
    return localStorage.getItem(this.RefreshTokenKey);
  }

  refreshToken(): Observable<JWT> {
    const request = {
      accessToken: this.getToken(),
      refreshToken: this.getRefreshToken(),
    };
    return this.http.post<JWT>(AuthorizeService.IssueNewTokenUrl, request).pipe(
      map((resp) => {
        if (resp && resp.accessToken) {
          this.setJwt(resp);
          this.pubsub.publishEvent('refreshToken');
          return resp;
        } else {
          throw new Error('Ошибка обновления токена: Токен не получен');
        }
      }),
      catchError((error) => {
        this.logout(); 
        return throwError(
          () =>
            new Error('Ошибка при обновлении токена. Требуется повторный вход.')
        );
      })
    );
  }

  public setJwt(data: JWT) {
    const currentToken = this.getToken();

    if (currentToken !== data.accessToken) {
      localStorage.setItem(this.AccessTokenKey, data.accessToken);
      this.lastReceivedAccessToken = data.accessToken;
    }

    localStorage.setItem(this.RefreshTokenKey, data.refreshToken);
  }

  public reloadInCaseOfStaleAccessToken(): void {
    const storedToken = this.getToken();

    if (
      this.lastReceivedAccessToken === null ||
      this.lastReceivedAccessToken !== storedToken
    ) {
      window.location.reload();
    }
  }

  private mustBeRefreshedImmediately(): boolean {
    const now = Date.now();
    const expired = Number(this.getAccessTokenExpiration());
    if (now + this.accessTokenRefreshTimeoutInMs > expired) {
      return true;
    }
    return false;
  }

  public canBeRefreshed(): boolean {
    const refreshToken = this.getRefreshToken();
    if (refreshToken == null) {
      return false;
    }
    const refreshTokenExpirationDate =
      this.jwtHelper.getTokenExpirationDate(refreshToken);
    return Number(refreshTokenExpirationDate) > Date.now();
  }

  getAccessTokenExpiration(): Date {
    return this.jwtHelper.getTokenExpirationDate(this.getToken());
  }

  setupTokenRefreshTimer() {
    clearInterval(this._intervalId);
    if (!this.isLoggedIn()) {
      return;
    }
    let tokenRefreshTimeoutInMs = 100;
    if (!this.mustBeRefreshedImmediately()) {
      let tokenExpirationDateInMs = Number(this.getAccessTokenExpiration());
      tokenRefreshTimeoutInMs =
        tokenExpirationDateInMs -
        Date.now() -
        this.accessTokenRefreshTimeoutInMs;
      tokenRefreshTimeoutInMs =
        tokenRefreshTimeoutInMs +
        this.utils.getRandom(1000, this.accessTokenRefreshTimeoutInMs / 2);

      //  tokenRefreshTimeoutInMs = 1000 * 60;
    }

    this._intervalId = setTimeout(() => {
      // if (!this.mustBeRefreshedImmediately()) {
      //   // Means other tab or service have refreshed the Token
      //   this.setupTokenRefreshTimer();
      //   return;
      // }
      if (!this.canBeRefreshed()) {
        console.warn('Refresh token expired');
        this.logout();
        return;
      }
      this.refreshToken().subscribe(
        (resp) => {
          if (resp) {
            console.info('Token successfully refreshed');
            this.setupTokenRefreshTimer();
          } else {
            console.warn('Token refresh is null');
            this.logout();
          }
        },
        (error) => {
          console.warn('Token refresh error: ' + error.text);
          this.logout();
        }
      );
    }, tokenRefreshTimeoutInMs);
  }

  isExistPermissions(requiredPermissions: PermissionEnum[]) {
    const profilePermissions = this.getPermissions();
    if (requiredPermissions == null || requiredPermissions.length == 0) {
      return true;
    }
    if (profilePermissions == null) {
      return false;
    }
    let isExist = false;
    requiredPermissions.forEach((x) => {
      if (profilePermissions.includes(x)) {
        isExist = true;
        return;
      }
    });
    return isExist;
  }

  get currentOrganizationId(): string {
    const token = this.getToken();
    if (token == null) {
      return null;
    }
    let tokenData = this.jwtHelper.decodeToken(token);
    return tokenData.org;
  }

  public getUserEmail(): string {
    const token = this.getToken();
    if (token == null) {
      return null;
    }
    let tokenData = this.jwtHelper.decodeToken(token);
    return tokenData.sub;
  }

  public getUserId(): string {
    const token = this.getToken();
    if (token == null) {
      return null;
    }
    let tokenData = this.jwtHelper.decodeToken(token);
    return tokenData.unique_name;
  }

  public getUserFullname(): string {
    const token = this.getToken();
    if (token == null) {
      return null;
    }
    let tokenData = this.jwtHelper.decodeToken(token);
    return tokenData.name;
  }

  private clearAuthorizationData() {
    localStorage.removeItem(this.AccessTokenKey);
    localStorage.removeItem(this.RefreshTokenKey);
    localStorage.removeItem('organization');
    clearInterval(this._intervalId);
    this.pubsub.publishEvent('logout');
  }

  redirectToMainPage() {
    if (
      [
        PermissionEnum.OwnLicensesView,
        PermissionEnum.OwnPersonalAccountView,
      ].some((item) => this.getPermissions().includes(item))
    ) {
      this.router.navigate(['/personal']);
    } else {
      const redirect = this.route.snapshot.queryParams['returnUrl'] || '/';
      this.router.navigate([redirect], { replaceUrl: true }).then((x) => x);
    }
  }
}
