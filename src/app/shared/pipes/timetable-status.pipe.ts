import { Pipe, PipeTransform } from '@angular/core';
import { TimetableStatus } from '../../main/feature-modules/schedule/models/timetable';
import { LocalizationService } from '../services/localization.service';

@Pipe({
  name: 'timetableStatus',
})
export class TimetableStatusPipe implements PipeTransform {
  constructor(private localization: LocalizationService) {}

  transform(value: TimetableStatus): string {
    switch (value) {
      case TimetableStatus.created:
        return this.localization.getSync('Создано');
      case TimetableStatus.active:
        return this.localization.getSync('Активно');
      case TimetableStatus.expired:
        return this.localization.getSync('Завершено');
      default:
        return '';
    }
  }
}
