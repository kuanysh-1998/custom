import {
  Component,
  Inject,
  ChangeDetectionStrategy,
  OnInit,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core';
import { Timetable } from '../../../main/feature-modules/schedule/models/timetable';
import {
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { format } from 'date-fns';
import { TimetableApiService } from 'src/app/services/timatable-api.service';
import { DialogService } from '../../services/wp-dialog.service';
import { WpSnackBar } from '../../services/wp-snackbar.service';
import { DIALOG_DATA } from '../../tokens/dialog-data.token';
import { WpCustomValidators } from '../../validators/wp-custom-validators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-edit-timetable',
  templateUrl: './edit-timetable.component.html',
  styleUrls: ['./edit-timetable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditTimetableComponent implements OnInit {
  form: FormGroup;
  minDate: Date = new Date(1001, 0, 1);
  maxDate: Date = new Date(9000, 11, 31);
  startDate: Date | null = null;
  endDate: Date | null = null;

  timetable: Timetable;
  hasStartDateEditorSpecificError = false;
  hasEndDateEditorSpecificError = false;
  activeButton: 'cancel' | 'save' = 'save';
  isEditing = false;

  constructor(
    private fb: FormBuilder,
    private timetableApiService: TimetableApiService,
    private dialogService: DialogService,
    private snackBar: WpSnackBar,
    private cdr: ChangeDetectorRef,
    @Inject(DIALOG_DATA) private data: Timetable
  ) {
    this.timetable = data;
  }

  ngOnInit() {
    const startDate = new Date(this.timetable.startDate);
    const endDate = new Date(this.timetable.endDate);

    this.form = this.fb.group({
      startDate: [
        startDate,
        [
          WpCustomValidators.dateRequired('Выберите дату'),
          this.editorSpecificValidator('startDate'),
        ],
      ],
      endDate: [
        endDate,
        [
          WpCustomValidators.dateRequired('Выберите дату'),
          this.editorSpecificValidator('endDate'),
        ],
      ],
    });
  }

  edit() {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.snackBar.open('Заполните все необходимые поля', 5000, 'error');
      return;
    }

    this.isEditing = true;

    const { startDate, endDate } = this.form.value;

    this.timetableApiService
      .edit({
        timetableId: this.timetable.id,
        start: format(startDate, 'yyyy-MM-dd'),
        end: format(endDate, 'yyyy-MM-dd'),
      })
      .pipe(
        finalize(() => {
          this.isEditing = false;
          this.cdr.markForCheck();
        }),
        untilDestroyed(this)
      )
      .subscribe(() => {
        this.snackBar.open('Расписание успешно изменено', 5000, 'success');

        this.dialogService.close(EditTimetableComponent, { saved: true });
      });
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

  closeDialog() {
    this.dialogService.close(EditTimetableComponent);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
        this.activeButton === 'save' ? this.edit() : this.closeDialog();
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
