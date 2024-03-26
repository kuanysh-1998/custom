import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdministrationOrganizationsComponent } from './pages/organizations/administration-organizations.component';
import { AdministrationUsersComponent } from './pages/users/administration-users.component';
import { AdministrationLayoutComponent } from './components/administration-layout/administration-layout.component';
import { PermissionEnum } from '../shared/models/permission.enum';
import { PermissionGuardService } from '../auth/guards/permission.guard';
import { UserEditComponent } from './pages/users/edit/user-edit.component';
import { LicensesComponent } from './pages/licenses/licenses.component';

const routes: Routes = [
  {
    path: '',
    component: AdministrationLayoutComponent,
    canActivate: [PermissionGuardService],
    data: {
      permissions: [
        PermissionEnum.AllCompaniesView,
        PermissionEnum.AllCompaniesEdit,
        PermissionEnum.AllUsersView,
        PermissionEnum.AllUsersEdit,
        PermissionEnum.PermissionsEdit,
        PermissionEnum.AllLicensesView
      ],
    },
    children: [
      {
        path: 'organizations',
        component: AdministrationOrganizationsComponent,
        data: {
          title: 'Организации',
          permissions: [
            PermissionEnum.AllCompaniesView,
            PermissionEnum.AllCompaniesEdit,
          ],
        },
      },
      {
        path: 'all-licenses',
        component: LicensesComponent,
        data: {
          title: 'Все лицензии',
          permissions: [PermissionEnum.AllLicensesView],
        },
      },
      {
        path: 'users',
        component: AdministrationUsersComponent,
        data: {
          title: `Пользователи`,
          //permissions: [PermissionEnum.AllUsersView, PermissionEnum.AllUsersEdit]
        },
      },
      {
        path: 'users/:id/edit',
        component: UserEditComponent,
        data: {
          title: `Редактирование пользователя`,
          permissions: [PermissionEnum.AllUsersEdit],
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdministratorCabinetRoutingModule {}
