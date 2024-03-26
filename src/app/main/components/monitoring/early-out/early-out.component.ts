import {
  Component,
  ViewChild,
  OnInit,
  ChangeDetectorRef,
  AfterViewChecked,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { first } from 'rxjs/operators';
import { DxDataGridComponent } from 'devextreme-angular';
import { Workbook } from 'exceljs';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { saveAs } from 'file-saver';
import startOfDay from 'date-fns/startOfDay';
import { HttpCustom } from 'src/app/shared/http';
import DataSource from 'devextreme/data/data_source';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { DepartmentService } from '../../../../services/department.service';
import { EmployeeService } from '../../../../services/employee.service';
import format from 'date-fns/format';
import compareAsc from 'date-fns/compareAsc';
import { UtilsService } from '../../../../shared/services/utils.service';
import { MonitoringService } from '../../../../services/monitoring.service';
import { ReportEarlyOutModel } from '../../../../models/monitoring.model';
import { ShortDateFormat } from 'src/app/shared/consts/date-format.const';
import { AuthorizeService } from 'src/app/auth/services/authorize.service';
import { WpCustomValidators } from 'src/app/shared/validators/wp-custom-validators';

@Component({
  selector: 'app-early-out',
  templateUrl: './early-out.component.html',
  styleUrls: ['./early-out.component.scss'],
})
export class EarlyOutComponent implements OnInit, AfterViewChecked {
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;
  days = [];
  employeeDataSource: DataSource;
  departmentsDataSource: DataSource;
  dataReportEarlyOut: ReportEarlyOutModel[] = [];
  maxDate: Date = new Date();

  filterForm = this.fb.group({
    eventDate: this.fb.control<Date[]>(
      [startOfDay(new Date()), startOfDay(new Date())],
      [WpCustomValidators.dateRangeRequired()]
    ),
    departments: this.fb.control<Array<string>>([]),
    employees: this.fb.control<Array<string>>([]),
  });

  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private employeeService: EmployeeService,
    private http: HttpCustom,
    private authorizeService: AuthorizeService,
    private monitoringService: MonitoringService,
    public utilsService: UtilsService,
    private localization: LocalizationService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initDataSource();
    this.createReport();
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  initDataSource() {
    this.employeeDataSource = new DataSource({
      store: this.http.createStore(
        'id',
        this.employeeService.getAllEmployeeUrl()
      ),
      sort: [{ selector: 'fullName', desc: false }],
      pageSize: 20,
    });
    this.departmentsDataSource = new DataSource({
      store: this.http.createStore(
        'id',
        this.departmentService.getAllDepartmentUrl(
          this.authorizeService.currentOrganizationId
        )
      ),
      sort: [{ selector: 'name', desc: false }],
      pageSize: 20,
    });
  }

  transformReportData(params: any) {
    this.dataGrid?.instance?.beginCustomLoading(null);
    this.monitoringService
      .getReportEarlyOut(params)
      .pipe(first())
      .subscribe({
        next: (response) => {
          const reportData = response.data;
          if (reportData.length === 0) {
            this.dataReportEarlyOut = [];
            this.days = [];
            return;
          }
          const daysToShowInReportColumns = [];
          reportData.forEach((item) => {
            item.spans.forEach((span) => {
              daysToShowInReportColumns.push(span.date);
            });
          });
          this.days = this.sortAndSetUniqueDates(daysToShowInReportColumns);
          this.dataReportEarlyOut = this.updateLateInValues(reportData);
        },
        complete: () => {
          this.dataGrid?.instance?.endCustomLoading();
        },
      });
  }

  sortAndSetUniqueDates(dataDays) {
    const sortedDatesArray = dataDays.sort((a, b) =>
      compareAsc(new Date(a), new Date(b))
    );
    return [...new Set(sortedDatesArray)];
  }

  updateLateInValues(reportData: ReportEarlyOutModel[]): ReportEarlyOutModel[] {
    reportData.map((item) => {
      const spans = {};
      item.spans.forEach((s) => {
        spans[<any>s.date] = s;
      });
      (<any>item).spans = spans;
    });
    return reportData;
  }

  createReport() {
    this.filterForm.markAllAsTouched();
    if (!this.filterForm.valid) {
      return;
    }

    const [start, end] = this.filterForm.value.eventDate;
    const filterFormValue = this.filterForm.value;

    const params = {
      start: format(start, ShortDateFormat),
      end: format(end, ShortDateFormat),
      employeesId: filterFormValue.employees,
      departmentsId: filterFormValue.departments,
    };

    this.transformReportData(params);
  }

  exportToExcel() {
    const workSheetName = this.localization.getSync('Ранний уход');
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(workSheetName);
    let rowIndex = 1;
    
    exportDataGrid({
      component: this.dataGrid.instance,
      worksheet,
      autoFilterEnabled: true,
      customizeCell: ({ gridCell, excelCell }) => {
        if (gridCell.rowType === 'header') {
          excelCell.alignment = { horizontal: 'left' };
        } else if  (gridCell.rowType === 'data') {
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
          `${workSheetName}.xlsx`
        );
      });
    });
  }
}
