import { Component, Input, OnInit, ViewChild } from '@angular/core';
import DataSource from 'devextreme/data/data_source';
import { HttpCustom } from '../../../../../shared/http';
import { PermissionEnum } from '../../../../../shared/models/permission.enum';
import { AuthorizeService } from '../../../../../auth/services/authorize.service';
import { LocalizationService } from '../../../../../shared/services/localization.service';
import { Timetable, TimetableStatus } from '../../models/timetable';
import { EditTimetablesComponent } from '../edit-timetables/edit-timetables.component';
import { DisplayValueModel } from '../../../../../shared/models/display-value.model';
import { Router } from '@angular/router';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { WpSnackBar } from 'src/app/shared/services/wp-snackbar.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { WpMessageComponent } from 'src/app/shared/components/wp-message/wp-message.component';
import { TimetableApiService } from 'src/app/services/timatable-api.service';
import { EditTimetableComponent } from 'src/app/shared/components/edit-timetable/edit-timetable.component';

enum ActionType {
  Edit,
  Delete,
}

@UntilDestroy()
@Component({
  selector: 'app-timetable',
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.scss'],
})
export class TimetableComponent implements OnInit {
  @Input()
  scheduleId: string;

  @ViewChild('grid', { static: false }) grid: DxDataGridComponent;

  dataSource: DataSource;
  statusTypes: DisplayValueModel<TimetableStatus>[] = [];
  contextMenuStatuses: boolean[] = [];
  permissions: PermissionEnum[] = this.authService.getPermissions();

  constructor(
    private httpCustom: HttpCustom,
    private authService: AuthorizeService,
    private localization: LocalizationService,
    private timetableApiService: TimetableApiService,
    private router: Router,
    private dialogService: DialogService,
    private wpSnackBar: WpSnackBar
  ) {
    this.statusTypes = this.getStatusTypes();
  }

  ngOnInit(): void {
    if (this.scheduleId) {
      this.initDataSource();
    }
  }

  initDataSource() {
    const customizeLoadOptionsFunction = (loadOptions) => {
      let sortOptions = Array.isArray(loadOptions.sort)
        ? loadOptions.sort
        : [loadOptions.sort || {}];
      if (!sortOptions.some((s) => s.selector === 'id')) {
        sortOptions.push({ selector: 'id', desc: false });
      }
      loadOptions.sort = sortOptions;
    };

    const dataStore = this.httpCustom.createStore(
      'id',
      this.timetableApiService.url(this.scheduleId),
      customizeLoadOptionsFunction
    );

    dataStore.on('loaded', (data) => {
      const timetables = data.data as Timetable[];
      timetables.forEach((timetable: Timetable, index: number) => {
        timetable['menuItems'] = this.getMenuItems(timetable);
        this.contextMenuStatuses[index] = false;
      });
    });

    this.dataSource = new DataSource(dataStore);
  }

  create() {
    this.router.navigate([`timesheet2/employee/${this.scheduleId}`]);
  }

  getStatusTypes(): DisplayValueModel<TimetableStatus>[] {
    return [
      {
        display: this.localization.getSync('Создано'),
        value: TimetableStatus.created,
      },
      {
        display: this.localization.getSync('Активно'),
        value: TimetableStatus.active,
      },
      {
        display: this.localization.getSync('Завершено'),
        value: TimetableStatus.expired,
      },
      {
        display: this.localization.getSync('В обработке'),
        value: TimetableStatus.processing,
      },
      {
        display: this.localization.getSync('Ошибка'),
        value: TimetableStatus.processFailed,
      },
    ];
  }

  displayExprStatus(status: DisplayValueModel<TimetableStatus>): string {
    return status.display;
  }

  private getMenuItems(timetable: Timetable) {
    const items = [];

    if (
      timetable.status === TimetableStatus.created ||
      timetable.status === TimetableStatus.active ||
      timetable.status === TimetableStatus.expired
    ) {
      items.push({
        text: this.localization.getSync('Редактировать'),
        actionType: 'edit',
      });
    }

    if (timetable.status === TimetableStatus.processFailed) {
      items.push({
        text: this.localization.getSync('Повторить обработку'),
        actionType: 'reconstruct',
      });
    }

    if (
      timetable.status === TimetableStatus.created ||
      timetable.status === TimetableStatus.active ||
      timetable.status === TimetableStatus.expired ||
      timetable.status === TimetableStatus.processFailed
    ) {
      items.push({
        text: this.localization.getSync('Удалить'),
        actionType: 'delete',
      });
    }

    return items;
  }

  executeAction(
    menuInfo:
      | {
          text: string;
          actionType: string;
        }
      | any,
    timetable: Timetable
  ) {
    switch (menuInfo.actionType) {
      case 'edit':
        this.edit(timetable);
        break;

      case 'delete':
        this.delete(timetable.id);
        break;

      case 'reconstruct':
        this.timetableApiService
          .reprocess(timetable.id)
          .pipe(untilDestroyed(this))
          .subscribe(() => {
            this.refresh();
          });
        break;

      default:
        console.warn(`Unknown action type: ${menuInfo.actionType}`);
        break;
    }
  }

  edit(timetable: Timetable) {
    if (
      timetable.status === TimetableStatus.processing ||
      timetable.status === TimetableStatus.processFailed
    ) {
      return;
    }

    this.dialogService.show('Редактирование расписания', {
      componentType: EditTimetableComponent,
      componentData: timetable,
      onClose: (result) => {
        if (result.saved) {
          this.grid.instance.clearSelection();
          this.refresh();
        }
      },
    });
  }

  refresh() {
    this.dataSource.reload();
  }

  onSelectionChanged(e: any) {
    const isSelectAllOrDeselectAll =
      (e.currentSelectedRowKeys.length > 0 &&
        e.currentDeselectedRowKeys.length === 0) ||
      (e.currentDeselectedRowKeys.length > 0 &&
        e.currentSelectedRowKeys.length === 0);

    if (isSelectAllOrDeselectAll) {
      this.refresh();
    }
  }

  onOptionChanged(e: any) {
    if (
      e.fullName.indexOf('filterValue') > -1 ||
      e.fullName.indexOf('filterValues') > -1
    ) {
      this.grid.instance.clearSelection();
    }
  }

  showEditAll(): boolean {
    if (this.grid) {
      return this.grid.instance?.getSelectedRowKeys().length > 0;
    }
    return false;
  }

  isActionAvailable(actionType: ActionType): boolean {
    if (this.selectedTimetablesStatusesInvalid(actionType)) {
      return false;
    }

    return true;
  }

  selectedTimetablesStatusesInvalid(actionType: ActionType): boolean {
    const selectedTimetables = this.grid.instance.getSelectedRowsData();
    const timetableStatuses = selectedTimetables.map((x) => x.status);
    if (
      timetableStatuses.includes(TimetableStatus.processFailed) ||
      timetableStatuses.includes(TimetableStatus.processing)
    ) {
      let actionText = '';
      switch (actionType) {
        case ActionType.Edit:
          actionText = 'Редактирование';
          break;
        case ActionType.Delete:
          actionText = 'Удаление';
          break;
      }

      const message = this.localization.getSync(
        `Среди выбранных присутствует расписание со статусом "В обработке" и/или "Ошибка". ${actionText} такого расписания невозможно. Пожалуйста, дождитесь успешной обработки расписания или исключите его из выборки`
      );

      this.wpSnackBar.open(message, 5000, 'warning');

      return true;
    }

    return false;
  }

  delete(timetableId: string) {
    if (!this.isActionAvailable(ActionType.Delete)) {
      return;
    }

    const message = this.localization.getSync(
      `Вы действительно хотите удалить расписание? Если к данному расписанию были привязаны отметки сотрудников, все такие отметки попадут в подозрительные`
    );
    const dialogTitle = 'Удаление расписания';

    this.showDeleteDialog([timetableId], message, dialogTitle);
  }

  deleteAll() {
    if (!this.isActionAvailable(ActionType.Delete)) {
      return;
    }
    let message: string;
    let dialogTitle: string;

    const selectedTimetables = this.grid.instance.getSelectedRowsData();
    const selectedTimetableIds = selectedTimetables.map((t) => t.id);

    if (selectedTimetableIds.length === 1) {
      message = this.localization.getSync(
        `Вы действительно хотите удалить расписание? Если к данному расписанию были привязаны отметки сотрудников, все такие отметки попадут в подозрительные`
      );
      dialogTitle = 'Удаление расписания';
    } else {
      let translation = this.localization.getSync(
        'Вы действительно хотите удалить расписания (выбрано: {0})? Если к данным расписаниям были привязаны отметки сотрудников, все такие отметки попадут в подозрительные'
      );
      message = translation.replace(
        '{0}',
        selectedTimetableIds.length.toString()
      );
      dialogTitle = 'Удаление выбранных расписаний';
    }

    this.showDeleteDialog(selectedTimetableIds, message, dialogTitle);
  }

  showDeleteDialog(
    timetableIds: string[],
    message: string,
    dialogTitle: string
  ) {
    this.dialogService.show(dialogTitle, {
      componentType: WpMessageComponent,
      componentData: { message },
      onClose: (result) => {
        if (result.saved) {
          this.timetableApiService
            .deleteTimetables({ timetablesId: timetableIds })
            .pipe(untilDestroyed(this))
            .subscribe(() => {
              this.grid.instance.clearSelection();
              this.refresh();
            });
        }
      },
    });
  }

  editAll() {
    if (!this.isActionAvailable(ActionType.Edit)) {
      return;
    }

    const selectedTimetables = this.grid.instance.getSelectedRowsData();
    this.dialogService.show('Редактирование выбранных расписаний', {
      componentType: EditTimetablesComponent,
      componentData: { timetablesId: selectedTimetables.map((x) => x.id) },
      onClose: (result) => {
        if (result.saved) {
          this.grid.instance.clearSelection();
          this.refresh();
        }
      },
    });
  }
}
