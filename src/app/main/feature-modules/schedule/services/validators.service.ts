import {
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { inject, Injectable } from '@angular/core';
import { LocalizationService } from '../../../../shared/services/localization.service';
import { Time } from '../models/schedule-models';

@Injectable({
  providedIn: 'root',
})
export class ValidatorService {
  localization = inject(LocalizationService);

  boundaryInTimeStartErrorMessage: string =
    'Интервал от начала "Принимать отметки прихода" до начала рабочего времени должен быть не больше 24 часов. Пожалуйста, измените настройки';
  boundaryInTimeEndErrorMessage: string =
    'Интервал от начала рабочего времени до завершения "Принимать отметки прихода" должен быть не больше длительности рабочего времени. Пожалуйста, измените настройки';
  boundaryOutTimeStartErrorMessage: string =
    'Интервал от начала рабочего времени до завершения "Принимать отметки ухода" должен быть не больше длительности рабочего времени. Пожалуйста, измените настройки';
  boundaryOutTimeEndErrorMessage: string =
    'Интервал от завершения рабочего времени до завершения "Принимать отметки ухода" должен быть не больше 24 часов. Пожалуйста, измените настройки';
  breakTimeErrorMessage: string =
    'Перерыв должен находиться внутри интервала Рабочего времени. Пожалуйста, измените настройки';

  getValidateIntervals: ValidatorFn = (
    group: FormGroup<{
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
    }>
  ): ValidationErrors | null => {
    const MINUTES_IN_DAY = 1440;

    const toMinutes = (timeObj: Time | null): number | null => {
      if (
        !timeObj ||
        timeObj.hour < 0 ||
        timeObj.hour > 24 ||
        timeObj.minute < 0 ||
        timeObj.minute > 59
      ) {
        return null;
      }
      return timeObj.hour * 60 + timeObj.minute;
    };

    const workTime = group.controls.workTimeGroup.value;
    let workStartMinutes = toMinutes(workTime.start);
    let workEndMinutes = toMinutes(workTime.end);

    if (workStartMinutes === null || workEndMinutes === null) {
      return null;
    }

    if (workEndMinutes <= workStartMinutes) {
      workEndMinutes += MINUTES_IN_DAY;
    }

    const boundaryInTime = group.controls.boundaryInTimeGroup.value;
    const boundaryInStartMinutes = toMinutes(boundaryInTime.start);
    const boundaryInEndMinutes = toMinutes(boundaryInTime.end);

    if (boundaryInStartMinutes > MINUTES_IN_DAY) {
      group.controls.boundaryInTimeGroup.controls.start.setErrors({
        customError: true,
      });
      return {
        message: this.localization.getSync(
          this.boundaryInTimeStartErrorMessage
        ),
      };
    }

    if (boundaryInEndMinutes > workEndMinutes - workStartMinutes) {
      group.controls.boundaryInTimeGroup.controls.end.setErrors({
        customError: true,
      });
      return {
        message: this.localization.getSync(this.boundaryInTimeEndErrorMessage),
      };
    }

    const boundaryOutTime = group.controls.boundaryOutTimeGroup.value;
    const boundaryOutStartMinutes = toMinutes(boundaryOutTime.start);
    const boundaryOutEndMinutes = toMinutes(boundaryOutTime.end);

    if (boundaryOutStartMinutes > workEndMinutes - workStartMinutes) {
      group.controls.boundaryOutTimeGroup.controls.start.setErrors({
        customError: true,
      });
      return {
        message: this.localization.getSync(
          this.boundaryOutTimeStartErrorMessage
        ),
      };
    }

    if (boundaryOutEndMinutes > MINUTES_IN_DAY) {
      group.controls.boundaryOutTimeGroup.controls.end.setErrors({
        customError: true,
      });
      return {
        message: this.localization.getSync(this.boundaryOutTimeEndErrorMessage),
      };
    }

    const startControl = group.controls.breakTimeGroup.controls.start;
    const endControl = group.controls.breakTimeGroup.controls.end;

    startControl.setErrors(null);
    endControl.setErrors(null);

    const breakTime = group.controls.breakTimeGroup.value;

    if (breakTime.start === null && breakTime.end === null) {
      return null;
    }

    if (breakTime.start === null) {
      startControl.setErrors({ required: true });
    }
    if (breakTime.end === null) {
      endControl.setErrors({ required: true });
    }

    let breakStartMinutes = this.validateTimeControl(startControl);
    let breakEndMinutes = this.validateTimeControl(endControl);

    if (breakStartMinutes !== null && breakEndMinutes !== null) {
      if (breakStartMinutes < workStartMinutes) {
        breakStartMinutes += MINUTES_IN_DAY;
        breakEndMinutes += MINUTES_IN_DAY;
      }

      if (breakEndMinutes < workStartMinutes) {
        breakEndMinutes += MINUTES_IN_DAY;
      }

      if (
        breakStartMinutes > workEndMinutes ||
        breakEndMinutes > workEndMinutes ||
        breakStartMinutes > breakEndMinutes
      ) {
        startControl.setErrors({ customError: true });
        endControl.setErrors({ customError: true });
        return {
          message: this.localization.getSync(this.breakTimeErrorMessage),
        };
      }
    } else {
      return null;
    }
    return null;
  };

  validateTimeControl(control): number | null {
    const time = control.value;

    if (!time || (time.hour === null && time.minute === null)) {
      control.setErrors({ required: true });
      return null;
    }

    const hourIsValid =
      Number.isInteger(time.hour) && time.hour >= 0 && time.hour <= 23;
    const minuteIsValid =
      Number.isInteger(time.minute) && time.minute >= 0 && time.minute <= 59;

    if (!hourIsValid || !minuteIsValid) {
      control.setErrors({ invalidTime: true });
      return null;
    }

    return time.hour * 60 + time.minute;
  }
}
