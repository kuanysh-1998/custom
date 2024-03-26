import { InjectionToken, Injector, ProviderToken } from '@angular/core';
import { ButtonConfig } from '../drawer/drawer.types';

export const DIALOG_DATA = new InjectionToken('DialogData');

export type DialogConfig = {
  data?: unknown;
  size?: 'medium' | 'large';
  header?: string;
  text?: string;
  additionalButton?: ButtonConfig | string;
  cancelButton?: ButtonConfig | string;
  submitButton?: ButtonConfig | string;
  context?: {
    injector: Injector;
    tokens: ProviderToken<unknown>[];
  };
};
