import { DxDataGridComponent } from 'devextreme-angular';
import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpCustom } from '../../../shared/http';
import { OrganizationService } from '../../../services/organization.service';
import { AdministrationOrganizationAddComponent } from './add/administration-organization-add.component';
import { AdministrationOrganizationEditComponent } from './edit/administration-organization-edit.component';
import { AdministrationOrganizationModel } from '../../models/organization.model';
import { Title } from '@angular/platform-browser';
import { DataGridUtilsService } from '../../../shared/services/data-grid-utils.service';
import DataSource from 'devextreme/data/data_source';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import { Workbook } from 'exceljs';
import { exportDataGrid } from 'devextreme/excel_exporter';
import saveAs from 'file-saver';

export enum ActionType {
  viewEdit = 'edit',
}

@Component({
  selector: 'administration-organizations',
  templateUrl: './administration-organizations.component.html',
  styleUrls: ['./administration-organizations.component.scss'],
})
export class AdministrationOrganizationsComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;
  organizationsDataSource: DataSource;
  contextMenuCondition: boolean[] = [];

  constructor(
    private organizationService: OrganizationService,
    private httpCustom: HttpCustom,
    public titleService: Title,
    private dataGridUtilsService: DataGridUtilsService,
    private localization: LocalizationService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.initOrganizationsDataSource();
  }

  private initOrganizationsDataSource(): void {
    const dataStore = this.httpCustom.createStore(
      'id',
      this.organizationService.getOrganizationDxUrl()
    );

    dataStore.on('loaded', (data) => {
      const organizationsModels =
        data.data as AdministrationOrganizationModel[];
      organizationsModels.forEach((user, index) => {
        user['menuItems'] = this.getMenuItems(user);
        this.contextMenuCondition[index] = false;
      });
    });

    this.organizationsDataSource = new DataSource({
      store: dataStore,
      sort: [{ selector: 'name', desc: false }],
    });
  }

  private getMenuItems(
    organization: AdministrationOrganizationModel
  ): { text: string; actionType: ActionType }[] {
    const items = [];

    items.push({
      text: this.localization.getSync('Редактировать'),
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
    data: AdministrationOrganizationModel
  ) {
    switch (menuInfo.actionType) {
      case ActionType.viewEdit:
        this.update(data);
        break;
    }
  }

  create(): void {
    this.dialogService.show('Добавление организации', {
      componentType: AdministrationOrganizationAddComponent,
      onClose: (result) => {
        if (result.saved) {
          this.organizationsDataSource.reload();
        }
      },
    });
  }

  update(data: AdministrationOrganizationModel): void {
    this.dialogService.show('Редактирование организации', {
      componentType: AdministrationOrganizationEditComponent,
      componentData: data.id,
      onClose: (result) => {
        if (result.saved) {
          this.organizationsDataSource.reload();
        }
      },
    });
  }

  exportToExcel() {
    const workSheetName = this.localization.getSync('Организации');
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
