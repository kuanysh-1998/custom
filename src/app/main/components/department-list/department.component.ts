import { AuthorizeService } from './../../../auth/services/authorize.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { DepartmentModel } from '../../../models/department.model';
import { HttpCustom } from '../../../shared/http';
import DataSource from 'devextreme/data/data_source';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { DepartmentService } from 'src/app/services/department.service';
import { Title } from '@angular/platform-browser';
import { DataGridUtilsService } from '../../../shared/services/data-grid-utils.service';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import { EditDepartmentComponent } from '../../dialog/department/edit-department/edit-department.component';
import { AddDepartmentComponent } from '../../dialog/department/add-department/add-department.component';
import { WpMessageComponent } from 'src/app/shared/components/wp-message/wp-message.component';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { Workbook } from 'exceljs';
import saveAs from 'file-saver';

export enum ActionType {
  viewEdit = 'edit',
  viewDelete = 'delete',
}

@UntilDestroy()
@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.scss'],
})
export class DepartmentComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;
  department: DataSource;
  contextMenuCondition: boolean[] = [];
  currentOrganizationId: string = this.auth.currentOrganizationId;

  constructor(
    private auth: AuthorizeService,
    private http: HttpCustom,
    private departmentService: DepartmentService,
    private localization: LocalizationService,
    public titleService: Title,
    private dataGridUtilsService: DataGridUtilsService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    const dataStore = this.http.createStore(
      'id',
      `api-department/getAll/dx/${this.auth.currentOrganizationId}`
    );
    dataStore.on('loaded', (data) => {
      const departmentDataModels = data.data as DepartmentModel[];
      departmentDataModels.forEach(
        (element: DepartmentModel, index: number) => {
          element['menuItems'] = this.getMenuItems();
          this.contextMenuCondition[index] = false;
        }
      );
    });
    this.department = new DataSource({
      store: dataStore,
    });
  }

  private getMenuItems(): { text: string; actionType: ActionType }[] {
    const items = [];
    items.push({
      text: this.localization.getSync('Редактировать'),
      actionType: ActionType.viewEdit,
    });
    items.push({
      text: this.localization.getSync('Удалить'),
      actionType: ActionType.viewDelete,
    });
    return items;
  }

  executeAction(
    menuInfo:
      | {
          text: string;
          actionType: ActionType;
        }
      | any,
    data: DepartmentModel
  ) {
    switch (menuInfo.actionType) {
      case ActionType.viewEdit:
        this.editDepartment(data);
        break;
      case ActionType.viewDelete:
        this.delete(data);
        break;
    }
  }

  editDepartment(department: DepartmentModel) {
    this.dialogService.show('Редактирование отдела', {
      componentType: EditDepartmentComponent,
      componentData: department,
      onClose: (result) => {
        if (result.saved) {
          this.department.reload();
        }
      },
    });
  }

  createDepartment() {
    this.dialogService.show('Добавление отдела', {
      componentType: AddDepartmentComponent,
      onClose: (result) => {
        if (result.saved) {
          this.department.reload();
        }
      },
    });
  }

  delete(data: DepartmentModel): void {
    this.dialogService.show('Удаление отдела', {
      componentType: WpMessageComponent,
      componentData: {
        message: 'Вы действительно хотите удалить выбранный отдел?',
      },

      onClose: (result) => {
        if (result.saved) {
          this.departmentService
            .removeDepartment(data.id)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
              this.department.reload();
            });
        }
      },
    });
  }

  exportToExcel() {
    const workSheetName = this.localization.getSync('Отделы');
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
}
