import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { LocalizationService } from '../../../../../shared/services/localization.service';
import { ScheduleDay, ScheduleType } from '../../models/schedule-models';
import { ScheduleService } from '../../services/schedule.service';
import { ScheduleDayEditComponent } from '../schedule-day-edit/schedule-day-edit.component';
import { LocationModel } from '../../../../../models/location.model';
import { FormControl } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import notify from 'devextreme/ui/notify';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';

@UntilDestroy()
@Component({
  selector: 'app-schedule-action-control',
  templateUrl: './schedule-action-control.component.html',
  styleUrls: ['./schedule-action-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleActionControlComponent {
  @Output() editCompleted = new EventEmitter<boolean>();

  @Input()
  get scheduleType(): ScheduleType {
    return this._scheduleType;
  }
  set scheduleType(value: ScheduleType) {
    this._scheduleType = value;
    this.scheduleTypeControl.setValue(
      this.scheduleTypes.find((x) => x.value === value)
    );
  }

  @Input()
  get scheduleDays(): ScheduleDay[] {
    return this._scheduleDays;
  }
  set scheduleDays(value: ScheduleDay[]) {
    this._scheduleDays = value;
    this.cycleControl.setValue(value.length);
  }

  @Input()
  editingScheduleDays: ScheduleDay[] = [];

  @Input()
  locations: LocationModel[] = [];

  @Output()
  scheduleTypeChanged: EventEmitter<ScheduleType> =
    new EventEmitter<ScheduleType>();

  _scheduleType: ScheduleType;
  _scheduleDays: ScheduleDay[] = [];

  scheduleTypes: {
    text: string;
    value: ScheduleType;
  }[] = [
    {
      text: this.localizationService.getSync('Дни недели'),
      value: ScheduleType.weekDays,
    },
    {
      text: this.localizationService.getSync('Циклический график'),
      value: ScheduleType.cyclic,
    },
  ];

  cycleControl: FormControl<number> = new FormControl<number>(4);

  get ScheduleType() {
    return ScheduleType;
  }

  get editingDaysCount(): number {
    return this.editingScheduleDays.length;
  }

  scheduleTypeControl: FormControl<{
    text: string;
    value: ScheduleType;
  }> = new FormControl<{
    text: string;
    value: ScheduleType;
  }>(
    this.scheduleTypes.find((x) => {
      return x.value === this.scheduleType;
    })
  );

  constructor(
    private localizationService: LocalizationService,
    private scheduleService: ScheduleService,
    private cdr: ChangeDetectorRef,
    private dialogService: DialogService
  ) {
    this.scheduleTypeControl.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((value) => {
        if (value.value !== this.scheduleType) {
          this.onScheduleTypeChange(value);
        }
      });
  }

  onScheduleTypeChange(scheduleType: { text: string; value: ScheduleType }) {
    this.scheduleTypeChanged.emit(scheduleType.value);

    this.scheduleTypeControl.setValue(
      this.scheduleTypes.find((x) => x.value === this._scheduleType),
      { emitEvent: false }
    );
  }

  onCycleChange(number: number) {
    if (!number || number < 1 || number > 31) {
      const message = this.localizationService.getSync(
        'Количество дней может быть больше (или равно) 1, но меньше (или равно) 31'
      );
      notify({
        message,
        type: 'error',
      });
      this.cycleControl.setValue(this.scheduleDays.length);
    } else {
      this.scheduleService.generateCyclicSchedule(number);
    }
    this.cdr.detectChanges();
  }

  editDays() {
    this.dialogService.show('Редактирование', {
      componentType: ScheduleDayEditComponent,
      componentData: {
        days: this.editingScheduleDays,
        scheduleType: this.scheduleTypeControl.value.value,
        locations: this.locations,
      },
      onClose: (result) => {
        if (result.saved) {
          this.editCompleted.emit(result.saved);
        }
      },
    });
  }
}
