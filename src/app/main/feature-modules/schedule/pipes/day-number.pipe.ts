import { Pipe, PipeTransform } from '@angular/core';
import { ScheduleType } from '../models/schedule-models';
import { DayNumberConversionService } from '../services/day-number-conversion.service';

@Pipe({
  name: 'dayNumber',
})
export class DayNumberPipe implements PipeTransform {
  constructor(private dayNumberConversionService: DayNumberConversionService) {}

  transform(dayNumber: number, scheduleType: ScheduleType): string {
    return this.dayNumberConversionService.transform(dayNumber, scheduleType);
  }
}
