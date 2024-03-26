import { InjectionToken, Injector, ProviderToken } from '@angular/core';
import { Icons } from '../../assets/svg.types';
import { VariantButton } from '../button/button.types';

export const DRAWER_DATA = new InjectionToken('DrawerData');

export type DrawerConfig = {
  data?: unknown;
  header?: string;
  subheader?: string;
  additionalButton?: ButtonConfig | string;
  cancelButton?: ButtonConfig | string;
  submitButton?: ButtonConfig | string;
  context?: {
    injector: Injector;
    tokens: ProviderToken<unknown>[];
  };
};

export type ButtonConfig = {
  stylingMode?: 'contained' | 'outlined' | 'ghost';
  variant?: VariantButton;
  label: string;
  icon?: Icons;
  iconRight?: Icons;
};
