import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PasswordButton } from '../models/user.model';

@Injectable()

export class PasswordVisibilityService implements OnDestroy {
  private hidePassword = true;
  passwordMode$ = new BehaviorSubject<string>('password');
  passwordButton$ = new BehaviorSubject<any>(this.createPasswordButton());

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
    this.passwordMode$.next(this.hidePassword ? 'password' : 'text');
    this.passwordButton$.next(this.createPasswordButton());
  }

  createPasswordButton(): PasswordButton {
    return {
      icon: this.hidePassword ? 'eyeclose' : 'eyeopen',
      onClick: this.togglePasswordVisibility.bind(this),
    };
  }
  

  ngOnDestroy(): void {
    this.passwordMode$.complete();
    this.passwordButton$.complete();
  }
}
