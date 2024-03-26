import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  SuspiciousModel,
  TimeTableList,
} from '../../../../models/suspicious.model';
import {
  EmployeeBlockData,
  UpdateMarkData,
} from 'src/app/models/report-employee.model';
import { LocalizationService } from 'src/app/shared/services/localization.service';

@Component({
  selector: 'app-employee-block',
  templateUrl: './employee-block.component.html',
  styleUrls: ['./employee-block.component.scss'],
})
export class EmployeeBlockComponent {
  @Input() employeeBlockData: EmployeeBlockData;
  @Input() mark: boolean = false;
  @Input() dataTimeTableList: TimeTableList[];
  @Output() updateMarkEvent = new EventEmitter<UpdateMarkData>();

  isEditingSchedule: boolean = false;
  selectedTimetableSpanId: string;
  noDataText = `<p>${this.localization.getSync(
    'Подходящее расписание не найдено'
  )}</p>`;

  isAccordionOpen: boolean = false;
  _suspicious: SuspiciousModel;

  constructor(private localization: LocalizationService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.employeeBlockData) {
      const currentData = changes.employeeBlockData.currentValue;
      if (currentData && currentData.timetableSpan) {
        this.selectedTimetableSpanId = currentData.timetableSpan.id;
      }
    }
  }

  editTimetable() {
    this.isEditingSchedule = true;
  }

  save() {
    this.isEditingSchedule = false;

    const updateData = {
      markId: this.employeeBlockData.id,
      timetableSpanId: this.selectedTimetableSpanId,
    };
    this.updateMarkEvent.emit(updateData);
  }

  cancelEditTimetable(): void {
    this.isEditingSchedule = false;
    if (this.employeeBlockData && this.employeeBlockData.timetableSpan) {
      this.selectedTimetableSpanId = this.employeeBlockData.timetableSpan.id;
    }
  }
}
