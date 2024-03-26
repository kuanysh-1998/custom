import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { isToday } from 'date-fns';
import { DayType } from '../../models/scheduler-models';
import { SchedulerDay } from '../../models/scheduler-models';
import { Locale } from 'src/app/shared/consts/locale.const';

@Component({
  selector: 'app-scheduler-table',
  templateUrl: './scheduler-table.component.html',
  styleUrls: ['./scheduler-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchedulerTableComponent {
  @Input() days: SchedulerDay[] = [];
  @Input() rowHeaderNames: {
    employeeId: string;
    employeeName: string;
    employeeIsDeleted: boolean;
  }[] = [];
  @Input() columnHeaderDates = [];
  DayType = DayType;
  currentLocale: Locale;
  quantityWorkOff: number = 1;
  itemId: string;

  ngOnInit(): void {}

  isCurrentDay(date: string): boolean {
    return isToday(new Date(date));
  }

  isPastOrCurrentDate(dateString: string): boolean {
    let today = new Date();
    let date = new Date(dateString);
    return date <= today;
  }

  filteredArray(date: string, employeeId: string) {
    const filteredArray = this.days.filter((item: SchedulerDay) => {
      return item.date === date && item.employeeId === employeeId;
    });
    return filteredArray;
  }

  showPopup(data: SchedulerDay, typeMark: string): void {
    this.itemId = typeMark + data.id;
  }

  showPopupText(itemId: string) {
    switch (true) {
      case itemId.includes('inMark'):
        return 'Отметка прихода';
      case itemId.includes('outMark'):
        return 'Отметка ухода';
      case itemId.includes('noMark'):
        return 'Нет отметки';
    }
  }
}
