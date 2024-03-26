import { Injectable } from '@angular/core';
import { LocalizationService } from './localization.service';
import { DataSpans } from '../../models/reports.model';

@Injectable()
export class UtilsService {
  constructor(private localization: LocalizationService) {}

  getRandom(min, max) {
    let rand = Math.random() * (max - min) + min;
    rand = Math.floor(rand);
    return rand;
  }
  getMin(prop: string, array: any[]) {
    return array.reduce((min, y) => {
      Math.min(min, y[prop]);
    });
  }

  formatMinutes(minutes: number | null): string | null {
    if (minutes == null) {
      return null;
    }
    minutes = Math.round(minutes);
    const leftMinutes = minutes % 60;
    const hours = (minutes - leftMinutes) / 60;
    return `${hours.toString().padStart(2, '0')}:${leftMinutes
      .toString()
      .padStart(2, '0')}`;
  }

  formatTimeWithDescription(
    minutes: number | null
  ): string | null {
    if (minutes == null) {
      return this.localization.getSync('00ч 00мин');
    }
    minutes = Math.round(minutes);
    const leftMinutes = minutes % 60;
    const hours = (minutes - leftMinutes) / 60;
    return `${hours.toString().padStart(2, '0')}${this.localization.getSync(
      'ч'
    )} ${leftMinutes.toString().padStart(2, '0')}${this.localization.getSync(
      'мин'
    )}`;
  }

  formatTimeWithDescriptionForMarks(
    value: DataSpans,
    statusMark = false
  ): string | null {
    if (!value) {
      return null;
    }
    if (statusMark && value.lateIn == null) {
      return this.localization.getSync('нет графика');
    }
    if (statusMark && value.isMark === false) {
      return this.localization.getSync('нет отметки');
    }
    value.lateIn = Math.round(value.lateIn);
    const leftMinutes = value.lateIn % 60;
    const hours = (value.lateIn - leftMinutes) / 60;
    return `${hours.toString().padStart(2, '0')}${this.localization.getSync(
      'ч'
    )} ${leftMinutes.toString().padStart(2, '0')}${this.localization.getSync(
      'мин'
    )}`;
  }
}
