import { AuthorizeService } from './../../../auth/services/authorize.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AddReportComponent } from '../../dialog/report-employee/add-report/add-report.component';
import {
  EventTypesProvider,
  ReportEmployeeModel,
} from '../../../models/report-employee.model';
import { DxDataGridComponent } from 'devextreme-angular';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { ReportEmployeeService } from 'src/app/services/report-employee.service';
import { PermissionEnum } from '../../../shared/models/permission.enum';
import { DataGridUtilsService } from '../../../shared/services/data-grid-utils.service';
import { ViewMarkComponent } from '../../dialog/marks/view-mark/view-mark.component';
import DataSource from 'devextreme/data/data_source';
import { HttpCustom } from 'src/app/shared/http';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import { WpMessageComponent } from 'src/app/shared/components/wp-message/wp-message.component';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { Workbook } from 'exceljs';
import saveAs from 'file-saver';

export enum ActionType {
  delete = 'delete',
  view = 'view',
}

@UntilDestroy()
@Component({
  selector: 'app-report-employee',
  templateUrl: './report-employee.component.html',
  styleUrls: ['./report-employee.component.scss'],
})
export class ReportEmployeeComponent implements OnInit {
  reportEmployee: DataSource;
  marksPageCount: number;
  currentIndex: number;
  contextMenuCondition: boolean[] = [];

  eventType = this.eventTypesProvider.values;
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;
  PermissionType = PermissionEnum;

  constructor(
    private httpCustom: HttpCustom,
    private auth: AuthorizeService,
    private eventTypesProvider: EventTypesProvider,
    private localization: LocalizationService,
    public reportEmployeeService: ReportEmployeeService,
    private dataGridUtilsService: DataGridUtilsService,
    private dialogService: DialogService
  ) {
    const dataStore = this.httpCustom.createStore('id', `domain-api/mark`);
    dataStore.on('loaded', (data) => {
      const reportEmployeeDataModels = data.data as ReportEmployeeModel[];
      reportEmployeeDataModels.forEach(
        (element: ReportEmployeeModel, index: number) => {
          element['menuItems'] = this.getMenuItems(element);
          this.contextMenuCondition[index] = false;
        }
      );

      const pageIndex = this.reportEmployee.pageIndex();
      this.reportEmployeeService.setItemsPerPage(pageIndex, data.data.length);
      this.reportEmployeeService.setPageLoaded(pageIndex, true);
      this.reportEmployeeService.notifyDataLoaded();
    });
    this.reportEmployee = new DataSource({
      store: dataStore,
    });
  }

  onRowPrepared(e: any): void {
    if (e.rowType !== 'data') return;

    const isLocationMissing =
      e.data?.locationIdIn === null || e.data?.locationIdOut === null;
    const isNotVerified = e.data?.verified === false;

    e.rowElement.classList.add(
      isLocationMissing
        ? 'location-missing'
        : isNotVerified
        ? 'not-verified'
        : 'normal-row'
    );
  }

  ngOnInit(): void {
    this.reportEmployeeService.data$.subscribe((pageIndex: number) => {
      this.goToNextPage(pageIndex);
    });
  }

  private getMenuItems(data: ReportEmployeeModel) {
    const items = [];

    items.push({
      text: this.localization.getSync('Просмотреть'),
      actionType: ActionType.view,
    });

    items.push({
      text: this.localization.getSync('Удалить'),
      actionType: ActionType.delete,
    });

    return items;
  }

  goToNextPage(pageIndex: number) {
    this.dataGrid.instance.pageIndex(pageIndex);
  }

  viewMark(element: ReportEmployeeModel): void {
    this.marksPageCount = this.dataGrid.instance.pageCount();
    const dataArray = this.reportEmployee.items();
    if (dataArray) {
      this.currentIndex = dataArray.findIndex((item) => item === element);
    }

    this.dialogService.show('Просмотр отметки', {
      componentType: ViewMarkComponent,
      componentData: {
        reportEmployee: this.reportEmployee,
        marksPageCount: this.marksPageCount,
        currentIndex: this.currentIndex,
      },
      width: 600,
      onClose: (result) => {
        if (result.saved) {
          this.reportEmployee.reload();
        }
      },
    });
  }

  create() {
    this.dialogService.show('Добавление отметки', {
      componentType: AddReportComponent,

      componentData: {
        currentOrganizationId: this.auth.currentOrganizationId,
      },
      onClose: (result) => {
        if (result.saved) {
          this.reportEmployee.reload();
        }
      },
    });
  }

  delete(data: ReportEmployeeModel): void {
    this.dialogService.show('Удаление отметки', {
      componentType: WpMessageComponent,
      componentData: {
        message: 'Вы действительно хотите удалить выбранную отметку?',
      },

      onClose: (result) => {
        if (result.saved) {
          this.reportEmployeeService
            .deleteEvent(data.id)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
              this.reportEmployee.reload();
            });
        }
      },
    });
  }

  calculateData(rowData: ReportEmployeeModel): string {
    return `UTC${
      Math.sign(rowData.eventDateOffset) === 1
        ? `+${rowData.eventDateOffset}`
        : `${rowData.eventDateOffset}`
    }`;
  }

  exportToExcel() {
    const workSheetName = this.localization.getSync('Все отметки');
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(workSheetName);

    let rowIndex = 1;

    exportDataGrid({
      worksheet: worksheet,
      component: this.dataGrid.instance,
      customizeCell: ({ gridCell, excelCell }) => {
        if (gridCell.rowType === 'header') {
          excelCell.alignment = { horizontal: 'left' };
        } else if (gridCell.rowType === 'data') {
          if (gridCell.column.cellTemplate === 'rowIndexTemplate') {
            excelCell.value = rowIndex++;
            excelCell.alignment = { horizontal: 'left' };
          }
        }
      },
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(
          new Blob([buffer], { type: 'application/octet-stream' }),
          `${workSheetName}.xlsx`
        );
      });
    });
  }

  executeAction(
    menuInfo:
      | {
          text: string;
          actionType: ActionType;
        }
      | any,
    data: ReportEmployeeModel
  ) {
    switch (menuInfo.actionType) {
      case ActionType.view:
        this.viewMark(data);
        break;
      case ActionType.delete:
        this.delete(data);
        break;
    }
  }
}
