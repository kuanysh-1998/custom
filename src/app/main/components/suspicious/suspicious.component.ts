import { Component, OnInit, ViewChild } from '@angular/core';
import { ViewSuspiciousComponent } from '../../dialog/suspicious/view-suspicious/view-suspicious.component';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { SuspiciousService } from 'src/app/services/suspicious.service';
import { DisplayValueModel } from '../../../shared/models/display-value.model';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { Workbook } from 'exceljs';
import saveAs from 'file-saver';

import { DxDataGridComponent } from 'devextreme-angular';
import { DeviceType, SuspiciousModel } from 'src/app/models/suspicious.model';
import { MarkType } from '../../../models/suspicious.model';
import { ActionType } from '../../../services/suspicious.service';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';

@Component({
  selector: 'app-suspicious',
  templateUrl: './suspicious.component.html',
  styleUrls: ['./suspicious.component.scss'],
})
export class SuspiciousComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;

  markTypes: DisplayValueModel<MarkType>[] = [];
  deviceTypes: DisplayValueModel<DeviceType>[] = [];
  gridAllowedPageSizes: number[] = [10, 20, 50, 100];
  pageSize: number = this.gridAllowedPageSizes[0];

  constructor(
    private localization: LocalizationService,
    public suspiciousService: SuspiciousService,
    private dialogService: DialogService
  ) {
    this.markTypes = this.suspiciousService.getMarkTypes();
    this.deviceTypes = this.suspiciousService.getDeviceTypes();
  }

  ngOnInit(): void {
    this.suspiciousService.data$.subscribe((pageIndex: number) => {
      this.goToNextPage(pageIndex);
    });
  }

  goToNextPage(pageIndex: number) {
    this.dataGrid.instance.pageIndex(pageIndex);
  }

  executeAction(
    menuInfo:
      | {
          text: string;
          actionType: ActionType;
        }
      | any,
    data: SuspiciousModel
  ) {
    switch (menuInfo.actionType) {
      case ActionType.View:
        this.viewSuspicious(data);
        break;
    }
  }

  viewSuspicious(element: SuspiciousModel): void {
    this.suspiciousService.suspiciousPageCount =
      this.dataGrid.instance.pageCount();

    const dataArray = this.suspiciousService.suspicious?.items();
    if (dataArray) {
      this.suspiciousService.currentIndex = dataArray.findIndex(
        (item) => item === element
      );
    }

    this.dialogService.show('Подозрительные отметки', {
      componentType: ViewSuspiciousComponent,
      width: 600,
      onClose: (result) => {
        if (result.saved) {
          this.suspiciousService.suspicious.reload();
        }
      },
    });
  }

  displayExprMark(markType: DisplayValueModel<MarkType>): string {
    return markType.display;
  }

  displayExprDevice(deviceType: DisplayValueModel<DeviceType>): string {
    return deviceType.display;
  }

  exportToExcel() {
    const workSheetName = this.localization.getSync('Подозрительные отметки');
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
