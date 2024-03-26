import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import DataSource from 'devextreme/data/data_source';
import { TimetableStatus } from 'src/app/main/feature-modules/schedule/models/timetable';
import {
  EmployeeDetail,
  EmployeeTimetable,
} from 'src/app/models/employee.model';
import { EmployeeService } from 'src/app/services/employee.service';
import { TimetableApiService } from 'src/app/services/timatable-api.service';
import { WpMessageComponent } from 'src/app/shared/components/wp-message/wp-message.component';
import { HttpCustom } from 'src/app/shared/http';
import { DisplayValueModel } from 'src/app/shared/models/display-value.model';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import { EmployeeAddTimetableComponent } from './add/add-timetable.component';
import { EditTimetableComponent } from 'src/app/shared/components/edit-timetable/edit-timetable.component';

@UntilDestroy()
@Component({
  selector: 'app-employee-timetable',
  templateUrl: './employee-timetable.component.html',
  styleUrls: ['./employee-timetable.component.scss'],
})
export class EmployeeTimetableComponent implements OnChanges {
  @Input() currentEmployee: EmployeeDetail;
  timetablesDataSource: DataSource;
  contextMenuStatuses: boolean[] = [];
  statusTypes: DisplayValueModel<TimetableStatus>[] = [];

  constructor(
    private employeeService: EmployeeService,
    private localization: LocalizationService,
    private httpCustom: HttpCustom,
    private dialogService: DialogService,
    private timetableApiService: TimetableApiService
  ) {
    this.statusTypes = this.getStatusTypes();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.currentEmployee && changes.currentEmployee.currentValue) {
      this.currentEmployee = changes.currentEmployee.currentValue;
      this.initDataSource();
    }
  }

  initDataSource() {
    const dataStore = this.createDataStore();
    this.timetablesDataSource = new DataSource(dataStore);
  }

  private createDataStore() {
    const url = this.employeeService.getTimetablesByEmployeeIdUrl(
      this.currentEmployee.id
    );
    const store = this.httpCustom.createStore(
      'id',
      url,
      this.customizeLoadOptions
    );
    store.on('loaded', this.processLoadedData.bind(this));
    return store;
  }

  private customizeLoadOptions(loadOptions) {
    const sortOption = { selector: 'scheduleName', desc: false };
    loadOptions.sort = Array.isArray(loadOptions.sort)
      ? [...loadOptions.sort, sortOption]
      : [loadOptions.sort || sortOption];
  }

  private processLoadedData(data) {
    const timetables = data.data as EmployeeTimetable[];
    this.contextMenuStatuses = timetables.map((timetable, index) => {
      timetable['menuItems'] = this.getMenuItems(timetable);
      return false;
    });
  }

  add() {
    this.dialogService.show('Добавление расписания', {
      componentType: EmployeeAddTimetableComponent,
      componentData: { employeeId: this.currentEmployee.id },
      onClose: (result) => {
        if (result.saved) {
          this.refresh();
        }
      },
    });
  }

  edit(timetable: EmployeeTimetable) {
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
          this.refresh();
        }
      },
    });
  }

  delete(timetableId: string) {
    const message = this.localization.getSync(
      `Вы действительно хотите удалить выбранное расписание? Если к данному расписанию были привязаны отметки сотрудников, все такие отметки попадут в подозрительные.`
    );

    this.dialogService.show('Удаление расписания', {
      componentType: WpMessageComponent,
      componentData: { message },
      onClose: (result) => {
        if (result.saved) {
          this.timetableApiService
            .deleteTimetables({ timetablesId: [timetableId] })
            .pipe(untilDestroyed(this))
            .subscribe(() => {
              this.refresh();
            });
        }
      },
    });
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

  private getMenuItems(timetable: EmployeeTimetable) {
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
    timetable: EmployeeTimetable
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

  refresh() {
    this.timetablesDataSource.reload();
  }
}
