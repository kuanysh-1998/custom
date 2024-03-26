import { AuthorizeService } from './../../../auth/services/authorize.service';
import DataSource from 'devextreme/data/data_source';
import { Component, OnInit, ViewChild } from '@angular/core';
import { LocationModel } from '../../../models/location.model';
import { HttpCustom } from '../../../shared/http';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { LocationService } from 'src/app/services/location.service';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { Title } from '@angular/platform-browser';
import { DataGridUtilsService } from '../../../shared/services/data-grid-utils.service';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import { AddLocationComponent } from '../../dialog/location/add/add-location.component';
import { EditLocationComponent } from '../../dialog/location/edit/edit-location.component';
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
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss'],
})
export class LocationComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;
  location: DataSource;
  contextMenuCondition: boolean[] = [];

  constructor(
    private auth: AuthorizeService,
    private http: HttpCustom,
    private locationService: LocationService,
    private localization: LocalizationService,
    public titleService: Title,
    private dataGridUtilsService: DataGridUtilsService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    const dataStore = this.http.createStore(
      'id',
      `api/location/getAll/dx/${this.auth.currentOrganizationId}`
    );
    dataStore.on('loaded', (data) => {
      const locationDataModels = data.data as LocationModel[];
      locationDataModels.forEach((element: LocationModel, index: number) => {
        element['menuItems'] = this.getMenuItems();
        this.contextMenuCondition[index] = false;
      });
    });
    this.location = new DataSource({
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
    data: LocationModel
  ) {
    switch (menuInfo.actionType) {
      case ActionType.viewEdit:
        this.editLocation(data);
        break;
      case ActionType.viewDelete:
        this.delete(data);
        break;
    }
  }

  createLocation() {
    this.dialogService.show('Добавление локации', {
      componentType: AddLocationComponent,
      componentData: {
        organizationId: this.auth.currentOrganizationId,
      },
      onClose: (result) => {
        if (result.saved) {
          this.location.reload();
        }
      },
    });
  }

  editLocation(data: LocationModel) {
    this.dialogService.show('Редактирование локации', {
      componentType: EditLocationComponent,
      componentData: {
        organizationId: data.organizationId,
        location: data,
      },
      onClose: (result) => {
        if (result.saved) {
          this.location.reload();
        }
      },
    });
  }

  delete(data: LocationModel): void {
    this.dialogService.show('Удаление локации', {
      componentType: WpMessageComponent,
      componentData: {
        message: 'Вы действительно хотите удалить выбранную локацию?',
      },

      onClose: (result) => {
        if (result.saved) {
          this.locationService
            .removeLocation(data.id)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
              this.location.reload();
            });
        }
      },
    });
  }

  exportToExcel() {
    const workSheetName = this.localization.getSync('Локации');
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
