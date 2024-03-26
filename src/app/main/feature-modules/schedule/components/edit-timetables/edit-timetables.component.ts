import {
  Component,
  OnInit,
  Inject,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { DIALOG_DATA } from 'src/app/shared/tokens/dialog-data.token';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import { format } from 'date-fns';
import { LocalizationService } from '../../../../../shared/services/localization.service';
import notify from 'devextreme/ui/notify';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TimetableApiService } from 'src/app/services/timatable-api.service';
import { WpSnackBar } from 'src/app/shared/services/wp-snackbar.service';
import { finalize } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-edit-timetables',
  templateUrl: './edit-timetables.component.html',
  styleUrls: ['./edit-timetables.component.scss'],
})
export class EditTimetablesComponent {
  form: FormGroup;
  timetablesId: string[];

  minDate: Date = new Date(1001, 0, 1);
  maxDate: Date = new Date(9000, 11, 31);

  hasStartDateEditorSpecificError = false;
  hasEndDateEditorSpecificError = false;

  activeButton: 'cancel' | 'save' = 'save';
  isUpdating = false;

  constructor(
    private dialogService: DialogService,
    private fb: FormBuilder,
    private timetableApiService: TimetableApiService,
    private localization: LocalizationService,
    private cdr: ChangeDetectorRef,
    private snackBar: WpSnackBar,
    @Inject(DIALOG_DATA) private data: any
  ) {
    this.timetablesId = data.timetablesId;

    this.form = this.fb.group({
      startDateEditable: false,
      startDate: [
        null,
        [
          this.dateValidator('startDate'),
          this.editorSpecificValidator('startDate'),
        ],
      ],
      endDateEditable: false,
      endDate: [
        null,
        [
          this.dateValidator('endDate'),
          this.editorSpecificValidator('endDate'),
        ],
      ],
    });

    this.form.controls['startDate'].disable();
    this.form.controls['startDateEditable'].valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((value) => {
        if (value) {
          this.form.controls['startDate'].enable();
        } else {
          this.form.controls['startDate'].setValue(null);
          this.form.controls['startDate'].disable();
        }
      });

    this.form.controls['endDate'].disable();
    this.form.controls['endDateEditable'].valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((value) => {
        if (value) {
          this.form.controls['endDate'].enable();
        } else {
          this.form.controls['endDate'].setValue(null);
          this.form.controls['endDate'].disable();
        }
      });
  }

  dateValidator(fieldName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      var parent = control.parent;
      if (parent) {
        var editable = parent.controls[fieldName + 'Editable'].value;
        if (editable) {
          return Validators.required(control);
        }
      }

      return null;
    };
  }

  onDateChanged(e: any, dateType: 'startDate' | 'endDate') {
    if (e.name === 'validationErrors') {
      const validationErrors = e.value;
      const newHasEditorSpecificError =
        validationErrors && validationErrors.some((err) => err.editorSpecific);

      const errorProperty =
        dateType === 'startDate'
          ? 'hasStartDateEditorSpecificError'
          : 'hasEndDateEditorSpecificError';
      if (this[errorProperty] !== newHasEditorSpecificError) {
        this[errorProperty] = newHasEditorSpecificError;
      }
    }
  }

  editorSpecificValidator(dateType: 'startDate' | 'endDate'): ValidatorFn {
    return (): ValidationErrors | null => {
      const errorProperty =
        dateType === 'startDate'
          ? 'hasStartDateEditorSpecificError'
          : 'hasEndDateEditorSpecificError';
      return this[errorProperty] ? { editorSpecificError: true } : null;
    };
  }

  update() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('Заполните все необходимые поля', 5000, 'error');
      return;
    }

    this.isUpdating = true;

    const startDate = this.form.controls['startDate'].value;
    const endDate = this.form.controls['endDate'].value;

    if (!startDate && !endDate) {
      this.isUpdating = false;
      this.cdr.markForCheck();
      this.dialogService.close(EditTimetablesComponent);
      return;
    }

    this.timetableApiService
      .editBatch({
        timetablesId: this.timetablesId,
        start: startDate ? format(startDate, 'yyyy-MM-dd') : startDate,
        end: endDate ? format(endDate, 'yyyy-MM-dd') : endDate,
      })
      .pipe(
        finalize(() => {
          this.isUpdating = false;
          this.cdr.markForCheck();
        }),
        untilDestroyed(this)
      )
      .subscribe({
        next: () => {
          const message = this.localization.getSync(
            'Расписания успешно изменены'
          );
          notify({
            message,
            type: 'success',
          });
          this.dialogService.close(EditTimetablesComponent, { saved: true });
        },
      });
  }

  close() {
    this.dialogService.close(EditTimetablesComponent);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
        this.activeButton === 'save' ? this.update() : this.close();
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
