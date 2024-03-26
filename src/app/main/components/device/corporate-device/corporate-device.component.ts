import { AuthorizeService } from './../../../../auth/services/authorize.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import {
  DeviceModel,
  PersonalDeviceModel,
} from '../../../../models/device.model';
import { LocationModel } from '../../../../models/location.model';
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { LocationService } from '../../../../services/location.service';
import { AddDeviceComponent } from '../../../dialog/device/add-device/add-device.component';
import { EditDeviceComponent } from '../../../dialog/device/edit-device/edit-device.component';
import { TypesOfDevices } from '../../../../shared/consts/device.const';
import { HttpCustom } from '../../../../shared/http';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import DataSource from 'devextreme/data/data_source';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { DeviceService } from 'src/app/services/device.service';
import { DataGridUtilsService } from '../../../../shared/services/data-grid-utils.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { WpMessageComponent } from 'src/app/shared/components/wp-message/wp-message.component';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import saveAs from 'file-saver';
import { Workbook } from 'exceljs';
import { exportDataGrid } from 'devextreme/excel_exporter';

export enum ActionType {
  viewEdit = 'edit',
  viewDelete = 'delete',
  viewConfirm = 'confirm',
}

@UntilDestroy()
@Component({
  selector: 'app-corporate-device',
  templateUrl: './corporate-device.component.html',
  styleUrls: ['./corporate-device.component.scss'],
})
export class CorporateDeviceComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;
  device: DataSource;
  location: Observable<LocationModel[]>;
  form: UntypedFormGroup;
  contextMenuCondition: boolean[] = [];

  constructor(
    private locationService: LocationService,
    private auth: AuthorizeService,
    private http: HttpCustom,
    private localization: LocalizationService,
    private deviceService: DeviceService,
    private dataGridUtilsService: DataGridUtilsService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.form = new UntypedFormGroup({
      name: new UntypedFormControl('', [Validators.required]),
    });

    const dataStore = this.http.createStore(
      'id',
      `api/device/getAll/dx/${this.auth.currentOrganizationId}`
    );
    dataStore.on('loaded', (data) => {
      const deviceDataModels = data.data as PersonalDeviceModel[];

      deviceDataModels.forEach(
        (element: PersonalDeviceModel, index: number) => {
          element['menuItems'] = this.getMenuItems(element);
          this.contextMenuCondition[index] = false;
        }
      );
    });
    this.device = new DataSource({
      store: dataStore,
    });

    this.location = this.locationService.getAllLocation(
      this.auth.currentOrganizationId
    );
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

  private getMenuItems(
    data: PersonalDeviceModel
  ): { text: string; actionType: ActionType }[] {
    const items = [];
    items.push({
      text: this.localization.getSync('Редактировать'),
      actionType: ActionType.viewEdit,
    });
    items.push({
      text: this.localization.getSync('Удалить'),
      actionType: ActionType.viewDelete,
    });

    if (!data.verified) {
      items.push({
        text: this.localization.getSync('Подтвердить'),
        actionType: ActionType.viewConfirm,
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
    data: PersonalDeviceModel
  ) {
    switch (menuInfo.actionType) {
      case ActionType.viewEdit:
        this.editDevice(data);
        break;
      case ActionType.viewDelete:
        this.delete(data);
        break;
      case ActionType.viewConfirm:
        this.confirm(data);
        break;
    }
  }

  handleRowDoubleClick(data: PersonalDeviceModel): void {
    if (!data.verified) {
      this.confirm(data);
    } else {
      this.editDevice(data);
    }
  }

  refreshData() {
    this.device.reload();
  }

  createDevice(): void {
    this.dialogService.show('Подключить устройство', {
      componentType: AddDeviceComponent,
      componentData: {
        organizationId: this.auth.currentOrganizationId,
        component: TypesOfDevices.corporate,
      },
      onClose: (result) => {
        this.device.reload();
      },
    });
  }

  editDevice(data: DeviceModel): void {
    this.dialogService.show('Редактирование устройства', {
      componentType: EditDeviceComponent,
      componentData: data,
      onClose: (result) => {
        if (result.saved) {
          this.device.reload();
        }
      },
    });
  }

  delete(data: PersonalDeviceModel): void {
    this.dialogService.show('Удаление устройства', {
      componentType: WpMessageComponent,
      componentData: {
        message: 'Вы действительно хотите удалить выбранное устройство?',
      },

      onClose: (result) => {
        if (result.saved) {
          this.deviceService
            .removeDevice(data.id)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
              this.device.reload();
            });
        }
      },
    });
  }

  confirm(data: PersonalDeviceModel): void {
    this.dialogService.show('Подтверждение устройства', {
      componentType: WpMessageComponent,
      componentData: {
        message:
          'Вы действительно хотите подтвердить выбранное устройство как корпоративное?',
      },
      onClose: (result) => {
        if (result.saved) {
          this.deviceService.approveDevice(data.id).subscribe(() => {
            this.device.reload();
          });
        } else if (result.rejected) {
          this.deviceService.rejectDevice(data.id).subscribe(() => {
            this.device.reload();
          });
        }
      },
    });
  }

  exportToExcel() {
    const workSheetName = this.localization.getSync('Корпоративные устройства');
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
