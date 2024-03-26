import { Pipe, PipeTransform } from '@angular/core';
import { TimeRange } from '../models/schedule-models';

@Pipe({
  name: 'scheduleTime',
})
export class ScheduleTimePipe implements PipeTransform {
  transform(scheduleTime: TimeRange): string {
    if (!scheduleTime) {
      return '-';
    }

    return `${this.formatTime(scheduleTime.start.hour)}:${this.formatTime(
      scheduleTime.start.minute
    )}
           - ${this.formatTime(scheduleTime.end.hour)}:${this.formatTime(
      scheduleTime.end.minute
    )}`;
  }

  private formatTime(time: number) {
    if (time < 10) {
      return `0${time}`;
    } else {
      return `${time}`;
    }
  }
}
