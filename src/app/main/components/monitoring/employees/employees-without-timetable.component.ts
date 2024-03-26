import { AuthorizeService } from '../../../../auth/services/authorize.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { EmployeeService } from '../../../../services/employee.service';
import { DepartmentService } from '../../../../services/department.service';
import { HttpCustom } from '../../../../shared/http';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { UntilDestroy } from '@ngneat/until-destroy';
import { exportDataGrid } from 'devextreme/excel_exporter';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { FormBuilder } from '@angular/forms';
import { format, startOfDay } from 'date-fns';
import { WpCustomValidators } from 'src/app/shared/validators/wp-custom-validators';
import { HttpCustomPost } from 'src/app/shared/httpPost';
import { EmployeeDetail } from 'src/app/models/employee.model';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import { EmployeeAddTimetableComponent } from '../../employee/edit/timetable/add/add-timetable.component';
import { Workbook } from 'exceljs';

export enum ActionType {
  viewEdit = 'edit',
  viewDelete = 'delete',
}

@UntilDestroy()
@Component({
  selector: 'wp-employees-without-timetable',
  templateUrl: './employees-without-timetable.component.html',
  styleUrls: ['./employees-without-timetable.component.scss'],
})
export class EmployeesWithoutTimetableComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;
  employeesDataSource: DataSource;
  departmentsDataSource: DataSource;
  employeesWithoutTimetableDataSource: DataSource;
  minDate: Date = new Date();
  contextMenuCondition: boolean[] = [];
  filterForm = this.fb.group({
    date: this.fb.control(startOfDay(new Date()), [
      WpCustomValidators.dateRequired('Выберите дату'),
    ]),
    departmentIds: this.fb.control<Array<string>>([]),
    employeeIds: this.fb.control<Array<string>>([]),
  });

  constructor(
    private fb: FormBuilder,
    private httpCustom: HttpCustom,
    private httpCustomPost: HttpCustomPost,
    private departmentService: DepartmentService,
    private authorizeService: AuthorizeService,
    private employeeService: EmployeeService,
    private localization: LocalizationService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.initEmployeesWithoutTimetableDataSource();
    this.initEmployeesDataSource();
    this.initDepartmentsDataSource();
  }

  initDepartmentsDataSource() {
    const dataSource = this.httpCustom.createStore(
      'id',
      this.departmentService.getAllDepartmentUrl(
        this.authorizeService.currentOrganizationId
      )
    );

    this.departmentsDataSource = new DataSource({
      store: dataSource,
      sort: [{ selector: 'name', desc: false }],
    });
  }

  initEmployeesDataSource() {
    this.employeesDataSource = new DataSource({
      store: this.httpCustom.createStore(
        'id',
        this.employeeService.getAllEmployeeUrl()
      ),
      sort: [{ selector: 'fullName', desc: false }],
      filter: ['isDeleted', '=', false],
    });
  }

  initEmployeesWithoutTimetableDataSource() {
    this.filterForm.markAllAsTouched();
    if (!this.filterForm.valid) {
      return;
    }

    const { date, departmentIds, employeeIds } = this.filterForm.value;

    const dataStore = this.httpCustomPost.createStore(
      'id',
      'api/Employee/without-timetables',
      (loadOptions) => {
        return {
          date: format(date, 'yyyy-MM-dd'),
          departmentIds,
          employeeIds,
        };
      }
    );

    dataStore.on('loaded', (data) => {
      this.processLoadedData(data.data);
    });

    this.employeesWithoutTimetableDataSource = new DataSource({
      store: dataStore,
      sort: [{ selector: 'fullName', desc: false }],
      filter: ['isDeleted', '=', false],
    });
  }

  processLoadedData(data: EmployeeDetail[]) {
    data.forEach((element: EmployeeDetail, index: number) => {
      element['menuItems'] = this.getMenuItems(element);
      this.contextMenuCondition[index] = false;
    });
  }

  private getMenuItems(
    data: EmployeeDetail
  ): { text: string; actionType: ActionType }[] {
    if (data.isDeleted) {
      return [];
    }
    const items = [];
    items.push({
      text: this.localization.getSync('Добавить расписание'),
      actionType: ActionType.viewEdit,
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
    data: EmployeeDetail
  ) {
    switch (menuInfo.actionType) {
      case ActionType.viewEdit:
        this.add(data.id);
        break;
    }
  }

  add(currentEmployeeId: string) {
    this.dialogService.show('Добавление расписания', {
      componentType: EmployeeAddTimetableComponent,
      componentData: { employeeId: currentEmployeeId },
      onClose: (result) => {
        if (result.saved) {
          this.employeesWithoutTimetableDataSource.reload();
        }
      },
    });
  }

  exportToExcel() {
    const workSheetName = this.localization.getSync('Нет расписания');
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(workSheetName);
    let rowIndex = 1;

    exportDataGrid({
      worksheet: worksheet,
      component: this.dataGrid.instance,
      customizeCell: (options) => {
        const { gridCell, excelCell } = options;
        if (gridCell.rowType === 'header') {
          excelCell.alignment = { horizontal: 'left' };
        } else if (gridCell.rowType === 'data') {
          if (gridCell.column.cellTemplate === 'rowIndexTemplate') {
            excelCell.value = rowIndex++;
            excelCell.alignment = { horizontal: 'left' };
          }
        }
      },
    }).then(function () {
      workbook.xlsx.writeBuffer().then(function (buffer) {
        saveAs(
          new Blob([buffer], { type: 'application/octet-stream' }),
          `${workSheetName}.xlsx`
        );
      });
    });
  }
}
