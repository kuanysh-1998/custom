import { AuthorizeService } from '../../../../auth/services/authorize.service';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { EmployeeService } from '../../../../services/employee.service';
import { Observable } from 'rxjs';
import { DepartmentModel } from '../../../../models/department.model';
import { DepartmentService } from '../../../../services/department.service';
import { HttpCustom } from '../../../../shared/http';
import { AddEmployeeComponent } from '../../../dialog/employee/add/add-employee.component';
import { SettingsService } from '../../../../services/settings.service';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { Title } from '@angular/platform-browser';
import { LicenceService } from '../../../../services/licence.service';
import { HeaderLicenseStatus } from 'src/app/shared/consts/license-status.const';
import { EmployeeDetail, EmployeeModel } from 'src/app/models/employee.model';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import { Router } from '@angular/router';
import { WpMessageComponent } from 'src/app/shared/components/wp-message/wp-message.component';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { exportDataGrid } from 'devextreme/excel_exporter';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ImportExcelEmployeeComponent } from 'src/app/main/dialog/employee/import/excel/import-excel-employee.component';
import { ImportZipEmployeeComponent } from 'src/app/main/dialog/employee/import/zip/import-zip-employee.component';

export enum ActionType {
  viewEdit = 'edit',
  viewDelete = 'delete',
}

@UntilDestroy()
@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
})
export class EmployeeListComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;
  employee: DataSource;
  department$: Observable<DepartmentModel[]>;
  hasIntegrationWith_1C: boolean = false;
  showDeleted = false;
  contextMenuCondition: boolean[] = [];
  employeeRegistered: number;
  employeeMaxNumber: number = 0;
  isDropdownVisible = false;
  constructor(
    private settingsService: SettingsService,
    private auth: AuthorizeService,
    private departmentService: DepartmentService,
    private employeeService: EmployeeService,
    private licenseService: LicenceService,
    private http: HttpCustom,
    private localization: LocalizationService,
    public titleService: Title,
    private dialogService: DialogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.licenseService
      .getCurrentLicences(this.auth.currentOrganizationId)
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        if (res && res.status === HeaderLicenseStatus.Active) {
          this.employeeMaxNumber = res.employeeMaxNumber;
        }
      });

    const dataStore = this.http.createStore(
      'id',
      this.employeeService.getAllEmployeeUrl()
    );
    dataStore.on('loaded', (data) => {
      this.getEmployeeRegistered();
      const employeeDataModels = data.data as EmployeeModel[];
      employeeDataModels.forEach((element: EmployeeModel, index: number) => {
        element['menuItems'] = this.getMenuItems(element);
        this.contextMenuCondition[index] = false;
      });
    });
    this.employee = new DataSource({
      store: dataStore,
      filter: ['isDeleted', '=', false],
    });

    this.getDepartments();
    this.settingsService
      .getPermissionGroup(this.auth.currentOrganizationId)
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.hasIntegrationWith_1C = res.integrationWith_1C;
      });
  }

  private getEmployeeRegistered(): void {
    this.employeeService
      .getAllEmployeesTotalCount()
      .pipe(untilDestroyed(this))
      .subscribe((data) => {
        this.employeeRegistered = data.totalCount;
      });
  }

  getDepartments() {
    this.department$ = this.departmentService.getAllDepartment(
      this.auth.currentOrganizationId
    );
  }

  private getMenuItems(
    data: EmployeeModel
  ): { text: string; actionType: ActionType }[] {
    if (data.isDeleted) {
      return [];
    }
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
    data: EmployeeDetail
  ) {
    switch (menuInfo.actionType) {
      case ActionType.viewEdit:
        this.editEmployee(data);
        break;
      case ActionType.viewDelete:
        this.delete(data);
        break;
    }
  }

  showDeletedEmployees() {
    this.dataGrid.instance.clearFilter();
  }

  hideDeletedEmployees() {
    this.dataGrid.instance.filter(['isDeleted', '=', false]);
  }

  changeFilter() {
    if (this.showDeleted) {
      this.showDeletedEmployees();
    } else {
      this.hideDeletedEmployees();
    }
  }

  editEmployee(employee: EmployeeDetail) {
    if (employee.isDeleted) {
      return;
    }

    this.router.navigate(['/employee', employee.id, 'edit']);
  }

  delete(data: EmployeeModel): void {
    this.dialogService.show('Удаление сотрудника', {
      componentType: WpMessageComponent,
      componentData: {
        message: 'Вы действительно хотите удалить выбранного сотрудника?',
      },
      onClose: (result) => {
        if (result.saved) {
          this.employeeService
            .removeEmployee(data.id)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
              this.employee.reload();
            });
        }
      },
    });
  }

  createEmployee() {
    this.dialogService.show('Добавление сотрудника', {
      componentType: AddEmployeeComponent,
      componentData: {
        organizationId: this.auth.currentOrganizationId,
        hasIntegrationWith_1C: this.hasIntegrationWith_1C,
      },
      onClose: (result) => {
        if (result.saved) {
          this.employee.reload();
        }
      },
    });
  }

  importToExcel() {
    this.dialogService.show('Импорт сотрудников', {
      componentType: ImportExcelEmployeeComponent,
      onClose: (result) => {
        if (result.saved) {
          this.getDepartments();
          this.employee.reload();
        }
      },
    });
  }

  importToZip() {
    this.dialogService.show('Импорт фотографий сотрудников', {
      componentType: ImportZipEmployeeComponent,
      onClose: (result) => {
        if (result.saved) {
          this.employee.reload();
        }
      },
    });
  }

  toggleDropdown() {
    this.isDropdownVisible = !this.isDropdownVisible;
  }

  @HostListener('document:click', ['$event'])
  closeDropdownOnOutsideClick(event: MouseEvent) {
    if (!event.target) return;

    const clickedInside = (event.target as HTMLElement).closest(
      '.custom-dropdown'
    );
    if (!clickedInside) {
      this.isDropdownVisible = false;
    }
  }

  exportToExcel(grid: DxDataGridComponent) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Main sheet');
    let rowIndex = 1;

    exportDataGrid({
      component: grid.instance,
      worksheet: worksheet,
      autoFilterEnabled: true,
      customizeCell: (options) => {
        const { gridCell, excelCell } = options;
        if (gridCell.column.dataField === 'isDeleted' && gridCell.data) {
          excelCell.value = gridCell.data.isDeleted ? 'Удалён' : 'Активен';
        }

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
          'Сотрудники.xlsx'
        );
      });
    });
  }
}
