import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmployeeListComponent } from './components/employee/list/employee-list.component';
import { DepartmentComponent } from './components/department-list/department.component';
import { LocationComponent } from './components/location-list/location.component';
import { DeviceComponent } from './components/device/device.component';
import { SuspiciousComponent } from './components/suspicious/suspicious.component';
import { TimesheetComponent } from './components/timesheet/timesheet.component';
import { LicencesComponent } from './components/licences/licences.component';
import { BilingComponent } from './components/biling/biling.component';
import { PersonalAccountComponent } from './components/personal-account/personal-account.component';
import { AuthorizeGuard } from '../auth/guards/authorize.guard';
import { AccessDeniedComponent } from '../shared/components/access-denied/access-denied.component';
import { SettingsComponent } from '../shared/components/settings/settings.component';
import { NavBarComponent } from '../shared/components/nav-bar/nav-bar.component';
import { ActualHoursWorkedComponent } from './components/reports/actual-hours-worked/actual-hours-worked.component';
import { ReportAttendanceComponent } from './components/reports/report-attendance/report-attendance.component';
import { ReportsComponent } from './components/reports/reports.component';
import { ReportEmployeeComponent } from './components/report-employee/report-employee.component';
import { AbsenceReportComponent } from './components/statistics-analytics/absence-report/absence-report.component';
import { ListLatecomersComponent } from './components/statistics-analytics/list-latecomers.component';
import { TimesheetGuard } from './guards/timesheet.guard';
import { NotificationPageComponent } from '../shared/components/notification-page/notification-page.component';
import { ActualHoursWorkedV1Component } from './components/reports/actual-hours-worked-v1/actual-hours-worked-v1.component';
import { HoursWorkedComponent } from './components/reports/hours-worked/hours-worked.component';
import { ReportLateinComponent } from './components/reports/report-latein/report-latein.component';
import { AbsenceComponent } from './components/monitoring/absence/absence.component';
import { LateComponent } from './components/monitoring/late/late.component';
import { EarlyOutComponent } from './components/monitoring/early-out/early-out.component';
import { ReportAttendanceV1Component } from './components/reports/report-attendance-v1/report-attendance-v1.component';
import { ReportMarksComponent } from './components/reports/report-marks/report-marks.component';
import { SchedulerComponent } from './feature-modules/schedule/pages/scheduler/scheduler.component';
import { EmployeeEditComponent } from './components/employee/edit/employee-edit.component';
import { EmployeesWithoutTimetableComponent } from './components/monitoring/employees/employees-without-timetable.component';
import { ReportViolationsComponent } from './components/reports/report-violations/report-violations.component';

const routes: Routes = [
  {
    path: 'personal-data-delete-information',
    component: NotificationPageComponent,
    data: { title: 'Удаление персональных данных' },
  },
  {
    path: '',
    component: NavBarComponent,
    canActivate: [AuthorizeGuard],
    children: [
      { path: '', redirectTo: '/all-marks', pathMatch: 'full' },
      {
        path: 'department',
        component: DepartmentComponent,
        data: { title: 'Отделы' },
      },
      {
        path: 'employee',
        component: EmployeeListComponent,
        data: { title: 'Сотрудники' },
      },
      {
        path: 'employee/:id/edit',
        component: EmployeeEditComponent,
        data: { title: 'Редактирование сотрудника' },
      },
      {
        path: 'location',
        component: LocationComponent,
        data: { title: 'Локации' },
      },
      {
        path: 'all-marks',
        component: ReportEmployeeComponent,
        data: { title: 'Все отметки' },
      },
      {
        path: 'employees-without-timetables',
        component: EmployeesWithoutTimetableComponent,
        data: { title: 'Нет расписания' },
      },
      {
        path: 'actual-hours-worked',
        component: ActualHoursWorkedComponent,
        data: { title: 'Фактически отработанные часы' },
      },
      {
        path: 'actual-hours-worked-v1',
        component: ActualHoursWorkedV1Component,
        data: { title: 'Фактически отработанные часы' },
      },
      {
        path: 'report-attendance',
        component: ReportAttendanceComponent,
        data: { title: 'Табель посещаемости' },
      },
      {
        path: 'report-attendance-v1',
        component: ReportAttendanceV1Component,
        data: { title: 'Табель посещаемости' },
      },
      {
        path: 'hoursWorked',
        component: ReportsComponent,
        data: { title: 'Отработанные часы' },
      },
      {
        path: 'hours-worked',
        component: HoursWorkedComponent,
        data: { title: 'Отработанные часы по графику' },
      },
      {
        path: 'late',
        component: ReportsComponent,
        data: { title: 'Опоздания' },
      },
      {
        path: 'report-latein',
        component: ReportLateinComponent,
        data: { title: 'Опоздания' },
      },
      {
        path: 'early',
        component: ReportsComponent,
        data: { title: 'Ранний уход' },
      },
      {
        path: 'early-out',
        component: EarlyOutComponent,
        data: { title: 'Ранний уход' },
      },
      {
        path: 'report-marks',
        component: ReportMarksComponent,
        data: { title: 'Отчет по отметкам' },
      },
      {
        path: 'report-violations',
        component: ReportViolationsComponent,
        data: { title: 'Список нарушений' },
      },
      {
        path: 'list-late',
        component: ListLatecomersComponent,
        data: { title: 'Опоздания' },
      },
      {
        path: 'monitoring-latein',
        component: LateComponent,
        data: { title: 'Опоздания' },
      },
      {
        path: 'absence-report',
        component: AbsenceReportComponent,
        data: { title: 'Отсутствия' },
      },
      {
        path: 'absence',
        component: AbsenceComponent,
        data: { title: 'Отсутствия' },
      },
      {
        path: 'suspicious',
        component: SuspiciousComponent,
        data: { title: 'Подозрительные отметки' },
      },
      {
        path: 'timesheet',
        component: TimesheetComponent,
        data: { title: 'Графики' },
        canActivate: [TimesheetGuard],
      },
      {
        path: 'timesheet2',
        loadChildren: () =>
          import('./feature-modules/schedule/schedule.module').then(
            (m) => m.ScheduleModule
          ),
        canActivate: [TimesheetGuard],
      },
      {
        path: 'scheduler',
        component: SchedulerComponent,
        data: { title: 'Расписание' },
      },
      {
        path: 'device',
        component: DeviceComponent,
        data: { title: 'Устройства' },
      },
      {
        path: 'licenses',
        component: LicencesComponent,
        data: { title: 'Лицензии' },
      },
      {
        path: 'billing',
        component: BilingComponent,
        data: { title: 'Партнеры' },
      },
      { path: 'denied', component: AccessDeniedComponent },
      {
        path: 'personal',
        component: PersonalAccountComponent,
        data: { title: 'Мой лицевой счет' },
      },
      {
        path: 'settings',
        component: SettingsComponent,
        data: { title: 'Настройки' },
      },
      {
        path: 'administrator',
        canLoad: [AuthorizeGuard],
        data: { title: 'Кабинет администратора' },
        loadChildren: () =>
          import('../cabinet-administrator/cabinet-administrator.module').then(
            (m) => m.AdministratorCabinetModule
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainRoutingModule {}
