import { HttpErrorResponse } from '@angular/common/http';
import {
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  OnInit,
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { format } from 'date-fns';
import DataSource from 'devextreme/data/data_source';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PublishScheduleForm } from 'src/app/main/feature-modules/schedule/models/schedule-models';
import { ScheduleAPIService } from 'src/app/services/schedule-api.service';
import { HttpCustom } from 'src/app/shared/http';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import { WpSnackBar } from 'src/app/shared/services/wp-snackbar.service';
import { DIALOG_DATA } from 'src/app/shared/tokens/dialog-data.token';
import { WpCustomValidators } from 'src/app/shared/validators/wp-custom-validators';

@UntilDestroy()
@Component({
  selector: 'app-add-timetable',
  templateUrl: './add-timetable.component.html',
  styleUrls: ['./add-timetable.component.scss'],
})
export class EmployeeAddTimetableComponent implements OnInit {
  scheduleDataSource: DataSource;
  form: FormGroup;
  minDate: Date = new Date(1001, 0, 1);
  maxDate: Date = new Date(9000, 11, 31);

  startDate: Date | null = null;
  endDate: Date | null = null;

  hasStartDateEditorSpecificError = false;
  hasEndDateEditorSpecificError = false;
  activeButton: 'cancel' | 'save' = 'save';
  isPublishing = false;

  constructor(
    private httpCustom: HttpCustom,
    private scheduleAPIService: ScheduleAPIService,
    private fb: FormBuilder,
    private dialogService: DialogService,
    private cdr: ChangeDetectorRef,
    private snackBar: WpSnackBar,
    @Inject(DIALOG_DATA) public data: { employeeId: string }
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      startDate: [
        null,
        [
          WpCustomValidators.dateRequired('Выберите дату'),
          this.editorSpecificValidator('startDate'),
        ],
      ],
      endDate: [
        null,
        [
          WpCustomValidators.dateRequired('Выберите дату'),
          this.editorSpecificValidator('endDate'),
        ],
      ],
      scheduleId: ['', Validators.required],
    });
    this.initializeScheduleDataSource();
  }

  private initializeScheduleDataSource(): void {
    const dataStore = this.httpCustom.createStore(
      'id',
      this.scheduleAPIService.getScheduleURL()
    );

    this.scheduleDataSource = new DataSource({
      store: dataStore,
      sort: [{ selector: 'name', desc: false }],
    });
  }

  publish() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('Заполните все необходимые поля', 5000, 'error');
      return;
    }

    this.isPublishing = true;

    const form: PublishScheduleForm = this.preparePublishData();

    this.scheduleAPIService
      .publish(form)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.snackBar.open(err.error, 5000, 'error');
          return of(err);
        }),
        finalize(() => {
          this.isPublishing = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe((res) => {
        if (!(res instanceof HttpErrorResponse)) {
          this.snackBar.open('Расписание создано успешно', 5000, 'success');
          this.dialogService.close(EmployeeAddTimetableComponent, {
            saved: true,
          });
        }
      });
  }

  preparePublishData(): PublishScheduleForm {
    const { startDate, endDate, scheduleId } = this.form.value;
    return {
      id: scheduleId,
      employeesId: [this.data.employeeId],
      start: format(startDate, 'yyyy-MM-dd'),
      end: format(endDate, 'yyyy-MM-dd'),
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

  closeModal() {
    this.dialogService.close(EmployeeAddTimetableComponent);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
        this.activeButton === 'save' ? this.publish() : this.closeModal();
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
