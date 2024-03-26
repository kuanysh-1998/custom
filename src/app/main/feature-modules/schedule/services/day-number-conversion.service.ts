import { Injectable } from '@angular/core';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { ScheduleType } from '../models/schedule-models';

@Injectable({ providedIn: 'root' })
export class DayNumberConversionService {
  constructor(private localizationService: LocalizationService) {}

  public transform(dayNumber: number, scheduleType: ScheduleType): string {
    if (scheduleType === ScheduleType.cyclic) {
      return this.getDayNameForCyclicSchedule(dayNumber);
    }

    const days = [
      this.localizationService.getSync('Понедельник'),
      this.localizationService.getSync('Вторник'),
      this.localizationService.getSync('Среда'),
      this.localizationService.getSync('Четверг'),
      this.localizationService.getSync('Пятница'),
      this.localizationService.getSync('Суббота'),
      this.localizationService.getSync('Воскресенье'),
    ];

    return days[dayNumber - 1];
  }

  private getDayNameForCyclicSchedule(dayNumber: number): string {
    const dayTranslate = this.localizationService.getSync('день');
    return `${dayNumber} ${dayTranslate}`;
  }
}
