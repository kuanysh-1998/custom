import { Component, HostListener, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { OrganizationService } from '../../../../services/organization.service';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import { PasswordVisibilityService } from 'src/app/cabinet-administrator/services/password-visibility.service';
import DataSource from 'devextreme/data/data_source';
import { HttpCustom } from 'src/app/shared/http';
import { DepartmentService } from 'src/app/services/department.service';
import { WpCustomValidators } from 'src/app/shared/validators/wp-custom-validators';
import { filter, switchMap, tap } from 'rxjs/operators';
import { Observable, from } from 'rxjs';
import { EmployeeService } from 'src/app/services/employee.service';
import { EmployeeCreationModel } from 'src/app/models/employee.model';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'administration-user-add',
  templateUrl: './user-add.component.html',
  styleUrls: ['./user-add.component.scss'],
  providers: [PasswordVisibilityService],
})
export class UserAddComponent implements OnInit {
  departmentsDataSource: DataSource;
  organizationsDataSource: DataSource;
  form: FormGroup;
  activeButton: 'cancel' | 'save' = 'save';

  constructor(
    private departmentService: DepartmentService,
    private organizationService: OrganizationService,
    private fb: FormBuilder,
    private dialogService: DialogService,
    public passwordVisibility: PasswordVisibilityService,
    private http: HttpCustom,
    private employeeService: EmployeeService,
    private localization: LocalizationService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.initializeOrganizationsDataSource();
    this.subscribeToOrganizationChanges();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          WpCustomValidators.maxLength(192, this.localization),
          WpCustomValidators.strictEmail(),
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          WpCustomValidators.maxLength(50, this.localization),
          WpCustomValidators.noWhitespaceValidator()
        ],
      ],
      firstName: [
        '',
        [
          Validators.required,
          WpCustomValidators.maxLength(50, this.localization),
          WpCustomValidators.noWhitespaceValidator()
        ],
      ],
      middleName: ['', [WpCustomValidators.maxLength(50, this.localization)]],
      password: [
        '',
        [
          Validators.required,
          WpCustomValidators.maxLength(50, this.localization),
          Validators.pattern(/^\S*$/),
        ],
      ],
      departmentId: [null, [Validators.required]],
      organizationId: [null, [Validators.required]],
    });
  }

  private initializeOrganizationsDataSource(): void {
    const dataStore = this.http.createStore(
      'id',
      this.organizationService.getOrganizationDxUrl()
    );

    this.organizationsDataSource = new DataSource({
      store: dataStore,
      sort: [{ selector: 'name', desc: false }],
    });
  }

  updateDepartmentsDataSource(organizationId: string): Observable<any> {
    const dataSource = this.http.createStore(
      organizationId,
      this.departmentService.getAllDepartmentUrl(organizationId)
    );

    this.departmentsDataSource = new DataSource({
      store: dataSource,
      sort: [{ selector: 'name', desc: false }],
    });

    return from(this.departmentsDataSource.load());
  }

  private subscribeToOrganizationChanges(): void {
    this.form
      .get('organizationId')
      .valueChanges.pipe(
        tap((organizationId) => {
          if (organizationId == null) {
            this.form.get('departmentId').setValue(null);
            this.clearDepartmentsDataSource();
          }
        }),
        filter((organizationId) => organizationId != null),
        switchMap((organizationId) =>
          this.updateDepartmentsDataSource(organizationId)
        ),
        untilDestroyed(this)
      )
      .subscribe(() => {
        this.form.get('departmentId').setValue(null);
      });
  }

  createUser(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const employee: EmployeeCreationModel = {
      firstName: this.form.get('firstName').value,
      lastName: this.form.get('lastName').value,
      middleName: this.form.get('middleName').value,
      email: this.form.get('email').value,
      password: this.form.get('password').value,
      departmentId: this.form.get('departmentId').value,
    };

    this.employeeService
      .addEmployee(employee)
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.dialogService.close(UserAddComponent, { saved: true });
      });
  }

  private clearDepartmentsDataSource(): void {
    this.departmentsDataSource = new DataSource({
      store: [],
    });
  }

  closeModal(): void {
    this.dialogService.close(UserAddComponent);
    this.form.reset();
    this.form.enable();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
        this.activeButton === 'save' ? this.createUser() : this.closeModal();
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
