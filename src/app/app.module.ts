import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule, Provider } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { HttpCustom } from './shared/http';
import { AuthorizeInterceptor } from './auth/services/authorize.interceptor';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { UtilsService } from "./shared/services/utils.service";
import { PubSubService } from "./shared/services/pub-sub.service";
import { CommonModule } from '@angular/common';
import { MissingTranslationHandler, TranslateModule } from '@ngx-translate/core';
import { LocalizationService, LogMissingTranslationHandler } from './shared/services/localization.service';
import { AcceptLanguageInterceptor } from './auth/services/accept-language.interceptor';
import { CurrencyPipe } from '@angular/common';
import { HttpCustomPost } from './shared/httpPost';
import { AngularSvgIconModule } from 'angular-svg-icon';

const AUTH_HTTP_INTERCEPTOR: Provider = {
  provide: HTTP_INTERCEPTORS,
  multi: true,
  useClass: AuthorizeInterceptor
};
const ACCEPT_LANGUAGE_HTTP_INTERCEPTOR: Provider = {
  provide: HTTP_INTERCEPTORS,
  multi: true,
  useClass: AcceptLanguageInterceptor
};
const LOCALE_ID_PROVIDER: Provider = {
  provide: LOCALE_ID,
  deps: [LocalizationService],
  useFactory: (translate: LocalizationService) => translate.currentLocale
};
@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    CommonModule,
    TranslateModule.forRoot({
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: LogMissingTranslationHandler,
      }
    }),
    AngularSvgIconModule.forRoot(),
  ],
  providers: [
    LOCALE_ID_PROVIDER,
    AUTH_HTTP_INTERCEPTOR,
    ACCEPT_LANGUAGE_HTTP_INTERCEPTOR,
    HttpCustom,
    HttpCustomPost,
    UtilsService,
    PubSubService,
    CurrencyPipe 
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
