import {
  Component,
  ViewChild,
  OnInit,
  ChangeDetectorRef,
  AfterViewChecked,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DepartmentService } from '../../../../services/department.service';
import { DxDataGridComponent } from 'devextreme-angular';
import { Workbook } from 'exceljs';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { saveAs } from 'file-saver';
import startOfDay from 'date-fns/startOfDay';
import { format } from 'date-fns';
import { LocalizationService } from '../../../../shared/services/localization.service';
import DataSource from 'devextreme/data/data_source';
import { HttpCustom } from '../../../../shared/http';
import { MonitoringService } from '../../../../services/monitoring.service';
import { first } from 'rxjs/operators';
import { LocationService } from '../../../../services/location.service';
import { AuthorizeService } from '../../../../auth/services/authorize.service';
import { UtilsService } from '../../../../shared/services/utils.service';
import {
  ReportLateModel,
  ReportDataLateModel,
} from '../../../../models/monitoring.model';
import { ShortDateFormat } from 'src/app/shared/consts/date-format.const';
import { WpCustomValidators } from 'src/app/shared/validators/wp-custom-validators';

@Component({
  selector: 'app-late',
  templateUrl: './late.component.html',
  styleUrls: ['./late.component.scss'],
})
export class LateComponent implements OnInit, AfterViewChecked {
  locationsDataSource: DataSource;
  departmentsDataSource: DataSource;
  dataLatecomers: ReportLateModel[] = [];
  maxDate: Date = new Date();

  filterForm = this.fb.group({
    eventDate: this.fb.control<Date[]>(
      [startOfDay(new Date()), startOfDay(new Date())],
      [WpCustomValidators.dateRangeRequired()]
    ),
    departments: this.fb.control<Array<string>>([]),
    locations: this.fb.control<Array<string>>([]),
  });

  title: string = this.localization.getSync('Опоздания');
  @ViewChild('grid', { static: false }) grid: DxDataGridComponent;

  constructor(
    private fb: FormBuilder,
    private http: HttpCustom,
    private auth: AuthorizeService,
    public utilsService: UtilsService,
    private locationService: LocationService,
    private departmentService: DepartmentService,
    private localization: LocalizationService,
    private monitoringService: MonitoringService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initDataSource();
    this.createReport();
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  initDataSource() {
    this.locationsDataSource = new DataSource({
      store: this.http.createStore(
        'id',
        this.locationService.getAllLocationDxUrl(
          this.auth.currentOrganizationId
        )
      ),
      sort: [{ selector: 'name', desc: false }],
      pageSize: 20,
    });
    this.departmentsDataSource = new DataSource({
      store: this.http.createStore(
        'id',
        this.departmentService.getAllDepartmentUrl(
          this.auth.currentOrganizationId
        )
      ),
      sort: [{ selector: 'name', desc: false }],
      pageSize: 20,
    });
  }

  createReport() {
    this.filterForm.markAllAsTouched();
    if (!this.filterForm.valid) {
      return;
    }

    const filterFormValue = this.filterForm.value;
    const [start, end] = this.filterForm.value.eventDate;

    const params = {
      start: format(start, ShortDateFormat),
      end: format(end, ShortDateFormat),
      locationsId: filterFormValue.locations,
      departmentsId: filterFormValue.departments,
    };

    this.monitoringService
      .getReportLate(params)
      .pipe(first())
      .subscribe((res: ReportDataLateModel) => {
        this.dataLatecomers = res.data;
      });
  }

  exportToExcel(e) {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(this.title);
    let rowIndex = 1;
    exportDataGrid({
      component: this.grid.instance,
      worksheet,
      autoFilterEnabled: true,
      customizeCell: ({ gridCell, excelCell }) => {
        if (gridCell.rowType === 'header') {
          excelCell.alignment = { horizontal: 'left' };
        } else if (gridCell.rowType === 'data') {
          if (gridCell.column.cellTemplate == 'minutesTemplate') {
            excelCell.value = this.utilsService.formatTimeWithDescription(
              gridCell.value
            );
          }

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
          `${this.title}.xlsx`
        );
      });
    });
    e.cancel = true;
  }

  calculateData(rowData: ReportLateModel): string {
    return `UTC${
      Math.sign(rowData.inMarkOffset) === 1
        ? `+${rowData.inMarkOffset}`
        : `${rowData.inMarkOffset}`
    }`;
  }
}
