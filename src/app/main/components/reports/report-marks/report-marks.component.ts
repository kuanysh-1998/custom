import { Component, OnInit, ViewChild } from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import {
  ReportMarkModel,
  TimeMark,
  WorkTime,
} from 'src/app/models/reports.model';
import { DepartmentService } from 'src/app/services/department.service';
import { ReportsService } from 'src/app/services/reports.service';
import { HttpCustom } from 'src/app/shared/http';
import { TranslateService } from '@ngx-translate/core';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { FormBuilder } from '@angular/forms';
import startOfDay from 'date-fns/startOfDay';
import { EmployeeService } from 'src/app/services/employee.service';
import { format } from 'date-fns';
import { ShortDateFormat } from 'src/app/shared/consts/date-format.const';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { Workbook } from 'exceljs';
import saveAs from 'file-saver';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { WpCustomValidators } from 'src/app/shared/validators/wp-custom-validators';
import { AuthorizeService } from 'src/app/auth/services/authorize.service';

interface Data {
  inMark: TimeMark;
  outMark: TimeMark;
}
@UntilDestroy()
@Component({
  selector: 'app-report-marks',
  templateUrl: './report-marks.component.html',
  styleUrls: ['./report-marks.component.scss'],
})
export class ReportMarksComponent implements OnInit {
  @ViewChild('dataGrid') dataGrid: DxDataGridComponent;
  reportMarkDataSource: DataSource;
  departmentsDataSource: DataSource;
  employeeDataSource: DataSource;

  dataReportMark: ReportMarkModel[] = [];
  showDeletedEmployees = false;
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
    private httpCustom: HttpCustom,
    private departmentService: DepartmentService,
    private reportsService: ReportsService,
    private translateService: TranslateService,
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private localizationService: LocalizationService,
    private authorizeService: AuthorizeService
  ) {}

  ngOnInit(): void {
    this.initDataSource();
    this.translateService.onLangChange
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.dataReportMark = [];
      });
    this.createReport();
  }

  initDataSource() {
    this.employeeDataSource = new DataSource({
      store: this.httpCustom.createStore(
        'id',
        this.employeeService.getAllEmployeeUrl()
      ),
      sort: [{ selector: 'fullName', desc: false }],
      filter: ['isDeleted', '=', false],
    });
    this.departmentsDataSource = new DataSource({
      store: this.httpCustom.createStore(
        'id',
        this.departmentService.getAllDepartmentUrl(
          this.authorizeService.currentOrganizationId
        )
      ),
      sort: [{ selector: 'name', desc: false }],
    });
  }

  createReport() {
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      return;
    }

    this.dataGrid?.instance?.beginCustomLoading(null);
    const formValue = this.filterForm.value;

    const [start, end] = this.filterForm.controls.eventDate.value;
    const params = {
      start: format(start, ShortDateFormat),
      end: format(end, ShortDateFormat),
      employeesId: formValue.employees,
      departmentsId: formValue.departments,
    };
    this.reportsService
      .getReportMarks(params)
      .pipe(untilDestroyed(this))
      .subscribe((reportMarks) => {
        this.dataGrid?.instance?.endCustomLoading();
        this.dataReportMark = reportMarks.data;
        this.changeFilter();
      });
  }

  changeFilter() {
    if (this.showDeletedEmployees) {
      this.employeeDataSource = new DataSource({
        store: this.httpCustom.createStore(
          'id',
          this.employeeService.getAllEmployeeUrl()
        ),
        sort: [{ selector: 'fullName', desc: false }],
      });
    } else {
      this.employeeDataSource.filter(['isDeleted', '=', false]);
      this.employeeDataSource.load();

      this.filterForm.get('employees').setValue([]);
    }
  }

  exportToExcel() {
    const workSheetName = this.localizationService.getSync('Отчет по отметкам');
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(workSheetName);
    let rowIndex = 1;
    
    exportDataGrid({
      worksheet: worksheet,
      component: this.dataGrid.instance,
      customizeCell: (options) => {
        const { gridCell, excelCell } = options;
        if (gridCell.rowType === 'data') {
          if (gridCell.column.cellTemplate == 'markWorkTimeTemplate') {
            excelCell.value = this.formatWorkTime(gridCell.value);
          }
          if (gridCell.column.cellTemplate == 'markTimeTemplate') {
            excelCell.value = this.formatTime(gridCell.value);
          }

          if (gridCell.column.cellTemplate === 'rowIndexTemplate') {
            excelCell.value = rowIndex++;
            excelCell.alignment = { horizontal: 'center' };
          }
        }
      },
    }).then(function () {
      workbook.xlsx.writeBuffer().then(function (buffer) {
        saveAs(
          new Blob([buffer], { type: 'application/octet-stream' }),
          `${workSheetName}.xlsx`
        );
      });
    });
  }

  formatTime(timeMark: TimeMark): string {
    if (timeMark && timeMark.hour !== null && timeMark.minute !== null) {
      return `${timeMark.hour.toString().padStart(2, '0')}:${timeMark.minute
        .toString()
        .padStart(2, '0')}`;
    } else {
      return '';
    }
  }

  formatWorkTime(workTime: WorkTime): string {
    if (workTime && workTime.start && workTime.end) {
      return `${this.formatTime(workTime.start)}-${this.formatTime(
        workTime.end
      )}`;
    } else {
      return '';
    }
  }

  calculateInMarkSortValue(data: Data) {
    const inMark = data.inMark;
    if (inMark && inMark.hour !== null && inMark.minute !== null) {
      return (
        inMark.hour.toString().padStart(2, '0') +
        inMark.minute.toString().padStart(2, '0')
      );
    }
    return '2359';
  }

  calculateOutMarkSortValue(data: Data) {
    const outMark = data.outMark;
    if (outMark && outMark.hour !== null && outMark.minute !== null) {
      return (
        outMark.hour.toString().padStart(2, '0') +
        outMark.minute.toString().padStart(2, '0')
      );
    }
    return '2359';
  }
}
