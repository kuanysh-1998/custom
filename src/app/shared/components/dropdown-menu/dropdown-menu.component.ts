import { Locale } from '../../consts/locale.const';
import { Component, OnInit } from '@angular/core';
import { AuthorizeService } from '../../../auth/services/authorize.service';
import { LocalizationService } from '../../services/localization.service';

@Component({
  selector: 'app-dropdown-menu',
  templateUrl: './dropdown-menu.component.html',
  styleUrls: ['./dropdown-menu.component.scss'],
})
export class DropdownMenuComponent implements OnInit {
  Locale = Locale;
  currentLocaleShort: string;

  languageMenuItems: any[];
  userMenuItems: any[];

  get currentUserName(): string {
    return this.auth.getUserEmail();
  }

  constructor(
    private auth: AuthorizeService,
    private localization: LocalizationService
  ) {}

  ngOnInit(): void {
    this.setupLanguageMenu();
    this.setupUserMenu();

    switch (this.localization.currentLocale) {
      case Locale.ru:
        this.currentLocaleShort = 'РУС';
        break;
      case Locale.en:
        this.currentLocaleShort = 'ENG';
        break;
      case Locale.kk:
        this.currentLocaleShort = 'ҚАЗ';
        break;
    }
  }

  handleLanguageMenuClick(e: any) {
    const item = e.itemData;
    if (item && item.locale) {
      this.changeLanguage(item.locale);
    }
  }

  setupLanguageMenu() {
    this.languageMenuItems = [
      { text: this.localization.getSync('Казахский'), locale: Locale.kk },
      { text: this.localization.getSync('Русский'), locale: Locale.ru },
      { text: this.localization.getSync('Английский'), locale: Locale.en },
    ];
  }

  handleUserMenuClick(e: any) {
    const item = e.itemData;
    if (item && item.actionName) {
      this[item.actionName]();
    }
  }

  setupUserMenu() {
    this.userMenuItems = [
      {
        text: this.localization.getSync('Выход'),
        icon: 'bi bi-box-arrow-right',
        actionName: 'logOut',
      },
    ];
  }

  logOut() {
    const isAuthenticated = this.auth.isLoggedIn();
    if (isAuthenticated) {
      this.auth.logout();
    } else {
      this.auth.redirectToMainPage();
    }
  }

  changeLanguage(newLocale: Locale) {
    this.localization.changeLocale(newLocale);
    switch (newLocale) {
      case Locale.ru:
        this.currentLocaleShort = 'РУС';
        break;
      case Locale.en:
        this.currentLocaleShort = 'ENG';
        break;
      case Locale.kk:
        this.currentLocaleShort = 'ҚАЗ';
        break;
    }
  }
}
