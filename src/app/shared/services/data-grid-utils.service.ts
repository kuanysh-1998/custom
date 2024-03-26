import { DxDataGridComponent } from 'devextreme-angular';
import { Workbook } from 'exceljs';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { saveAs } from 'file-saver';
import { Title } from '@angular/platform-browser';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})

export class DataGridUtilsService {
  constructor(private titleService: Title) {}

  exportToExcel(grid: DxDataGridComponent) {
    const title = this.titleService.getTitle().replace(' - Workpace', '');
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(title);

    exportDataGrid({
      component: grid.instance,
      worksheet,
      autoFilterEnabled: true,
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(
          new Blob([buffer], { type: 'application/octet-stream' }),
          `${title}.xlsx`
        );
      });
    });
  }
}
