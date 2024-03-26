import { Component, OnInit, ViewChild } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { AuthorizeService } from 'src/app/auth/services/authorize.service';
import { LicenseActionType } from 'src/app/main/components/licences/licences.component';
import { LicenseStatus } from 'src/app/models/license-status.model';
import { LicenceService } from 'src/app/services/licence.service';
import { WpMessageComponent } from 'src/app/shared/components/wp-message/wp-message.component';
import { HttpCustom } from 'src/app/shared/http';
import { PermissionEnum } from 'src/app/shared/models/permission.enum';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import { exportDataGrid } from 'devextreme/excel_exporter';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { LicenseDataModel } from 'src/app/models/licences/licence.model';

@UntilDestroy()
@Component({
  selector: 'wp-all-licenses',
  templateUrl: './licenses.component.html',
  styleUrls: ['./licenses.component.scss'],
})
export class LicensesComponent implements OnInit {
  @ViewChild('grid', { static: false }) grid: DxDataGridComponent;

  licensesDataSource: DataSource;

  permissions: PermissionEnum[] = this.authorizeService.getPermissions();
  contextMenuStatuses: boolean[] = [];
  statuses: { name: string; value: number }[] = [
    { name: this.localization.getSync('Создана'), value: 0 },
    {
      name: this.localization.getSync('Активна'),
      value: 1,
    },
    {
      name: this.localization.getSync('Истек срок'),
      value: 2,
    },
    { name: this.localization.getSync('Отозвана'), value: 3 },
    { name: this.localization.getSync('Отменена'), value: 4 },
  ];

  constructor(
    private httpCustom: HttpCustom,
    private authorizeService: AuthorizeService,
    private localization: LocalizationService,
    private licenceService: LicenceService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.initLicensesDataSource();
  }

  initLicensesDataSource() {
    const dataStore = this.httpCustom.createStore(
      'id',
      'domain-api/LicenseOrganization/all'
    );
    dataStore.on('loaded', (data) => {
      const licensesDataModels = data.data as LicenseDataModel[];
      licensesDataModels.forEach(
        (element: LicenseDataModel, index: number) => {
          element['menuItems'] = this.getMenuItems(element);
          this.contextMenuStatuses[index] = false;
        }
      );
    });

    this.licensesDataSource = new DataSource({
      store: dataStore,
      sort: [{ selector: 'created', desc: true }],
    });
  }

  private getMenuItems(licensesData: LicenseDataModel) {
    const items = [];

    switch (licensesData.status) {
      case LicenseStatus.active:
        if (this.permissions.includes(PermissionEnum.AnyLicenseCancel)) {
          items.push({
            text: this.localization.getSync('Отменить'),
            actionType: 'cancel',
          });
        }
        break;
    }

    return items;
  }

  executeLicenseAction(
    menuInfo:
      | {
          text: string;
          actionType: LicenseActionType;
        }
      | any,
    data: LicenseDataModel
  ) {
    switch (menuInfo.actionType) {
      case LicenseActionType.cancel:
        this.cancel(data);
        break;
    }
  }

  cancel(data: LicenseDataModel): void {
    this.dialogService.show('Отмена лицензии', {
      componentType: WpMessageComponent,
      componentData: {
        message: 'Вы уверены что хотите отменить лицензию?',
      },

      onClose: (result) => {
        if (result.saved) {
          this.licenceService
            .cancel(data.id)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
              this.grid.instance.refresh();
            });
        }
      },
    });
  }

  exportToExcel(grid: DxDataGridComponent) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Main sheet');

    exportDataGrid({
      component: grid.instance,
      worksheet: worksheet,
      autoFilterEnabled: true,
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(
          new Blob([buffer], { type: 'application/octet-stream' }),
          'Все лицензии.xlsx'
        );
      });
    });
  }
}
