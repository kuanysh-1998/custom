import { Component, HostListener, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthorizeService } from '../../services/authorize.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthModel } from '../../models/auth.model';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { Title } from '@angular/platform-browser';
import { WpSnackBar } from 'src/app/shared/services/wp-snackbar.service';
import { Locale } from 'src/app/shared/consts/locale.const';

interface LanguageMenuItem {
  text: string;
  locale: Locale;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public message = new BehaviorSubject<string>(null);
  passwordType: string;
  form: FormGroup;
  returnUrl: any;

  Locale = Locale;
  currentLocaleShort: string;
  selectedLanguage: Locale;
  languageMenuItems: LanguageMenuItem[];
  isDropdownVisible = false;

  constructor(
    private authorizeService: AuthorizeService,
    private snackBar: WpSnackBar,
    private localization: LocalizationService,
    private titleService: Title,
    private fb: FormBuilder
  ) {
    this.selectedLanguage = this.localization.currentLocale;
    this.setCurrentLocaleShort();
  }

  ngOnInit() {
    this.passwordType = 'password';

    this.form = this.fb.group({
      login: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    this.setupLanguageMenu();
    this.titleService.setTitle(
      this.localization.getSync('Авторизация') + ' - Workpace'
    );
  }

  setCurrentLocaleShort() {
    switch (this.selectedLanguage) {
      case Locale.ru:
        this.currentLocaleShort = 'РУС';
        break;
      case Locale.en:
        this.currentLocaleShort = 'ENG';
        break;
      case Locale.kk:
        this.currentLocaleShort = 'ҚАЗ';
        break;
      default:
        this.currentLocaleShort = 'РУС';
    }
  }

  toggleDropdown(): void {
    this.isDropdownVisible = !this.isDropdownVisible;
  }

  @HostListener('document:click', ['$event'])
  closeDropdownOnOutsideClick(event: MouseEvent): void {
    if (!event.target) return;

    const clickedInside = (event.target as HTMLElement).closest(
      '.custom-dropdown'
    );
    if (!clickedInside) {
      this.isDropdownVisible = false;
    }
  }

  changeLanguage(locale: Locale): void {
    this.localization.changeLocale(locale);
    this.selectedLanguage = locale;
    this.isDropdownVisible = false;
    this.setCurrentLocaleShort();
  }

  setupLanguageMenu(): void {
    this.languageMenuItems = [
      { text: this.localization.getSync('ҚАЗ'), locale: Locale.kk },
      { text: this.localization.getSync('РУС'), locale: Locale.ru },
      { text: this.localization.getSync('ENG'), locale: Locale.en },
    ];
  }

  togglePassword() {
    this.passwordType === 'password'
      ? (this.passwordType = 'text')
      : (this.passwordType = 'password');
  }

  sign() {
    this.form.markAllAsTouched();
    if (!this.form.valid) {
      return;
    }
    const body: AuthModel = this.form.getRawValue();
    this.authorizeService
      .loginByEmailAndPassword(body.login, body.password)
      .subscribe(
        (res) => {
          this.authorizeService.redirectToMainPage();
        },
        (error) => {
          this.snackBar.open(
            this.localization.getSync(
              'Пользователь с указанным логином/паролем не найден в системе'
            ),
            5000
          );
        }
      );
  }
}
