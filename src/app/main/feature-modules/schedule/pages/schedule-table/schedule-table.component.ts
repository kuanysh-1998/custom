import { Component, OnInit, ViewChild } from '@angular/core';
import DataSource from 'devextreme/data/data_source';
import { HttpCustom } from '../../../../../shared/http';
import { ScheduleAPIService } from '../../../../../services/schedule-api.service';
import { LocalizationService } from '../../../../../shared/services/localization.service';
import { PermissionEnum } from '../../../../../shared/models/permission.enum';
import { AuthorizeService } from '../../../../../auth/services/authorize.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Schedule,
  ScheduleStatus,
  ScheduleType,
} from '../../models/schedule-models';
import { WpMessageComponent } from 'src/app/shared/components/wp-message/wp-message.component';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import { DxDataGridComponent } from 'devextreme-angular';

export interface TimesheetV2ContextMenuItem {
  text: string;
  actionType: string;
}

@UntilDestroy()
@Component({
  selector: 'app-schedule-table',
  templateUrl: './schedule-table.component.html',
  styleUrls: ['./schedule-table.component.scss'],
})
export class ScheduleTableComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;

  dataSource: DataSource;
  timesheetStatuses: { name: string; value: number }[] = [
    {
      name: this.localization.getSync('Черновик'),
      value: ScheduleStatus.draft,
    },
    {
      name: this.localization.getSync('Опубликован'),
      value: ScheduleStatus.published,
    },
  ];

  timesheetTypes: { name: string; value: number }[] = [
    {
      name: this.localization.getSync('Циклический'),
      value: ScheduleType.cyclic,
    },
    {
      name: this.localization.getSync('Дни недели'),
      value: ScheduleType.weekDays,
    },
  ];

  permissions: PermissionEnum[] = this.authService.getPermissions();
  contextMenuStatuses: boolean[] = [];

  constructor(
    private scheduleAPIService: ScheduleAPIService,
    private authService: AuthorizeService,
    private localization: LocalizationService,
    private httpCustom: HttpCustom,
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    const dataStore = this.httpCustom.createStore(
      'id',
      this.scheduleAPIService.getScheduleURL()
    );

    dataStore.on('loaded', (timesheetData) => {
      const timesheets = timesheetData.data as Schedule[];

      this.contextMenuStatuses = [];
      timesheets.forEach((timesheet, index) => {
        timesheet['menuItems'] = this.getMenuItems(timesheet);
        this.contextMenuStatuses[index] = false;
      });

      timesheets.sort((first, second) => {
        const firstFormatted = new Date(first.createdOn);
        const secondFormatted = new Date(second.createdOn);
        return secondFormatted.getTime() - firstFormatted.getTime();
      });
    });

    this.dataSource = new DataSource(dataStore);
  }

  onGridInitialized() {
    this.scheduleAPIService.getCurrentPage().subscribe((page) => {
      if (this.dataGrid && this.dataGrid.instance) {
        this.dataGrid.instance.pageIndex(page);
      }
    });
  }

  setCurrentPage(event: any) {
    const pageIndex: number = event.pageIndex;
    this.scheduleAPIService.setCurrentPage(pageIndex);
  }

  private getMenuItems(schedule: Schedule): TimesheetV2ContextMenuItem[] {
    const menuItems: TimesheetV2ContextMenuItem[] = [
      {
        text: this.localization.getSync('Редактировать'),
        actionType: 'edit',
      },
      {
        text: this.localization.getSync('Копировать'),
        actionType: 'copy',
      },
    ];

    if (schedule.status === ScheduleStatus.draft) {
      menuItems.push({
        text: this.localization.getSync('Удалить'),
        actionType: 'delete',
      });
    }

    return menuItems;
  }

  executeLicenseAction(
    itemData: TimesheetV2ContextMenuItem | any,
    data: Schedule
  ) {
    switch (itemData.actionType) {
      case 'edit':
        this.editPublishedTimesheet(data);
        break;
      case 'delete':
        this.deleteTimesheet(data);
        break;
      case 'copy':
        this.copyTimesheet(data);
        break;
    }
  }

  editTimesheet(data: Schedule) {
    this.router.navigate([data.id], {
      relativeTo: this.route,
    });
  }

  editPublishedTimesheet(data: Schedule) {
    this.router.navigate([data.id], {
      relativeTo: this.route,
      queryParams: { mode: 'edit' },
    });
  }

  copyTimesheet(schedule: Schedule) {
    this.router.navigate([schedule.id], {
      relativeTo: this.route,
      queryParams: { mode: 'copy', originalScheduleId: schedule.id },
      state: { schedule: schedule },
    });
  }

  deleteTimesheet(data: Schedule): void {
    this.dialogService.show('Удаление черновика графика', {
      componentType: WpMessageComponent,
      componentData: {
        message:
          'Вы действительно хотите удалить выбранный черновик графика работы?',
      },

      onClose: (result) => {
        if (result.saved) {
          this.scheduleAPIService
            .deleteSchedule(data.id)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
              this.dataSource.reload();
            });
        }
      },
    });
  }

  customizeRow(row: any) {
    if (row.rowType === 'data') {
      const rowData = row.data as Schedule;
      if (rowData.status === ScheduleStatus.draft) {
        row.rowElement.style = 'color: #979797';
      }
    }
  }

  createSchedule() {
    this.router.navigate(['new'], {
      relativeTo: this.route,
    });
  }
}
