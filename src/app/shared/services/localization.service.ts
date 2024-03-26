import { registerLocaleData } from '@angular/common';
import { Locale } from '../consts/locale.const';
import { Injectable } from '@angular/core';
import {
  MissingTranslationHandler,
  MissingTranslationHandlerParams,
  TranslateService,
} from '@ngx-translate/core';
import { locale, loadMessages } from 'devextreme/localization';
import {
  Observable,
  catchError,
  defer,
  forkJoin,
  from,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';

import localeRu from '@angular/common/locales/ru';
import localeEn from '@angular/common/locales/en';
import localeKk from '@angular/common/locales/kk';

import i18nRu from './../../../assets/i18n/ru-RU.json';
import i18nEn from './../../../assets/i18n/en-US.json';
import i18nKk from './../../../assets/i18n/kk-KZ.json';

import enMessages from 'devextreme/localization/messages/en.json';
import ruMessages from '../../../assets/i18n/devextreme.messages.ru.json';
import kkMessages from '../../../assets/i18n/devextreme.messages.kk.json';

import { shouldPolyfill } from '@formatjs/intl-datetimeformat/should-polyfill';

@Injectable({
  providedIn: 'root',
})
export class LocalizationService {
  private readonly LOCALE_PROPERTY = 'locale';
  public readonly currentLocale: Locale;
  constructor(private translate: TranslateService) {
    const defaultLocale = this.convertToCorrectCodeName(
      <Locale>this.translate.getBrowserCultureLang()
    );
    this.translate.setDefaultLang(defaultLocale);
    this.currentLocale = this.readLocaleFromStorage();
    if (this.currentLocale == null) {
      this.currentLocale = defaultLocale;
      this.saveLocaleToStorage(defaultLocale);
    }
  }

  convertToCorrectCodeName(browserLocale: string): Locale {
    if (browserLocale == null) {
      return Locale.ru;
    }
    var correctLocales = new Array<Locale>(Locale.ru, Locale.kk, Locale.en);
    for (const locale of correctLocales) {
      if (locale.startsWith(browserLocale)) {
        return locale;
      }
    }
    return Locale.ru;
  }

  initialize() {
    const initialization$ = defer(() => {
      this.loadTranslations();
      this.applyLocale(this.currentLocale);

      return this.polyfill(this.currentLocale);
    });

    initialization$.subscribe({
      error: (err) => console.error('Error during initialization', err),
    });
  }

  private loadTranslations(): void {
    this.translate.setTranslation(Locale.ru, i18nRu);
    this.translate.setTranslation(Locale.en, i18nEn);
    this.translate.setTranslation(Locale.kk, i18nKk);

    registerLocaleData(localeRu, Locale.ru);
    registerLocaleData(localeEn, Locale.en);
    registerLocaleData(localeKk, Locale.kk);

    loadMessages(kkMessages);
    loadMessages(enMessages);
    loadMessages(ruMessages);
  }

  private applyLocale(appliedLocale: Locale) {
    locale(appliedLocale);
    this.translate.use(appliedLocale);
  }

  polyfill(locale: string): Observable<any> {
    if (!shouldPolyfill(locale)) {
      return of(undefined).pipe(
        tap(() => console.log('No polyfill needed for the locale.'))
      );
    }

    return from(import('@formatjs/intl-datetimeformat/polyfill-force')).pipe(
      switchMap(() =>
        forkJoin([
          from(import('@formatjs/intl-datetimeformat/locale-data/ru')),
          from(import('@formatjs/intl-datetimeformat/locale-data/kk')),
          from(import('@formatjs/intl-datetimeformat/locale-data/en')),
        ])
      ),
      catchError((error) => {
        console.error('Error loading the polyfills or locale data', error);
        return throwError(
          () => new Error('Error loading the polyfills or locale data')
        );
      })
    );
  }

  getSync(key: string | string[], interpolateParams?: any): string {
    const translation = this.translate.instant(key, interpolateParams);
    if (translation) {
      return translation;
    }
    if (typeof key == 'string') {
      return key;
    }
    return 'NO-TRANSLATE';
  }

  get(key: string | string[], interpolateParams?: any): Observable<string> {
    if (key == null) {
      return of(null);
    }
    return this.translate.get(key, interpolateParams);
  }

  changeLocale(newLocale: Locale, reload: boolean = true) {
    this.saveLocaleToStorage(newLocale);
    this.applyLocale(newLocale);
    if (reload) {
      location.reload();
    }
  }
  private saveLocaleToStorage(newLocale: Locale) {
    localStorage.setItem(this.LOCALE_PROPERTY, newLocale);
  }
  private readLocaleFromStorage(): Locale | null {
    return <Locale>localStorage.getItem(this.LOCALE_PROPERTY);
  }
}

@Injectable()
export class LogMissingTranslationHandler implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams) {
    console.log('[MISSING] ' + params.key);
  }
}
