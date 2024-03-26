import { Injectable } from '@angular/core';
import { LocalizationService } from './localization.service';

@Injectable({ providedIn: 'root' })
export class ValidationMessagesService {
  constructor(private localization: LocalizationService) {}

  public getValidatorErrorMessage(validatorName: string, validatorValue?: any) {
    if (validatorValue.message && validatorValue.message.length > 0) {
      return validatorValue.message;
    } else
      switch (validatorName) {
        case 'required':
          return this.localization.getSync('Поле обязательно для заполнения');
        case 'email':
          return this.localization.getSync('Некорректный email');
        case 'invalidTime':
          return this.localization.getSync('Значение должно быть временем');
        case 'minLength':
        case 'minlength':
          return this.localization.getSync(
            'Минимальное количество символов: __length__',
            { length: validatorValue.requiredLength }
          );
        case 'maxLength':
        case 'maxlength':
          return this.localization.getSync(
            'Максимальное количество символов: __length__',
            { length: validatorValue.requiredLength }
          );
        case 'mask':
          return this.localization.getSync(
            'Значение поля не соответствует шаблону'
          );
        case 'pattern':
          return this.localization.getSync(
            'Значение поля не соответствует шаблону'
          );
        case 'compare':
          return this.localization.getSync('Значения полей должны совпадать');
        case 'greaterThan':
          return this.localization.getSync(
            'Значение поля должно быть больше __value__',
            { value: validatorValue.refValues[1] }
          );
        case 'maxNumber':
          return this.localization.getSync(
            'Значение поля не должно быть больше __value__',
            { value: validatorValue.refValues[1] }
          );
        case 'digit':
          return this.localization.getSync('Поле принимает только числа');
        case 'notEmpty':
          return this.localization.getSync('Поле необходимо заполнить');
      }
    if (validatorValue) {
      return validatorValue;
    }
    return this.localization.getSync('Поле содержит ошибку');
  }
}
