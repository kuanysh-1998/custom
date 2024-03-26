import {
  AsyncPipe,
  NgForOf,
  NgIf,
  DatePipe,
  CommonModule,
  NgOptimizedImage,
} from '@angular/common';
import { DxCalendarModule } from 'devextreme-angular/ui/calendar';
import { DxCheckBoxModule } from 'devextreme-angular/ui/check-box';
import { DxColorBoxModule } from 'devextreme-angular/ui/color-box';
import { DxSchedulerModule } from 'devextreme-angular/ui/scheduler';
import { DxMenuModule } from 'devextreme-angular/ui/menu';
import { DxSliderModule } from 'devextreme-angular/ui/slider';
import { DxNumberBoxModule } from 'devextreme-angular/ui/number-box';
import { GoogleMapsModule } from '@angular/google-maps';
import { QRCodeModule } from 'angularx-qrcode';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MainRoutingModule } from './main-routing.module';
import { SharedModule } from '../shared/shared.module';
import { DxAccordionModule } from 'devextreme-angular/ui/accordion';
import { DxTooltipModule } from 'devextreme-angular/ui/tooltip';

import { AddDepartmentComponent } from './dialog/department/add-department/add-department.component';
import { EditDepartmentComponent } from './dialog/department/edit-department/edit-department.component';
import { AddDeviceComponent } from './dialog/device/add-device/add-device.component';
import { EditDeviceComponent } from './dialog/device/edit-device/edit-device.component';
import { AddReportComponent } from './dialog/report-employee/add-report/add-report.component';
import { ViewSuspiciousComponent } from './dialog/suspicious/view-suspicious/view-suspicious.component';
import { TimesheetComponent } from './components/timesheet/timesheet.component';
import { BilingComponent } from './components/biling/biling.component';
import { PersonalAccountComponent } from './components/personal-account/personal-account.component';
import { LicencesComponent } from './components/licences/licences.component';
import { ViewPersonalInfoComponent } from './dialog/billing/view-personal-info/view-personal-info.component';
import { BalanceManagementComponent } from './dialog/billing/balance-management/balance-management.component';
import { ReportsComponent } from './components/reports/reports.component';
import { AddEmployeeComponent } from './dialog/employee/add/add-employee.component';
import { PersonalDeviceComponent } from './components/device/personal-device/personal-device.component';
import { CorporateDeviceComponent } from './components/device/corporate-device/corporate-device.component';
import { EditPersonalDeviceComponent } from './dialog/device/edit-personal-device/edit-personal-device.component';
import { ViewLocationComponent } from './dialog/suspicious/view-location/view-location.component';
import { NavBarComponent } from '../shared/components/nav-bar/nav-bar.component';
import { LocationComponent } from './components/location-list/location.component';
import { DepartmentComponent } from './components/department-list/department.component';
import { DeviceComponent } from './components/device/device.component';
import { PropmtComponent } from '../shared/components/propmt/propmt.component';
import { SuspiciousComponent } from './components/suspicious/suspicious.component';
import { PoliticsComponent } from '../shared/components/politics/politics.component';
import { ReportEmployeeComponent } from './components/report-employee/report-employee.component';
import { EmployeeListComponent } from './components/employee/list/employee-list.component';
import { AccessDeniedComponent } from '../shared/components/access-denied/access-denied.component';
import { SettingsComponent } from '../shared/components/settings/settings.component';
import { DateRangeBoxComponent } from '../shared/components/date-range-box/date-range-box.component';
import { ReportAttendanceComponent } from './components/reports/report-attendance/report-attendance.component';
import { ActualHoursWorkedComponent } from './components/reports/actual-hours-worked/actual-hours-worked.component';
import { ListLatecomersComponent } from './components/statistics-analytics/list-latecomers.component';
import { AbsenceReportComponent } from './components/statistics-analytics/absence-report/absence-report.component';
import { LeftMenuComponent } from '../shared/components/left-menu/left-menu.component';
import { HeaderComponent } from '../shared/components/header/header.component';
import { ActualHoursWorkedV1Component } from './components/reports/actual-hours-worked-v1/actual-hours-worked-v1.component';
import { HoursWorkedComponent } from './components/reports/hours-worked/hours-worked.component';
import { ReportLateinComponent } from './components/reports/report-latein/report-latein.component';
import { EventTypeIndicatorComponent } from './dialog/suspicious/event-type-indicator/event-type-indicator.component';
import { EmployeeEventInfoComponent } from './dialog/suspicious/employee-event-info/employee-event-info.component';
import { EmployeeBlockComponent } from './dialog/suspicious/employee-block/employee-block.component';
import { PhotoBlockComponent } from './dialog/suspicious/photo-block/photo-block.component';
import { AbsenceComponent } from './components/monitoring/absence/absence.component';
import { LateComponent } from './components/monitoring/late/late.component';
import { EarlyOutComponent } from './components/monitoring/early-out/early-out.component';
import { ReportAttendanceV1Component } from './components/reports/report-attendance-v1/report-attendance-v1.component';
import { AddLicenseComponent } from './dialog/license/add-license/add-license.component';
import { ViewMarkComponent } from './dialog/marks/view-mark/view-mark.component';
import { ReportMarksComponent } from './components/reports/report-marks/report-marks.component';
import { AddLocationComponent } from './dialog/location/add/add-location.component';
import { EditLocationComponent } from './dialog/location/edit/edit-location.component';
import { EmployeeEditComponent } from './components/employee/edit/employee-edit.component';
import { EmployeeDataComponent } from './components/employee/edit/data/data.component';
import { EmployeeIdentificationComponent } from './components/employee/edit/identification/identification.component';
import { EmployeeTimetableComponent } from './components/employee/edit/timetable/employee-timetable.component';
import { EmployeeAddTimetableComponent } from './components/employee/edit/timetable/add/add-timetable.component';
import { EmployeesWithoutTimetableComponent } from './components/monitoring/employees/employees-without-timetable.component';
import { ReportViolationsComponent } from './components/reports/report-violations/report-violations.component';
import { ImportExcelEmployeeComponent } from './dialog/employee/import/excel/import-excel-employee.component';
import { ImportZipEmployeeComponent } from './dialog/employee/import/zip/import-zip-employee.component';

import { HasPermissionDirective } from '../shared/directives/has-permission.directive';
import { PositiveIntegerOnlyDirective } from '../shared/directives/positive-integer-only.directive';
import { TrimControlValueDirective } from '../shared/directives/trim-control.directive';

import { DateOffsetPipe } from './pipes/date-offset.pipe';

@NgModule({
  declarations: [
    ReportEmployeeComponent,
    LeftMenuComponent,
    HeaderComponent,
    NavBarComponent,
    EmployeeListComponent,
    LocationComponent,
    DepartmentComponent,
    AddDepartmentComponent,
    AddReportComponent,
    DeviceComponent,
    EditDeviceComponent,
    AddDeviceComponent,
    PropmtComponent,
    SuspiciousComponent,
    ViewSuspiciousComponent,
    EditDepartmentComponent,
    AddReportComponent,
    TimesheetComponent,
    PoliticsComponent,
    LicencesComponent,
    BilingComponent,
    PersonalAccountComponent,
    ViewPersonalInfoComponent,
    HasPermissionDirective,
    BalanceManagementComponent,
    AccessDeniedComponent,
    ReportsComponent,
    AddEmployeeComponent,
    PersonalDeviceComponent,
    CorporateDeviceComponent,
    ViewLocationComponent,
    EditPersonalDeviceComponent,
    SettingsComponent,
    ReportAttendanceComponent,
    DateRangeBoxComponent,
    ActualHoursWorkedComponent,
    PositiveIntegerOnlyDirective,
    ListLatecomersComponent,
    TrimControlValueDirective,
    AbsenceReportComponent,
    EventTypeIndicatorComponent,
    DateOffsetPipe,
    EmployeeEventInfoComponent,
    EmployeeBlockComponent,
    ActualHoursWorkedV1Component,
    HoursWorkedComponent,
    ReportLateinComponent,
    PhotoBlockComponent,
    AbsenceComponent,
    EmployeesWithoutTimetableComponent,
    LateComponent,
    EarlyOutComponent,
    ReportAttendanceV1Component,
    AddLicenseComponent,
    ViewMarkComponent,
    ReportMarksComponent,
    ReportViolationsComponent,
    AddLocationComponent,
    EditLocationComponent,
    EmployeeEditComponent,
    EmployeeDataComponent,
    EmployeeIdentificationComponent,
    EmployeeTimetableComponent,
    EmployeeAddTimetableComponent,
    ImportExcelEmployeeComponent,
    ImportZipEmployeeComponent,
  ],
  imports: [
    QRCodeModule,
    DxSchedulerModule,
    DxColorBoxModule,
    DxSliderModule,
    DxNumberBoxModule,
    GoogleMapsModule,
    RouterModule,
    MainRoutingModule,
    AsyncPipe,
    NgForOf,
    NgIf,
    DatePipe,
    DxCalendarModule,
    DxCheckBoxModule,
    SharedModule,
    CommonModule,
    DxMenuModule,
    NgOptimizedImage,
    DxAccordionModule,
    DxTooltipModule,
  ],
})
export class MainLayoutModule {}
