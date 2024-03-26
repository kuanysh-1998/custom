import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { AuthorizeService } from '../../../../../auth/services/authorize.service';
import { Observable } from 'rxjs';
import {
  Schedule,
  ScheduleDay,
  ScheduleType,
  ScheduleStatus,
  ScheduleContext,
  WorkSpan,
} from '../../models/schedule-models';
import { ScheduleService } from '../../services/schedule.service';
import { LocationModel } from 'src/app/models/location.model';
import { LocationService } from 'src/app/services/location.service';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import { ScheduleDayEditComponent } from '../schedule-day-edit/schedule-day-edit.component';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';

@UntilDestroy()
@Component({
  selector: 'app-schedule-plan',
  templateUrl: './schedule-plan.component.html',
  styleUrls: ['./schedule-plan.component.scss'],
})
export class SchedulePlanComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;
  @Input() context: ScheduleContext;
  @Input() schedule: Schedule;
  @Input() isDraft: boolean = false;
  @Input() isCopyMode: boolean = false;
  @Output() saveChangesRequested = new EventEmitter<ScheduleDay[]>();
  @Output() publishRequested = new EventEmitter<ScheduleDay[]>();
  @Output() scheduleChanged = new EventEmitter<Schedule>();
  locations: LocationModel[] = [];
  scheduleDays$: Observable<ScheduleDay[]>;
  statuses: boolean[] = [];
  contextMenuStatuses: boolean[] = [];
  protected readonly ScheduleStatus = ScheduleStatus;
  protected readonly ScheduleContext = ScheduleContext;
  scheduleDays: ScheduleDay[];

  constructor(
    private locationService: LocationService,
    private auth: AuthorizeService,
    private scheduleService: ScheduleService,
    private router: Router,
    private localization: LocalizationService,
    private dialogService: DialogService
  ) {
    this.statuses = new Array(7).fill(false, 0, 7);
    this.scheduleDays$ = this.scheduleService.getScheduleDays();
  }

  ngOnInit(): void {
    this.getLocations();

    this.scheduleDays$.pipe(untilDestroyed(this)).subscribe((scheduleDays) => {
      this.statuses = new Array(scheduleDays.length).fill(
        false,
        0,
        scheduleDays.length
      );
      this.schedule.days = [];
      if (this.dataGrid && this.dataGrid.instance) {
        this.dataGrid.instance.clearSelection();
      }
    });
  }

  editMenuItems = [
    {
      text: this.localization.getSync('Редактировать'),
      actionType: 'edit',
    },
  ];

  openContextMenu(cellInfo: any) {
    this.contextMenuStatuses[cellInfo.rowIndex] = true;
  }

  executeAction(action, data: ScheduleDay) {
    if (action.actionType === 'edit') {
      this.editDays(data);
    }
  }

  editDays(selectedDay: ScheduleDay) {
    this.dialogService.show('Редактирование', {
      componentType: ScheduleDayEditComponent,
      componentData: {
        days: [selectedDay],
        scheduleType: this.schedule.type,
        locations: this.locations,
      },
    });
  }

  handleSelectionChange(e: any) {
    const selectedRowsData = e.selectedRowsData;
    this.schedule.days = selectedRowsData;

    if (this.scheduleDays) {
      this.statuses = this.scheduleDays.map((day) =>
        selectedRowsData.some(
          (selectedDay) => selectedDay.dayNumber === day.dayNumber
        )
      );
    }
  }

  scheduleTypeChange(scheduleType: ScheduleType) {
    this.schedule = {
      ...this.schedule,
      type: scheduleType,
      days: [],
    };
    this.dataGrid.instance.clearSelection();
    this.scheduleService.switchScheduleType(scheduleType);
    this.scheduleChanged.emit(this.schedule);
  }

  private getLocations() {
    this.locationService
      .getAllLocation(this.auth.currentOrganizationId)
      .pipe(untilDestroyed(this))
      .subscribe((locations) => {
        this.locations = locations;
      });
  }

  returnToTable() {
    this.router.navigate(['timesheet2']);
  }

  onEditCompleted(e: any) {
    if (e) {
      this.dataGrid.instance.clearSelection();
    }
  }

  onRowPrepared(e) {
    if (e.rowType === 'data' && e.data.isOffday) {
      const className = e.data.isSelected
        ? 'day-off-row-selected'
        : 'day-off-row';
      e.rowElement.classList.add(className);
      e.rowElement.style.padding = '0';
    }
  }

  calculateTimeRange(startHour, startMinute, endHour, endMinute): string {
    const formattedStart = this.formatTime(startHour, startMinute);
    const formattedEnd = this.formatTime(endHour, endMinute);
    return `${formattedStart} - ${formattedEnd}`;
  }

  calculateBoundaryInTime(workSpan: WorkSpan): string {
    let startHour =
      workSpan.workTime.start.hour - workSpan.boundaryInTime.start.hour;
    let startMinute =
      workSpan.workTime.start.minute - workSpan.boundaryInTime.start.minute;
    let endHour =
      workSpan.workTime.start.hour + workSpan.boundaryInTime.end.hour;
    let endMinute =
      workSpan.workTime.start.minute + workSpan.boundaryInTime.end.minute;

    if (startMinute < 0) {
      startHour--;
      startMinute += 60;
    }
    if (endMinute >= 60) {
      endHour++;
      endMinute -= 60;
    }

    startHour = (24 + startHour) % 24;
    endHour = endHour % 24;

    return this.calculateTimeRange(startHour, startMinute, endHour, endMinute);
  }

  calculateBoundaryOutTime(workSpan: WorkSpan): string {
    let startHour =
      workSpan.workTime.end.hour - workSpan.boundaryOutTime.start.hour;
    let startMinute =
      workSpan.workTime.end.minute - workSpan.boundaryOutTime.start.minute;
    let endHour =
      workSpan.workTime.end.hour + workSpan.boundaryOutTime.end.hour;
    let endMinute =
      workSpan.workTime.end.minute + workSpan.boundaryOutTime.end.minute;

    if (startMinute < 0) {
      startHour--;
      startMinute += 60;
    }
    if (endMinute >= 60) {
      endHour++;
      endMinute -= 60;
    }

    startHour = (24 + startHour) % 24;
    endHour = endHour % 24;

    return this.calculateTimeRange(startHour, startMinute, endHour, endMinute);
  }

  formatTime(hour: number, minute: number): string {
    return `${hour.toString().padStart(2, '0')}:${minute
      .toString()
      .padStart(2, '0')}`;
  }
}
