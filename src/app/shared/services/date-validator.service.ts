import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class DateValidatorService {
  constructor() {}

  maxDayInterval(maxDateRange: number) {
    return (
      control: AbstractControl
    ): { [key: string]: boolean | string } | null => {
      const range = control.value;
      if (range == null || range.length === 0) {
        return null;
      }
      const [start, end] = range;
      if (start == null || end == null) {
        return { mesage: true };
      }
      if (this.isDifferenceWithinDays(end, start, maxDateRange)) {
        return { message: true };
      }
      return null;
    };
  }

  isDifferenceWithinDays(end, start, maxDateRange) {
    const diffInMillisecs = Math.abs(end - start);
    return diffInMillisecs > maxDateRange;
  }
}
