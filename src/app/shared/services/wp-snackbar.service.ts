import { Injectable } from '@angular/core';
import notify from 'devextreme/ui/notify';
import { LocalizationService } from './localization.service';

@Injectable({
  providedIn: 'root',
})
export class WpSnackBar {
  constructor(private localizationService: LocalizationService) {}

  open(
    message: string,
    displayTime: number = 5000,
    type: string = 'custom'
  ): void {
    notify(
      {
        message: this.localizationService.getSync(message),
        closeOnClick: true,
        type: type,
        displayTime: displayTime,
        stylingMode: 'custom',
      },
      type,
      displayTime
    );
  }
}
