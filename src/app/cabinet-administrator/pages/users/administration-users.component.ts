import { Observable } from 'rxjs';
import { AdministrationUserModel } from '../../models/user.model';
import { AdministrationOrganizationModel } from '../../models/organization.model';
import { OrganizationService } from '../../../services/organization.service';
import { HttpCustom } from '../../../shared/http';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { Title } from '@angular/platform-browser';
import { DataGridUtilsService } from '../../../shared/services/data-grid-utils.service';
import { Router } from '@angular/router';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import DataSource from 'devextreme/data/data_source';
import { UserAddComponent } from './add/user-add.component';
import { EmployeeService } from 'src/app/services/employee.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Workbook } from 'exceljs';
import { exportDataGrid } from 'devextreme/excel_exporter';
import saveAs from 'file-saver';

export enum ActionType {
  viewEdit = 'edit',
  block = 'block',
  unblock = 'unblock',
}

@UntilDestroy()
@Component({
  selector: 'administration--users',
  templateUrl: './administration-users.component.html',
  styleUrls: ['./administration-users.component.scss'],
})
export class AdministrationUsersComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;

  users: DataSource;
  organization$: Observable<AdministrationOrganizationModel[]>;
  contextMenuCondition: boolean[] = [];

  constructor(
    private employeeService: EmployeeService,
    private organizationService: OrganizationService,
    private http: HttpCustom,
    public titleService: Title,
    private dataGridUtilsService: DataGridUtilsService,
    private router: Router,
    private dialogService: DialogService,
    private localization: LocalizationService
  ) {
    this.organization$ = this.organizationService.getAllOrganization(0);
  }

  ngOnInit(): void {
    const dataStore = this.http.createStore(
      'id',
      `api/Employee/with-credentials`
    );
    dataStore.on('loaded', (data) => {
      const userModels = data.data as AdministrationUserModel[];

      userModels.forEach((user, index) => {
        user['menuItems'] = this.getMenuItems(user);
        this.contextMenuCondition[index] = false;
      });
    });

    this.users = new DataSource({
      store: dataStore,
    });
  }

  private getMenuItems(
    user: AdministrationUserModel
  ): { text: string; actionType: ActionType }[] {
    const items = [];

    items.push({
      text: this.localization.getSync('Редактировать'),
      actionType: ActionType.viewEdit,
    });

    if (user.blockAuthentication) {
      items.push({
        text: this.localization.getSync('Разблокировать'),
        actionType: ActionType.unblock,
      });
    } else {
      items.push({
        text: this.localization.getSync('Заблокировать'),
        actionType: ActionType.block,
      });
    }

    return items;
  }

  executeAction(
    menuInfo:
      | {
          text: string;
          actionType: ActionType;
        }
      | any,
    data: AdministrationUserModel
  ) {
    switch (menuInfo.actionType) {
      case ActionType.viewEdit:
        this.editUser(data);
        break;
      case ActionType.block:
        this.block(data.id);
        break;
      case ActionType.unblock:
        this.unblock(data.id);
        break;
    }
  }

  block(employeeId: string): void {
    this.employeeService
      .blockEmployee(employeeId)
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.users.reload();
      });
  }

  unblock(employeeId: string): void {
    this.employeeService
      .unblockEmployee(employeeId)
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.users.reload();
      });
  }

  createUser() {
    this.dialogService.show('Добавление пользователя', {
      componentType: UserAddComponent,
      onClose: (result) => {
        if (result.saved) {
          this.users.reload();
        }
      },
    });
  }

  editUser(user: AdministrationUserModel) {
    this.router.navigate(['/administrator/users', user.id, 'edit']);
  }

  exportToExcel() {
    const workSheetName = this.localization.getSync('Пользователи');
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(workSheetName);

    let rowIndex = 1;

    exportDataGrid({
      worksheet: worksheet,
      component: this.dataGrid.instance,
      customizeCell: ({ gridCell, excelCell }) => {
        if (
          gridCell.column.dataField === 'blockAuthentication' &&
          gridCell.data
        ) {
          excelCell.value = gridCell.data.blockAuthentication
            ? 'Заблокирован'
            : '';
          excelCell.alignment = { horizontal: 'left' };
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
          `${workSheetName}.xlsx`
        );
      });
    });
  }
}
