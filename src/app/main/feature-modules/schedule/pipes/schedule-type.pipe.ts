import { Pipe, PipeTransform } from '@angular/core';
import { ScheduleType } from '../models/schedule-models';

@Pipe({
  name: 'scheduleType',
})
export class ScheduleTypePipe implements PipeTransform {
  transform(value: ScheduleType): string {
    switch (value) {
      case 0:
        return 'Циклический';
      case 1:
        return 'Дни недели';
      default:
        return '';
    }
  }
}
