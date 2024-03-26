import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrganizationService } from '../../../../../services/organization.service';
import { Router } from '@angular/router';
import { CurrentUserService } from 'src/app/cabinet-administrator/services/current-user.service';
import { PasswordVisibilityService } from 'src/app/cabinet-administrator/services/password-visibility.service';
import DataSource from 'devextreme/data/data_source';
import { HttpCustom } from 'src/app/shared/http';
import { switchMap } from 'rxjs/operators';
import { Observable, forkJoin, from } from 'rxjs';
import { DepartmentService } from 'src/app/services/department.service';
import { DepartmentModel } from 'src/app/models/department.model';
import { ScreenSizeService } from 'src/app/shared/services/screen-size.service';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { WpCustomValidators } from 'src/app/shared/validators/wp-custom-validators';
import {
  EmployeeDetail,
  EmployeeUpdateModel,
} from 'src/app/models/employee.model';
import { EmployeeService } from 'src/app/services/employee.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

enum ScreenWidth {
  Large = '507',
  Small = '280',
  Default = '330',
}

@UntilDestroy()
@Component({
  selector: 'user-data-edit',
  templateUrl: './user-data-edit.component.html',
  styleUrls: ['./user-data-edit.component.scss'],
})
export class UserDataComponent implements OnInit {
  departmentsDataSource: DataSource;
  organizationsDataSource: DataSource;
  form: FormGroup;
  currentUser: EmployeeDetail;
  widthForSelectBoxes: string = ScreenWidth.Default;
  widthForTextFields: string = ScreenWidth.Default;

  constructor(
    private departmentService: DepartmentService,
    private organizationService: OrganizationService,
    private fb: FormBuilder,
    private screenSizeService: ScreenSizeService,
    private router: Router,
    private currentUserService: CurrentUserService,
    public passwordVisibility: PasswordVisibilityService,
    private http: HttpCustom,
    private cdr: ChangeDetectorRef,
    private employeeService: EmployeeService,
    private localization: LocalizationService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.initializeOrganizationsDataSource();
    this.subscribeToUserChanges();
    this.subscribeToScreenSizeChanges();
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
      password: [
        '',
        [
          WpCustomValidators.maxLength(50, this.localization),
          Validators.pattern(/^\S*$/),
        ],
      ],
      departmentId: [null, [Validators.required]],
      organizationId: [null, [Validators.required]],
    });
  }

  private subscribeToUserChanges(): void {
    this.currentUserService.user$
      .pipe(
        switchMap((user) => {
          this.currentUser = user;
          return forkJoin({
            departments: this.updateDepartmentsDataSource(user.organizationId),
            organizations: from(this.organizationsDataSource.load()),
          });
        }),
        untilDestroyed(this)
      )
      .subscribe(() => {
        const userData = {
          email: this.currentUser.email,
          lastName: this.currentUser.name.lastName,
          firstName: this.currentUser.name.firstName,
          middleName: this.currentUser.name.middleName || '',
          departmentId: this.currentUser.departmentId,
          organizationId: this.currentUser.organizationId,
        };
        this.form.patchValue(userData);
      });
  }

  private initializeOrganizationsDataSource(): void {
    this.organizationsDataSource = new DataSource({
      store: this.http.createStore(
        'id',
        this.organizationService.getOrganizationDxUrl()
      ),
      sort: [{ selector: 'name', desc: false }],
      pageSize: 0,
    });
  }

  updateDepartmentsDataSource(
    organizationId: string
  ): Observable<DepartmentModel[]> {
    const dataSource = this.http.createStore(
      'id',
      this.departmentService.getAllDepartmentUrl(organizationId)
    );

    this.departmentsDataSource = new DataSource({
      store: dataSource,
      sort: [{ selector: 'name', desc: false }],
    });

    this.cdr.detectChanges();
    return from(this.departmentsDataSource.load());
  }

  edit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const userData: EmployeeUpdateModel = {
      id: this.currentUser.id,
      firstName: this.form.value.firstName,
      lastName: this.form.value.lastName,
      middleName: this.form.value.middleName,
      email: this.form.value.email,
      password: this.form.value.password,
      departmentId: this.form.value.departmentId,
      externalId_1C: this.currentUser.externalId_1C,
      dateOfBirth: this.currentUser.dateOfBirth,
      iin: this.currentUser.iin,
    };

    this.employeeService.updateEmployee(userData).subscribe(() => {
      this.router.navigate(['/administrator/users']);
    });
  }

  private subscribeToScreenSizeChanges(): void {
    this.screenSizeService.isLargeScreen$
      .pipe(untilDestroyed(this))
      .subscribe((isLargeScreen) => {
        this.widthForSelectBoxes = isLargeScreen
          ? ScreenWidth.Large
          : ScreenWidth.Small;
        this.widthForTextFields = isLargeScreen
          ? ScreenWidth.Default
          : ScreenWidth.Small;
      });
  }

  returnToUsersPage(): void {
    this.router.navigate(['/administrator/users']);
  }
}
