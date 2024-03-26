import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { LocalizationService } from '../services/localization.service';

export class WpCustomValidators {
  static dateRangeRequired(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const range: Date[] | null = control.value;
      if (
        !Array.isArray(range) ||
        range.length !== 2 ||
        !range[0] ||
        !range[1]
      ) {
        return { dateRangeRequired: true };
      }
      return null;
    };
  }

  static maxDayInterval(maxIntervalDays: number, message: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value || !Array.isArray(value) || value.length !== 2) {
        return null;
      }

      const [startDate, endDate] = value;
      const maxEndDate = new Date(startDate);
      maxEndDate.setDate(maxEndDate.getDate() + maxIntervalDays);

      if (endDate > maxEndDate) {
        return {
          custom: true,
          message: message,
        };
      }

      return null;
    };
  }

  static dateRequired(errorMessage: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return {
          custom: true,
          message: errorMessage,
        };
      }
      return null;
    };
  }

  static maxLength(
    maxLength: number,
    localizationService: LocalizationService
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value && control.value.length > maxLength) {
        return {
          custom: true,
          message: localizationService.getSync(
            'Максимальная длина поля: __length__ символов',
            { length: maxLength }
          ),
        };
      }
      return null;
    };
  }

  static iinValidator(localizationService: LocalizationService): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value && !/^\d{12}$/.test(control.value)) {
        return {
          custom: true,
          message: localizationService.getSync(
            'ИИН должен состоять из 12 цифр'
          ),
        };
      }
      return null;
    };
  }

  static strictEmail(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

      if (control.value && !emailRegex.test(control.value)) {
        return { email: true };
      }
      return null;
    };
  }

  static noWhitespaceValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const isWhitespace = (control.value || '').trim().length === 0;
      const isValid = !isWhitespace;
      return isValid ? null : { required: true };
    };
  }
}
