import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { PermissionsModel } from 'src/app/cabinet-administrator/models/permissions.model';
import {
  IRightsCategory,
  IUserPermissionsSelection,
} from 'src/app/cabinet-administrator/models/user.model';
import { AdministrationService } from 'src/app/cabinet-administrator/services/administration-service.service';
import { CurrentUserService } from 'src/app/cabinet-administrator/services/current-user.service';
import { EmployeeDetail } from 'src/app/models/employee.model';
import { EmployeeService } from 'src/app/services/employee.service';
import { PermissionEnum } from 'src/app/shared/models/permission.enum';

@UntilDestroy()
@Component({
  selector: 'user-rights',
  templateUrl: './user-rights.component.html',
  styleUrls: ['./user-rights.component.scss'],
})
export class UserRightsComponent implements OnInit {
  permissions$: Observable<PermissionsModel[]>;
  selectedPermissions: PermissionsModel[] = [];
  currentUser: EmployeeDetail;
  permissionsWithSelection$: Observable<IUserPermissionsSelection>;
  categories: IRightsCategory[] = [
    {
      name: 'Биллинг',
      codes: [
        PermissionEnum.PersonalAccountCreate,
        PermissionEnum.PersonalAccountWithLevelCreate,
        PermissionEnum.AllPersonalAccountsView,
        PermissionEnum.AnyLicenseCreate,
        PermissionEnum.AnyLicenseRevoke,
        PermissionEnum.AnyLicenseCancel,
        PermissionEnum.AnyPersonalAccountDeposit,
        PermissionEnum.AnyPersonalAccountWithdrawal,
        PermissionEnum.AllBalanceHistoriesView,
        PermissionEnum.AnyPersonalAccountOverdraftEdit,
      ],
    },
    {
      name: 'Управление',
      codes: [
        PermissionEnum.AllUsersEdit,
        PermissionEnum.AllCompaniesEdit,
        PermissionEnum.AllCompaniesView,
        PermissionEnum.AllUsersView,
        PermissionEnum.AllLicensesView
      ],
    },
    {
      name: 'Кабинет партнера',
      codes: [
        PermissionEnum.OwnPersonalAccountView,
        PermissionEnum.OwnLicensesView,
        PermissionEnum.LicenseActivate,
        PermissionEnum.OwnLicensesRevoke,
        PermissionEnum.OwnBalanceHistoryView,
      ],
    },
    {
      name: 'Кабинет клиента',
      codes: [PermissionEnum.Process_1C, PermissionEnum.AnyEmployeeMarksCreate],
    },
  ];

  constructor(
    private administrationService: AdministrationService,
    private employeeService: EmployeeService,
    private router: Router,
    private currentUserService: CurrentUserService
  ) {}

  ngOnInit(): void {
    this.permissions$ = this.administrationService.getAllPermissions();

    this.permissionsWithSelection$ = combineLatest([
      this.permissions$,
      this.currentUserService.user$,
    ]).pipe(
      untilDestroyed(this),
      map(([permissions, user]) => {
        this.currentUser = user;

        this.selectedPermissions = user.permissions || [];

        return {
          permissions: permissions,
          selectedPermissions: this.selectedPermissions,
        };
      })
    );
  }

  filterPermissionsByCategory(
    permissions: PermissionsModel[],
    categoryCodes: number[]
  ): PermissionsModel[] {
    const filteredPermissions = permissions.filter((permission) =>
      categoryCodes.includes(permission.code)
    );
    return filteredPermissions;
  }

  isPermissionSelected(permission: PermissionsModel): boolean {
    return this.selectedPermissions.some((p) => p.id === permission.id);
  }

  onPermissionChange(permission: PermissionsModel, isChecked: boolean): void {
    if (isChecked) {
      this.selectedPermissions.push(permission);
    } else {
      this.selectedPermissions = this.selectedPermissions.filter(
        (p) => p.id !== permission.id
      );
    }
  }

  savePermissions(): void {
    const permissionCodes = this.selectedPermissions.map((p) =>
      p.code.toString()
    );
    this.employeeService
      .changePermissions(this.currentUser.id, permissionCodes)
      .subscribe(() => {
        this.router.navigate(['/administrator/users']);
      });
  }

  returnToUsersPage(): void {
    this.router.navigate(['/administrator/users']);
  }
}
