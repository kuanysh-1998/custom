import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdministratorCabinetRoutingModule } from './cabinet-administrator-routing.module';
import { SharedModule } from '../shared/shared.module';

import { AdministrationOrganizationsComponent } from './pages/organizations/administration-organizations.component';
import { AdministrationOrganizationAddComponent } from './pages/organizations/add/administration-organization-add.component';
import { AdministrationOrganizationEditComponent } from './pages/organizations/edit/administration-organization-edit.component';
import { AdministrationUsersComponent } from './pages/users/administration-users.component';
import { AdministrationLayoutComponent } from './components/administration-layout/administration-layout.component';
import { WpDateRangeBoxComponent } from './components/wp-date-range-box/wp-date-range-box.component';
import { WpSelectBoxComponent } from './components/wp-select-box/wp-select-box.component';
import { UserEditComponent } from './pages/users/edit/user-edit.component';
import { UserDataComponent } from './pages/users/edit/data/user-data-edit.component';
import { UserRightsComponent } from './pages/users/edit/rights/user-rights.component';
import { UserAddComponent } from './pages/users/add/user-add.component';
import { LicensesComponent } from './pages/licenses/licenses.component';

@NgModule({
  declarations: [
    AdministrationLayoutComponent,

    AdministrationOrganizationsComponent,
    AdministrationOrganizationAddComponent,
    AdministrationOrganizationEditComponent,

    AdministrationUsersComponent,
    UserAddComponent,
    UserEditComponent,
    UserRightsComponent,
    UserDataComponent,
    LicensesComponent,

    WpDateRangeBoxComponent,
    WpSelectBoxComponent,
  ],
  imports: [
    CommonModule,
    AdministratorCabinetRoutingModule,
    SharedModule,
  ],
})
export class AdministratorCabinetModule {}
