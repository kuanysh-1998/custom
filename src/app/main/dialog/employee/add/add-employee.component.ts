import {
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { DepartmentService } from '../../../../services/department.service';
import { EmployeeService } from '../../../../services/employee.service';
import { WpSnackBar } from 'src/app/shared/services/wp-snackbar.service';
import { EmployeeCreationModel } from 'src/app/models/employee.model';
import { DIALOG_DATA } from 'src/app/shared/tokens/dialog-data.token';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import DataSource from 'devextreme/data/data_source';
import { HttpCustom } from 'src/app/shared/http';
import { WpCustomValidators } from 'src/app/shared/validators/wp-custom-validators';
import { format } from 'date-fns';
import { ShortDateFormat } from 'src/app/shared/consts/date-format.const';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs/operators';

@UntilDestroy()
@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.scss'],
})
export class AddEmployeeComponent implements OnInit {
  form: FormGroup;
  departmentsDataSource: DataSource;
  maxDate: Date = new Date();
  isSubmitting = false;
  hasDateEditorSpecificError = false;
  activeButton: 'cancel' | 'save' = 'save';

  constructor(
    @Inject(DIALOG_DATA)
    public data: { organizationId: string; hasIntegrationWith_1C: boolean },
    private departmentService: DepartmentService,
    private snackBar: WpSnackBar,
    private service: EmployeeService,
    private dialogService: DialogService,
    private fb: FormBuilder,
    private httpCustom: HttpCustom,
    private localization: LocalizationService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.initDepartmentsDataSource();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      lastName: [
        '',
        [
          Validators.required,
          WpCustomValidators.maxLength(50, this.localization),
          WpCustomValidators.noWhitespaceValidator(),
        ],
      ],
      firstName: [
        '',
        [
          Validators.required,
          WpCustomValidators.maxLength(50, this.localization),
          WpCustomValidators.noWhitespaceValidator(),
        ],
      ],
      middleName: ['', [WpCustomValidators.maxLength(50, this.localization)]],
      dateOfBirth: [null, [this.editorSpecificValidator()]],
      email: [
        '',
        [
          WpCustomValidators.strictEmail(),
          WpCustomValidators.maxLength(192, this.localization),
        ],
      ],
      departmentId: [null, [Validators.required]],
      iin: ['', [WpCustomValidators.iinValidator(this.localization)]],
      externalId_1C: [
        '',
        [WpCustomValidators.maxLength(50, this.localization)],
      ],
    });
  }

  initDepartmentsDataSource() {
    const dataSource = this.httpCustom.createStore(
      'id',
      this.departmentService.getAllDepartmentUrl(this.data.organizationId)
    );

    this.departmentsDataSource = new DataSource({
      store: dataSource,
      sort: [{ selector: 'name', desc: false }],
    });
  }

  createEmployee(): void {
    if (this.isSubmitting || this.form.invalid) {
      if (this.form.invalid) {
        this.form.markAllAsTouched();
        this.snackBar.open(
          'Пожалуйста, заполните все обязательные поля',
          5000,
          'error'
        );
      }
      return;
    }

    this.isSubmitting = true;
    let employee: EmployeeCreationModel = this.form.getRawValue();

    if (employee.dateOfBirth) {
      const dateOfBirth = new Date(employee.dateOfBirth);
      employee = {
        ...employee,
        dateOfBirth: format(dateOfBirth, ShortDateFormat),
      };
    }

    this.service
      .addEmployee(employee)
      .pipe(
        untilDestroyed(this),
        finalize(() => (this.isSubmitting = false))
      )
      .subscribe(() =>
        this.dialogService.close(AddEmployeeComponent, { saved: true })
      );
  }

  onDateChanged(e: any): void {
    if (e.name === 'validationErrors') {
      const validationErrors = e.value;
      this.hasDateEditorSpecificError =
        validationErrors && validationErrors.some((err) => err.editorSpecific);
    }
  }

  editorSpecificValidator(): ValidatorFn {
    return (): ValidationErrors | null => {
      return this.hasDateEditorSpecificError
        ? { editorSpecificError: true }
        : null;
    };
  }

  closeModal() {
    this.dialogService.close(AddEmployeeComponent);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
        this.activeButton === 'save' ? this.createEmployee() : this.closeModal();
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
