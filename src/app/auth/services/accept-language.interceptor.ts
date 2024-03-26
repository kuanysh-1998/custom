import { LocalizationService } from '../../shared/services/localization.service';
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable()
export class AcceptLanguageInterceptor implements HttpInterceptor {
  constructor(private locale: LocalizationService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.headers.has('Accept-Language')) {
      return next.handle(req);
    }
    req = req.clone({
      setHeaders: {
        'Accept-Language': this.locale.currentLocale,
      },
    });
    return next.handle(req);
  }
}
