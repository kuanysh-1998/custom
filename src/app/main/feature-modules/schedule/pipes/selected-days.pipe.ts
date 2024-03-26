import { Pipe, PipeTransform } from '@angular/core';
import { ScheduleDay, ScheduleType } from '../models/schedule-models';
import { DayNumberConversionService } from '../services/day-number-conversion.service';

@Pipe({
  name: 'selectedDays',
})
export class SelectedDaysPipe implements PipeTransform {
  constructor(private dayNumberConversionService: DayNumberConversionService) {}

  transform(days: ScheduleDay[], scheduleType: ScheduleType): string {
    if (days.length <= 4) {
      return days
        .map((day) =>
          this.dayNumberConversionService.transform(day.dayNumber, scheduleType)
        )
        .join(', ');
    }

    const firstFourDays =
      scheduleType === ScheduleType.weekDays
        ? days.slice(0, 3)
        : days.slice(0, 4);
    const lastDay = days[days.length - 1];

    return `${firstFourDays
      .map((day) =>
        this.dayNumberConversionService.transform(day.dayNumber, scheduleType)
      )
      .join(', ')} ... ${this.dayNumberConversionService.transform(
      lastDay.dayNumber,
      scheduleType
    )}`;
  }
}
