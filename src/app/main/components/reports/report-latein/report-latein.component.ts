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
import { ReportsService } from './../../../../services/reports.service';
import { ReportLateInModel } from '../../../../models/reports.model';
import compareAsc from 'date-fns/compareAsc';
import { UtilsService } from '../../../../shared/services/utils.service';
import { ShortDateFormat } from 'src/app/shared/consts/date-format.const';
import { AuthorizeService } from 'src/app/auth/services/authorize.service';
import { WpCustomValidators } from 'src/app/shared/validators/wp-custom-validators';

@Component({
  selector: 'app-report-latein',
  templateUrl: './report-latein.component.html',
  styleUrls: ['./report-latein.component.scss'],
})
export class ReportLateinComponent implements OnInit, AfterViewChecked {
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;
  maxDate: Date = new Date();
  days = [];
  employeeDataSource: DataSource;
  departmentsDataSource: DataSource;
  dataReportLateIn: ReportLateInModel[] = [];
  showDeletedEmployees = false;
  private readonly notDeletedFilter = ['isDeleted', '=', false];

  filterForm = this.fb.group({
    eventDate: this.fb.control<Date[]>(
      [startOfDay(new Date()), startOfDay(new Date())],
      [WpCustomValidators.dateRangeRequired()]
    ),
    departments: this.fb.control<Array<string>>([]),
    employees: this.fb.control<Array<string>>([]),
    isLateIn: this.fb.control<boolean>(true),
  });

  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private employeeService: EmployeeService,
    private http: HttpCustom,
    private auth: AuthorizeService,
    private reportsService: ReportsService,
    public utilsService: UtilsService,
    private localization: LocalizationService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const today = startOfDay(new Date());
    const params = {
      start: format(today, ShortDateFormat),
      end: format(today, ShortDateFormat),
      filter: this.filterForm.value.isLateIn ? '[["lateIn",">",0]]' : [],
    };
    this.transformReportData(params);
    this.initDataSource();
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
      filter: this.notDeletedFilter,
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

  changeFilter(condition: boolean = true) {
    if (this.showDeletedEmployees) {
      this.employeeDataSource = new DataSource({
        store: this.http.createStore(
          'id',
          this.employeeService.getAllEmployeeUrl()
        ),
        sort: [{ selector: 'fullName', desc: false }],
      });
    }
    if (!this.showDeletedEmployees && condition) {
      this.employeeDataSource.filter(this.notDeletedFilter);
      this.employeeDataSource.load();
      this.filterForm.get('employees').setValue([]);
    }
  }

  transformReportData(params: any) {
    this.dataGrid?.instance?.beginCustomLoading(null);
    this.reportsService
      .getReportLateIn(params)
      .pipe(first())
      .subscribe({
        next: (response) => {
          const reportData = response.data;
          if (reportData.length === 0) {
            this.dataReportLateIn = [];
            this.days = [];
            return;
          }
          const daysToShowInReportColumns = [];
          reportData.forEach((item) => {
            item.spans.forEach((span) => {
              daysToShowInReportColumns.push(span.date);
              span.isMark = this.hasDateMark(span);
            });
          });
          this.days = this.sortAndSetUniqueDates(daysToShowInReportColumns);
          this.dataReportLateIn = this.updateLateInValues(reportData);
        },
        complete: () => {
          this.dataGrid?.instance?.endCustomLoading();
        },
      });
  }

  hasDateMark(span) {
    return !(span.lateIn === 0 && span.in === null);
  }

  sortAndSetUniqueDates(dataDays) {
    const sortedDatesArray = dataDays.sort((a, b) =>
      compareAsc(new Date(a), new Date(b))
    );
    return [...new Set(sortedDatesArray)];
  }

  updateLateInValues(reportData: ReportLateInModel[]): ReportLateInModel[] {
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
    const filterFormValue = this.filterForm.value;
    const [start, end] = this.filterForm.controls.eventDate.value;

    const params = {
      start: format(start, ShortDateFormat),
      end: format(end, ShortDateFormat),
      employeesId: filterFormValue.employees,
      departmentsId: filterFormValue.departments,
      filter: filterFormValue.isLateIn ? '[["lateIn",">",0]]' : [],
    };

    this.transformReportData(params);
  }

  exportToExcel() {
    const workSheetName = this.localization.getSync('Опоздания');
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(workSheetName);
    let rowIndex = 1;
    
    exportDataGrid({
      component: this.dataGrid.instance,
      worksheet,
      autoFilterEnabled: true,
      customizeCell: ({ gridCell, excelCell }) => {
        if (gridCell.rowType === 'data') {
          if (gridCell.column.cellTemplate == 'minutesTemplate') {
            excelCell.value = this.utilsService.formatTimeWithDescription(
              gridCell.value
            );
          }
          if (gridCell.column.cellTemplate == 'formatTimeForMarksTemplate') {
            excelCell.value =
              this.utilsService.formatTimeWithDescriptionForMarks(
                gridCell.value,
                true
              );
          }

          if (gridCell.column.cellTemplate === 'rowIndexTemplate') {
            excelCell.value = rowIndex++;
            excelCell.alignment = { horizontal: 'center' };
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
