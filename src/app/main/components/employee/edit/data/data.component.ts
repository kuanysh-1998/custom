import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { format } from 'date-fns';
import DataSource from 'devextreme/data/data_source';
import { from } from 'rxjs';
import { AuthorizeService } from 'src/app/auth/services/authorize.service';
import {
  EmployeeDetail,
  EmployeeUpdateModel,
} from 'src/app/models/employee.model';
import { DepartmentService } from 'src/app/services/department.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { SettingsService } from 'src/app/services/settings.service';
import { ShortDateFormat } from 'src/app/shared/consts/date-format.const';
import { HttpCustom } from 'src/app/shared/http';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { ScreenSizeService } from 'src/app/shared/services/screen-size.service';
import { WpSnackBar } from 'src/app/shared/services/wp-snackbar.service';
import { WpCustomValidators } from 'src/app/shared/validators/wp-custom-validators';

const WIDTH_LARGE_SCREEN = '330';
const WIDTH_SMALL_SCREEN = '280';

@UntilDestroy()
@Component({
  selector: 'app-employee-data-edit',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss'],
})
export class EmployeeDataComponent implements OnInit, OnChanges {
  @Input() currentEmployee: EmployeeDetail;

  form: FormGroup;
  width: string = WIDTH_LARGE_SCREEN;
  maxDate: Date = new Date();
  departmentsDataSource: DataSource;
  hasIntegrationWith_1C: boolean = false;
  hasDateEditorSpecificError = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private screenSizeService: ScreenSizeService,
    private httpCustom: HttpCustom,
    private departmentService: DepartmentService,
    private authorizeService: AuthorizeService,
    private employeeService: EmployeeService,
    private localization: LocalizationService,
    private settingsService: SettingsService,
    private snackBar: WpSnackBar
  ) {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.currentEmployee && changes.currentEmployee.currentValue) {
      this.loadDepartmentsAndSetEmployeeData();
    }
  }

  ngOnInit(): void {
    this.initDepartmentsDataSource();
    this.subscribeToScreenSizeChanges();
    this.settingsService
      .getPermissionGroup(this.authorizeService.currentOrganizationId)
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.hasIntegrationWith_1C = res.integrationWith_1C;
      });
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

  private loadDepartmentsAndSetEmployeeData(): void {
    from(this.departmentsDataSource.load())
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.setEmployeeData(this.currentEmployee);
      });
  }

  private setEmployeeData(employee: EmployeeDetail): void {
    const employeeData = {
      firstName: employee.name.firstName,
      lastName: employee.name.lastName,
      middleName: employee.name.middleName || '',
      email: employee.email || '',
      dateOfBirth: employee.dateOfBirth || null,
      departmentId: employee.departmentId,
      iin: employee.iin || '',
      externalId_1C: employee.externalId_1C || '',
    };
    this.form.patchValue(employeeData);
  }

  initDepartmentsDataSource() {
    const dataSource = this.httpCustom.createStore(
      'id',
      this.departmentService.getAllDepartmentUrl(
        this.authorizeService.currentOrganizationId
      )
    );

    this.departmentsDataSource = new DataSource({
      store: dataSource,
      sort: [{ selector: 'name', desc: false }],
      pageSize: 0,
    });
  }

  edit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open(
        'Пожалуйста, заполните все обязательные поля',
        5000,
        'error'
      );

      return;
    }

    const formValue = this.form.getRawValue();

    if (formValue.dateOfBirth) {
      formValue.dateOfBirth = format(
        new Date(formValue.dateOfBirth),
        ShortDateFormat
      );
    }

    const employeeData: EmployeeUpdateModel = {
      id: this.currentEmployee.id,
      ...formValue,
    };

    this.employeeService
      .updateEmployee(employeeData)
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.snackBar.open('Данные успешно сохранены', 4000, 'success');
        this.navigateToEmployeeList();
      });
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

  private subscribeToScreenSizeChanges(): void {
    this.screenSizeService.isLargeScreen$
      .pipe(untilDestroyed(this))
      .subscribe((isLargeScreen) => {
        this.width = isLargeScreen ? WIDTH_LARGE_SCREEN : WIDTH_SMALL_SCREEN;
      });
  }

  navigateToEmployeeList(): void {
    this.router.navigate(['/employee']);
  }
}
