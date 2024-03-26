import { AuthorizeService } from './../../../auth/services/authorize.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { PartnerModel } from '../../../models/partner.model';
import { OrganizationService } from '../../../services/organization.service';
import { ViewPersonalInfoComponent } from '../../dialog/billing/view-personal-info/view-personal-info.component';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { DisplayValueModel } from 'src/app/shared/models/display-value.model';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { Title } from '@angular/platform-browser';
import { DataGridUtilsService } from '../../../shared/services/data-grid-utils.service';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Workbook } from 'exceljs';
import { exportDataGrid } from 'devextreme/excel_exporter';
import saveAs from 'file-saver';

@UntilDestroy()
@Component({
  selector: 'app-biling',
  templateUrl: './biling.component.html',
  styleUrls: ['./biling.component.scss'],
})
export class BilingComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;
  levelTypes: DisplayValueModel<number>[];
  partner: PartnerModel[];

  constructor(
    private service: OrganizationService,
    private auth: AuthorizeService,
    private localization: LocalizationService,
    public titleService: Title,
    private dataGridUtilsService: DataGridUtilsService,
    private dialogService: DialogService
  ) {
    this.levelTypes = [1, 2, 3, 4, 5].map((x) => {
      return {
        display: this.localization.getSync('Уровень __level__', { level: x }),
        value: x,
      };
    });
  }

  ngOnInit(): void {
    this.getAllPartner();
  }

  getAllPartner() {
    this.service
      .getAllPartner()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.partner = res.data;
      });
  }

  viewPersonalInformation($event: any): void {
    if (!$event.data.personalAccount) {
      return;
    }

    this.dialogService.show($event.data.name, {
      componentType: ViewPersonalInfoComponent,
      componentData: {
        personal: $event.data.personalAccount,
        initiator: this.auth.getUserEmail(),
      },
      width: 1000,

      onClose: () => {
        this.getAllPartner();
      },
    });
  }

  exportToExcel() {
    const workSheetName = this.localization.getSync('Партнеры');
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
