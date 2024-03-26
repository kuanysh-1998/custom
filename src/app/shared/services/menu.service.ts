import { Injectable } from '@angular/core';
import { AuthorizeService } from 'src/app/auth/services/authorize.service';
import { Menu } from '../models/menu.model';
import { PermissionEnum } from '../models/permission.enum';
import { LocalizationService } from './localization.service';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  Permission = PermissionEnum;
  constructor(
    private authService: AuthorizeService,
    private localization: LocalizationService
  ) {}

  checkPermission(permission: PermissionEnum): boolean {
    return this.authService.getPermissions().includes(permission);
  }

  init(usingNewSchedules: boolean = false): Menu[] {
    const menu: Menu[] = [
      {
        text: this.localization.getSync('Биллинг'),
        icon: 'assets/image/billing.svg',
        expand: false,
        children: [
          {
            text: this.localization.getSync('Лицензии'),
            url: '/licenses',
            visible: this.checkPermission(this.Permission.OwnLicensesView),
          },
          {
            text: this.localization.getSync('Мой лицевой счет'),
            url: '/personal',
            visible: this.checkPermission(
              this.Permission.OwnPersonalAccountView
            ),
          },
        ],
      },
      {
        text: this.localization.getSync('Мониторинг'),
        icon: 'assets/image/monitoring.svg',
        expand: false,
        children: [
          {
            text: this.localization.getSync('Подозрительные отметки'),
            url: '/suspicious',
            visible: true,
          },
          {
            text: this.localization.getSync('Опоздания'),
            url: usingNewSchedules ? '/monitoring-latein' : '/list-late',
            visible: true,
          },
          {
            text: this.localization.getSync('Ранний уход'),
            url: usingNewSchedules ? 'early-out' : '/early',
            visible: true,
          },
          {
            text: this.localization.getSync('Отсутствия'),
            url: usingNewSchedules ? '/absence' : '/absence-report',
            visible: true,
          },
          {
            text: this.localization.getSync('Все отметки'),
            url: '/all-marks',
            visible: true,
          },
          {
            text: this.localization.getSync('Нет расписания'),
            url: '/employees-without-timetables',
            visible: true,
          },
        ],
      },
      {
        text: this.localization.getSync('Отчеты'),
        icon: 'assets/image/report-logo.svg',
        expand: false,
        children: [
          {
            text: this.localization.getSync('Фактически отработанные часы'),
            url: usingNewSchedules
              ? '/actual-hours-worked-v1'
              : '/actual-hours-worked',
            visible: true,
          },
          {
            text: this.localization.getSync('Табель посещаемости'),
            url: usingNewSchedules
              ? '/report-attendance-v1'
              : '/report-attendance',
            visible: true,
          },
          {
            text: this.localization.getSync('Опоздания'),
            url: usingNewSchedules ? 'report-latein' : '/late',
            visible: true,
          },
          {
            text: usingNewSchedules
              ? this.localization.getSync('Отработанные часы по графику')
              : this.localization.getSync('Отработанные часы'),
            url: usingNewSchedules ? '/hours-worked' : '/hoursWorked',
            visible: true,
          },
          {
            text: this.localization.getSync('Отчет по отметкам'),
            url: '/report-marks',
            visible: true,
          },
          {
            text: this.localization.getSync('Список нарушений'),
            url: '/report-violations',
            visible: true,
          },
        ],
      },
      {
        text: this.localization.getSync('График работы'),
        icon: 'assets/image/graphic-logo.svg',
        expand: false,
        children: [
          {
            text: this.localization.getSync('Графики'),
            url: usingNewSchedules ? '/timesheet2' : '/timesheet',
            visible: true,
          },
          {
            text: this.localization.getSync('Расписание'),
            url: '/scheduler',
            visible: usingNewSchedules,
          },
        ],
      },
      {
        text: this.localization.getSync('Управление'),
        icon: 'assets/image/control.svg',
        expand: false,
        children: [
          {
            text: this.localization.getSync('Сотрудники'),
            url: '/employee',
            visible: true,
          },
          {
            text: this.localization.getSync('Отделы'),
            url: '/department',
            visible: true,
          },
          {
            text: this.localization.getSync('Локации'),
            url: '/location',
            visible: true,
          },
          {
            text: this.localization.getSync('Устройства'),
            url: '/device',
            visible: true,
          },
        ],
      },
      {
        text: this.localization.getSync('Админка'),
        icon: 'assets/image/admin_panel.svg',
        expand: false,
        children: [
          {
            text: this.localization.getSync('Партнеры'),
            url: '/billing',
            visible: this.checkPermission(
              this.Permission.AllPersonalAccountsView
            ),
          },
          {
            text: this.localization.getSync('Организации'),
            url: '/administrator/organizations',
            visible: this.checkPermission(this.Permission.AllCompaniesEdit),
          },
          {
            text: this.localization.getSync('Пользователи'),
            url: '/administrator/users',
            visible: this.checkPermission(this.Permission.AllUsersEdit),
          },
          {
            text: this.localization.getSync('Все лицензии'),
            url: '/administrator/all-licenses',
            visible: this.checkPermission(this.Permission.AllLicensesView),
          },
        ],
      },
    ];
    return menu;
  }
}
