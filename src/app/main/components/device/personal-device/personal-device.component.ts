import { AuthorizeService } from './../../../../auth/services/authorize.service';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { PersonalDeviceModel } from '../../../../models/device.model';
import { AddDeviceComponent } from '../../../dialog/device/add-device/add-device.component';
import { TypesOfDevices } from '../../../../shared/consts/device.const';
import { EditPersonalDeviceComponent } from '../../../dialog/device/edit-personal-device/edit-personal-device.component';
import { HttpCustom } from '../../../../shared/http';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import DataSource from 'devextreme/data/data_source';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { DeviceService } from 'src/app/services/device.service';
import { DataGridUtilsService } from '../../../../shared/services/data-grid-utils.service';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import { WpMessageComponent } from 'src/app/shared/components/wp-message/wp-message.component';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PhotosService } from 'src/app/services/photos.service';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { Workbook } from 'exceljs';
import saveAs from 'file-saver';

export enum ActionType {
  viewEdit = 'edit',
  viewDelete = 'delete',
  viewConfirm = 'confirm',
  viewPhoto = 'photo',
}

@UntilDestroy()
@Component({
  selector: 'app-personal-device',
  templateUrl: './personal-device.component.html',
  styleUrls: ['./personal-device.component.scss'],
})
export class PersonalDeviceComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;
  device: DataSource;
  contextMenuCondition: boolean[] = [];
  isPopupVisible = false;
  selectedPhotoUrl: string;
  isLoadingPhoto = false;

  constructor(
    private http: HttpCustom,
    private auth: AuthorizeService,
    private deviceService: DeviceService,
    private localization: LocalizationService,
    private dataGridUtilsService: DataGridUtilsService,
    private dialogService: DialogService,
    private photosService: PhotosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const dataStore = this.http.createStore(
      'id',
      `api/device/personal/getAll/dx/${this.auth.currentOrganizationId}`
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
    items.push({
      text: this.localization.getSync('Просмотреть фото'),
      actionType: ActionType.viewPhoto,
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
      case ActionType.viewPhoto:
        this.viewImage(data);
        break;
    }
  }

  refreshData() {
    this.device.reload();
  }

  handleRowDoubleClick(data: PersonalDeviceModel): void {
    if (!data.verified) {
      this.confirm(data);
    } else {
      this.editDevice(data);
    }
  }

  createDevice(): void {
    this.dialogService.show('Подключить устройство', {
      componentType: AddDeviceComponent,
      componentData: {
        organizationId: this.auth.currentOrganizationId,
        component: TypesOfDevices.personal,
      },
      onClose: (result) => {
        this.device.reload();
      },
    });
  }

  viewImage(data: PersonalDeviceModel): void {
    this.isLoadingPhoto = true;

    this.photosService
      .getPersonalDeviceEmployeePhotoUrl(data.photoId)
      .pipe(untilDestroyed(this))
      .subscribe((url) => {
        this.selectedPhotoUrl = url;
        this.isPopupVisible = true;
        this.isLoadingPhoto = false;
        this.cdr.detectChanges();
      });
  }

  confirm(data: PersonalDeviceModel): void {
    this.dialogService.show('Подтверждение устройства', {
      componentType: WpMessageComponent,
      componentData: {
        message:
          'Вы действительно хотите подтвердить выбранное устройство как личное?',
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

  editDevice(device: PersonalDeviceModel): void {
    this.dialogService.show('Редактирование устройства', {
      componentType: EditPersonalDeviceComponent,
      componentData: device,
      onClose: (result) => {
        if (result.saved) {
          this.device.reload();
        }
      },
    });
  }

  handleModalClose() {
    this.isPopupVisible = false;
  }

  exportToExcel() {
    const workSheetName = this.localization.getSync('Личные устройства');
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
