import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
} from '@angular/core';
import { AuthorizeService } from '../../../auth/services/authorize.service';
import { OrganizationService } from '../../../services/organization.service';
import { LicenceService } from '../../../services/licence.service';
import { LicenseDataModel } from '../../../models/licences/licence.model';
import { OrganizationModel } from '../../../models/organization.model';
import { Observable } from 'rxjs';
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { Locale } from '../../consts/locale.const';
import {
  HeaderLicenseStatus,
  LicenseStatus,
} from '../../consts/license-status.const';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy {
  Locale = Locale;
  localeId: Locale;
  LicenseStatus = LicenseStatus;
  HeaderLicenseStatus = HeaderLicenseStatus;
  currentLicense: LicenseDataModel;
  isOpen = true;
  organization$: Observable<OrganizationModel>;
  isOpenLicense: boolean;
  dayExpired = null;
  toggle = false;
  maxLength = 30;
  observer: MutationObserver;
  listLanguage = [
    {
      text: this.localization.getSync('Русский язык'),
      locale: Locale.ru,
    },
    {
      text: this.localization.getSync('Казахский язык'),
      locale: Locale.kk,
    },
    {
      text: this.localization.getSync('Английский язык'),
      locale: Locale.en,
    },
  ];
  languageName = {
    'ru-RU': this.localization.getSync('Русский'),
    'kk-KZ': this.localization.getSync('Казахский'),
    'en-US': this.localization.getSync('Английский'),
  };

  get userEmail(): string {
    return this.auth.getUserEmail();
  }

  constructor(
    private auth: AuthorizeService,
    private organizationService: OrganizationService,
    private licenseService: LicenceService,
    private authorizeService: AuthorizeService,
    private localization: LocalizationService,
    public titleService: Title,
    private elRef: ElementRef
  ) {
    this.localeId = localization.currentLocale;
  }

  ngOnInit(): void {
    this.organization$ = this.organizationService.getOrganizationById(
      this.auth.currentOrganizationId
    );
    this.licenseService
      .getCurrentLicences(this.auth.currentOrganizationId)
      .subscribe((res) => {
        if (res && res.status === this.HeaderLicenseStatus.Active) {
          this.currentLicense = res;
          this.dayExpired = differenceInCalendarDays(
            new Date(res.expiring),
            Date.now()
          );
        } else {
          this.dayExpired = 0;
          this.currentLicense = res;
        }
      });
  }

  ngAfterViewInit() {
    const config = { attributes: true, childList: true, subtree: true };
    this.observer = new MutationObserver((mutationsList, observer) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const subMenu = this.elRef.nativeElement.querySelector('.dx-menu-item-expanded');
          if (subMenu) {
            this.toggle = true;
          } else {
            this.toggle = false;
          }
        }
      }
    });
    this.observer.observe(this.elRef.nativeElement, config);
  }

  logOut(): void {
    const isAuthenticated = this.authorizeService.isLoggedIn();
    if (isAuthenticated) {
      this.authorizeService.logout();
      return;
    }
    this.authorizeService.redirectToMainPage();
  }

  licenseTitle() {
    if (this.dayExpired === null) {
      return;
    }
    return this.currentLicense?.name
      ? this.currentLicense.name
      : this.localization.getSync('Нет активной лицензии');
  }

  changeLocale(locale: Locale) {
    this.localeId = locale;
    this.localization.changeLocale(locale);
  }

  isCurrentLocale(locale: Locale) {
    return locale === this.localization.currentLocale;
  }

  defineLicenseStatus(): LicenseStatus {
    if (this.dayExpired === null) {
      return;
    }
    if (this.dayExpired > 3) {
      return LicenseStatus.DoesntExpire;
    }
    if (this.dayExpired > 0 && this.dayExpired <= 3) {
      return LicenseStatus.ExpiresSoon;
    }
    if (this.dayExpired <= 0) {
      return LicenseStatus.Expired;
    }
  }

  ngOnDestroy() {
    this.observer.disconnect();
  }
}
