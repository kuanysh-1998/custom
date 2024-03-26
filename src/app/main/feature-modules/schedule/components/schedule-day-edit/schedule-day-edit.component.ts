import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { ScheduleDay, ScheduleType, Time } from '../../models/schedule-models';
import { LocationModel } from '../../../../../models/location.model';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ScheduleService } from '../../services/schedule.service';
import { ValidatorService } from '../../services/validators.service';
import { DIALOG_DATA } from 'src/app/shared/tokens/dialog-data.token';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import { WpSnackBar } from 'src/app/shared/services/wp-snackbar.service';
import { LocalizationService } from 'src/app/shared/services/localization.service';

@Component({
  selector: 'app-schedule-day-edit',
  templateUrl: './schedule-day-edit.component.html',
  styleUrls: ['./schedule-day-edit.component.scss'],
})
export class ScheduleDayEditComponent implements OnInit {
  activeButton: 'cancel' | 'save' = 'save';
  selectedDays: ScheduleDay[] = [];
  isShowPopup = false;
  scheduleType: ScheduleType = ScheduleType.weekDays;
  locations: {
    text: string;
    value: LocationModel;
  }[] = [];

  dayTypes: {
    text: string;
    value: boolean;
  }[] = [
    {
      text: this.localization.getSync('Рабочий день'),
      value: false,
    },
    {
      text: this.localization.getSync('Выходной'),
      value: true,
    },
  ];

  intervals: {
    workTime: {
      start: Time;
      end: Time;
    };
    breakTime: {
      start: Time;
      end: Time;
    };
    boundaryInTime: {
      start: Time;
      end: Time;
    };
    boundaryOutTime: {
      start: Time;
      end: Time;
    };
  };

  dayTypeControl: FormControl<{
    text: string;
    value: boolean;
  }> = new FormControl<{
    text: string;
    value: boolean;
  }>(this.dayTypes[0]);

  lastSelectedDayType: {
    text: string;
    value: boolean;
  } = this.dayTypeControl.value;

  locationControl: FormControl<{
    text: string;
    value: LocationModel;
  }> = this.fb.control<{
    text: string;
    value: LocationModel;
  }>(null);

  intervalsFormGroup: FormGroup<{
    workTimeGroup: FormGroup<{
      start: FormControl<Time>;
      end: FormControl<Time>;
    }>;

    boundaryInTimeGroup: FormGroup<{
      start: FormControl<Time>;
      end: FormControl<Time>;
    }>;

    boundaryOutTimeGroup: FormGroup<{
      start: FormControl<Time>;
      end: FormControl<Time>;
    }>;

    breakTimeGroup: FormGroup<{
      start: FormControl<Time>;
      end: FormControl<Time>;
    }>;
  }>;

  get workTimeGroup(): FormGroup<{
    start: FormControl<Time>;
    end: FormControl<Time>;
  }> {
    return this.intervalsFormGroup.controls.workTimeGroup as FormGroup<{
      start: FormControl<Time>;
      end: FormControl<Time>;
    }>;
  }

  get boundaryInTimeGroup(): FormGroup<{
    start: FormControl<Time>;
    end: FormControl<Time>;
  }> {
    return this.intervalsFormGroup.controls.boundaryInTimeGroup as FormGroup<{
      start: FormControl<Time>;
      end: FormControl<Time>;
    }>;
  }

  get boundaryOutTimeGroup(): FormGroup<{
    start: FormControl<Time>;
    end: FormControl<Time>;
  }> {
    return this.intervalsFormGroup.controls.boundaryOutTimeGroup as FormGroup<{
      start: FormControl<Time>;
      end: FormControl<Time>;
    }>;
  }

  get breakTimeGroup(): FormGroup<{
    start: FormControl<Time>;
    end: FormControl<Time>;
  }> {
    return this.intervalsFormGroup.controls.breakTimeGroup as FormGroup<{
      start: FormControl<Time>;
      end: FormControl<Time>;
    }>;
  }

  constructor(
    private fb: FormBuilder,
    private validatorService: ValidatorService,
    private scheduleService: ScheduleService,
    private dialogService: DialogService,
    private localization: LocalizationService,
    private snackBar: WpSnackBar,
    @Inject(DIALOG_DATA)
    public data: {
      days: ScheduleDay[];
      scheduleType: ScheduleType;
      locations: LocationModel[];
    }
  ) {
    this.selectedDays = data.days;
    this.scheduleType = data.scheduleType;
    this.locations = data?.locations.map((location) => {
      return {
        text: location.name,
        value: location,
      };
    });

    this.dayTypeControl.setValue(
      this.selectedDays[0].isOffday ? this.dayTypes[1] : this.dayTypes[0]
    );

    if (!this.dayTypeControl.value.value) {
      this.locationControl.setValue(
        this.locations.find(
          (location) =>
            location.value.id === (data.days[0].workSpans[0].locationId ?? null)
        )
      );
    }

    this.intervals = this.scheduleService.getScheduleIntervals(data.days);

    this.intervalsFormGroup = this.fb.group(
      {
        workTimeGroup: this.fb.group({
          start: this.fb.nonNullable.control<Time>(
            this.intervals.workTime.start,
            [Validators.required]
          ),
          end: this.fb.nonNullable.control<Time>(this.intervals.workTime.end, [
            Validators.required,
          ]),
        }),

        boundaryInTimeGroup: this.fb.group({
          start: this.fb.nonNullable.control<Time>(
            this.intervals.boundaryInTime.start,
            [Validators.required]
          ),
          end: this.fb.nonNullable.control<Time>(
            this.intervals.boundaryInTime.end,
            [Validators.required]
          ),
        }),

        boundaryOutTimeGroup: this.fb.group({
          start: this.fb.nonNullable.control<Time>(
            this.intervals.boundaryOutTime.start,
            [Validators.required]
          ),
          end: this.fb.nonNullable.control<Time>(
            this.intervals.boundaryOutTime.end,
            [Validators.required]
          ),
        }),

        breakTimeGroup: this.fb.group({
          start: this.fb.nonNullable.control<Time>(
            this.intervals.breakTime.start
          ),
          end: this.fb.nonNullable.control<Time>(this.intervals.breakTime.end),
        }),
      },
      {
        validators: [this.validatorService.getValidateIntervals],
      }
    );
  }

  ngOnInit(): void {
    this.workTimeGroup.valueChanges.subscribe(() => {
      const startTime = this.workTimeGroup.controls.start.value;
      const endTime = this.workTimeGroup.controls.end.value;

      if (!startTime || !endTime) {
        return;
      }

      const startTotalMinutes = startTime.hour * 60 + startTime.minute;
      const endTotalMinutes = endTime.hour * 60 + endTime.minute;

      let totalWorkMinutes;

      if (startTotalMinutes === endTotalMinutes) {
        totalWorkMinutes = 24 * 60;
      } else if (endTotalMinutes > startTotalMinutes) {
        totalWorkMinutes = endTotalMinutes - startTotalMinutes;
      } else {
        totalWorkMinutes = 24 * 60 - startTotalMinutes + endTotalMinutes;
      }

      const workHours = Math.floor(totalWorkMinutes / 60);
      const workMinutes = totalWorkMinutes % 60;

      const newTime = {
        hour: workHours,
        minute: workMinutes,
      };

      this.boundaryInTimeGroup.controls.end.setValue(newTime);
      this.boundaryOutTimeGroup.controls.start.setValue(newTime);
    });
  }

  editSelectedDays() {
    if (this.intervalsFormGroup.invalid) {
      this.snackBar.open('Заполните все необходимые поля', 4000, 'error');
      return;
    }

    this.scheduleService.updateScheduleDays(
      this.selectedDays,
      this.locationControl.value?.value ?? null,
      this.dayTypeControl.value.value,
      {
        start: this.workTimeGroup.controls.start.value,
        end: this.workTimeGroup.controls.end.value,
      },
      {
        start: this.boundaryInTimeGroup.controls.start.value,
        end: this.boundaryInTimeGroup.controls.end.value,
      },
      {
        start: this.boundaryOutTimeGroup.controls.start.value,
        end: this.boundaryOutTimeGroup.controls.end.value,
      },
      {
        start:
          this.breakTimeGroup.controls.start.value &&
          this.breakTimeGroup.controls.end.value
            ? this.breakTimeGroup.controls.start.value
            : null,
        end:
          this.breakTimeGroup.controls.start.value &&
          this.breakTimeGroup.controls.end.value
            ? this.breakTimeGroup.controls.end.value
            : null,
      }
    );

    this.dialogService.close(ScheduleDayEditComponent, { saved: true });
  }

  onDateTypeChange(dateType: { text: string; value: boolean }) {
    this.lastSelectedDayType = dateType;
  }

  closeDialog() {
    this.dialogService.close(ScheduleDayEditComponent);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
        this.activeButton === 'save'
          ? this.editSelectedDays()
          : this.closeDialog();
        break;
      case 'ArrowLeft':
        this.activeButton = 'cancel';
        break;
      case 'ArrowRight':
        this.activeButton = 'save';
        break;
      default:
        break;
    }
  }
}
