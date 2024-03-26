import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { format, parseISO, startOfDay } from 'date-fns';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { Workbook } from 'exceljs';
import saveAs from 'file-saver';
import { map } from 'rxjs/operators';
import { AuthorizeService } from 'src/app/auth/services/authorize.service';
import { ReportViolationsModel } from 'src/app/models/reports.model';
import { DepartmentService } from 'src/app/services/department.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { ReportsService } from 'src/app/services/reports.service';
import { ScheduleAPIService } from 'src/app/services/schedule-api.service';
import { ShortDateFormat } from 'src/app/shared/consts/date-format.const';
import { HttpCustom } from 'src/app/shared/http';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { ScreenSizeService } from 'src/app/shared/services/screen-size.service';
import { WpCustomValidators } from 'src/app/shared/validators/wp-custom-validators';

@UntilDestroy()
@Component({
  selector: 'wp-report-violations',
  templateUrl: './report-violations.component.html',
  styleUrls: ['./report-violations.component.scss'],
})
export class ReportViolationsComponent implements OnInit {
  @ViewChild('dataGrid') dataGrid: DxDataGridComponent;
  departmentsDataSource: DataSource;
  employeesDataSource: DataSource;
  schedulesDataSource: DataSource;
  dataReportVialationsTable: ReportViolationsModel[] = null;

  showDeletedEmployees = false;
  maxDate: Date = new Date();
  isLargeScreen: boolean;
  maxViolationsCount: number = 0;

  filterForm = this.fb.group({
    eventDate: this.fb.control<Date[]>(
      [startOfDay(new Date()), startOfDay(new Date())],
      [WpCustomValidators.dateRangeRequired()]
    ),
    departments: this.fb.control<Array<string>>([]),
    employees: this.fb.control<Array<string>>([]),
    schedules: this.fb.control<Array<string>>([]),
  });

  constructor(
    private fb: FormBuilder,
    private httpCustom: HttpCustom,
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private authorizeService: AuthorizeService,
    private scheduleAPIService: ScheduleAPIService,
    private screenSizeService: ScreenSizeService,
    private localization: LocalizationService,
    private reportsService: ReportsService
  ) {}

  ngOnInit(): void {
    this.initDepartmentsDataSource();
    this.initEmployeesDataSource();
    this.initSchedulesDataSource();

    this.createReport();

    this.screenSizeService.isLargeScreen$
      .pipe(untilDestroyed(this))
      .subscribe((isLargeScreen) => {
        this.isLargeScreen = isLargeScreen;
      });
  }

  createReport() {
    this.filterForm.markAllAsTouched();
    if (!this.filterForm.valid) {
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
      scheduleIds: formValue.schedules,
    };
    this.reportsService
      .getViolationsReport(params)
      .pipe(
        untilDestroyed(this),
        map((violationReports) => {
          return violationReports.data.map((report) => {
            return {
              ...report,
              violations: this.getViolationTexts(report),
            };
          });
        })
      )
      .subscribe((processedViolationReports) => {
        this.dataGrid?.instance?.endCustomLoading();
        this.dataReportVialationsTable = processedViolationReports;

        this.changeFilter();
      });
  }

  getViolationTypeCode(span) {
    if (span.inMarkId === null && span.outMarkId === null) {
      return 'absence';
    } else if (span.inMarkId === null && span.outMarkId !== null) {
      return 'no-in';
    } else if (span.inMarkId !== null && span.outMarkId === null) {
      return 'no-out';
    } else if (span.lateIn > 0) {
      return 'late';
    }

    return 'none';
  }

  getViolationTexts(report: ReportViolationsModel): any[] {
    return report.spans
      .map((span) => {
        const formatTime = (isoString) => {
          if (!isoString) return '';
          return format(parseISO(isoString), 'HH:mm');
        };

        let violationTypeCode = this.getViolationTypeCode(span);

        let violationText = '';
        let violationType = '';

        switch (violationTypeCode) {
          case 'absence':
            violationText = 'Отсутствие';
            violationType = 'absence';
            break;
          case 'no-in':
            violationText = `Нет прихода - ${formatTime(span.lastOut)}`;
            violationType = 'no-in';
            break;
          case 'no-out':
            violationText = `${formatTime(span.earlyIn)} - Нет ухода`;
            violationType = 'no-out';
            break;
          case 'late':
            violationText = `${formatTime(span.earlyIn)} - ${formatTime(
              span.lastOut
            )}`;
            violationType = 'late';
            break;
          case 'none':
            return null;
        }

        return { date: span.date, violationText, violationType };
      })
      .filter((v) => v != null);
  }

  initEmployeesDataSource() {
    this.employeesDataSource = new DataSource({
      store: this.httpCustom.createStore(
        'id',
        this.employeeService.getAllEmployeeUrl()
      ),
      sort: [{ selector: 'fullName', desc: false }],
      filter: ['isDeleted', '=', false],
    });
  }

  initDepartmentsDataSource() {
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

  initSchedulesDataSource() {
    const dataStore = this.httpCustom.createStore(
      'id',
      this.scheduleAPIService.getScheduleURL()
    );

    this.schedulesDataSource = new DataSource({
      store: dataStore,
      sort: [{ selector: 'name', desc: false }],
      filter: ['status', '=', 1],
    });
  }

  changeFilter() {
    if (this.showDeletedEmployees) {
      this.employeesDataSource = new DataSource({
        store: this.httpCustom.createStore(
          'id',
          this.employeeService.getAllEmployeeUrl()
        ),
        sort: [{ selector: 'fullName', desc: false }],
      });
    }
    if (!this.showDeletedEmployees) {
      this.employeesDataSource.filter(['isDeleted', '=', false]);
      this.employeesDataSource.load();
      this.filterForm.get('employees').setValue([]);
    }
  }

  exportToExcel(e?) {
    const workbook = new Workbook();
    const worksheet = this.setupWorksheet(workbook);

    const gridSortInfo = this.dataGrid.instance.getDataSource().sort();
    let dataForExport = [...this.dataReportVialationsTable];

    if (Array.isArray(gridSortInfo)) {
      dataForExport.sort((a, b) => {
        for (const sortDescriptor of gridSortInfo) {
          if (
            typeof sortDescriptor !== 'string' &&
            'selector' in sortDescriptor &&
            'desc' in sortDescriptor
          ) {
            const selector = sortDescriptor.selector;
            const desc = sortDescriptor.desc;
            const valueA =
              typeof selector === 'function' ? selector(a) : a[selector];
            const valueB =
              typeof selector === 'function' ? selector(b) : b[selector];
            const sortOrder = desc ? -1 : 1;

            if (valueA < valueB) return -1 * sortOrder;
            if (valueA > valueB) return 1 * sortOrder;
          }
        }
        return 0;
      });
    }

    this.populateData(worksheet, dataForExport);
    this.generateAndDownloadExcel(workbook);

    if (e) e.cancel = true;
  }

  setupWorksheet(workbook) {
    const workSheetName = this.localization.getSync('Список нарушений');
    const worksheet = workbook.addWorksheet(workSheetName);

    const headers = [
      '№',
      this.localization.getSync('Сотрудник'),
      this.localization.getSync('Отдел'),
      this.localization.getSync('График работы'),
    ];
    for (let i = 0; i < this.maxViolationsCount; i++) {
      headers.push(`${i + 1}`);
    }
    headers.push(
      this.localization.getSync('Отсутствия: всего'),
      this.localization.getSync('Опоздания: всего'),
      this.localization.getSync('Нет прихода/ухода: всего')
    );

    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell, number) => {
      cell.font = { bold: true };
      cell.alignment = {
        horizontal:
          number === 5 && this.maxViolationsCount > 1 ? 'center' : 'left',
      };

      let fillColor = null;
      switch (cell.value) {
        case this.localization.getSync('Отсутствия: всего'):
          fillColor = 'FFFFDBB1';
          break;
        case this.localization.getSync('Опоздания: всего'):
          fillColor = 'FFF2F2F2';
          break;
        case this.localization.getSync('Нет прихода/ухода: всего'):
          fillColor = 'FFFFF0B3';
          break;
      }

      if (fillColor) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: fillColor },
        };
      }
    });

    worksheet.columns.forEach((column, index) => {
      if (index === 0) {
        column.width = 10;
      } else {
        column.width = 25;
      }
    });

    let startMergeColumn = 5;
    let endMergeColumn = 4 + this.maxViolationsCount;

    worksheet.mergeCells(1, startMergeColumn, 1, endMergeColumn);
    worksheet.getCell(1, startMergeColumn).value =
      this.localization.getSync('Нарушения');

    return worksheet;
  }

  populateData(worksheet, dataForExport) {
    let rowIndex = 2;

    dataForExport.forEach((rowData, index) => {
      const employeeName = rowData.employeeIsDeleted
        ? `${rowData.employeeName} ${this.localization.getSync('(Удалён)')} `
        : rowData.employeeName;
      const rowValues = [
        rowIndex - 1,
        employeeName,
        rowData.departmentName,
        rowData.scheduleName,
      ];

      for (let i = 0; i < this.maxViolationsCount; i++) {
        if (i < rowData.violations.length) {
          const violation = rowData.violations[i];
          rowValues.push(`${violation.date}\n${violation.violationText}`);
        } else {
          rowValues.push('');
        }
      }

      rowValues.push(
        `${rowData.absenceTotal}`,
        `${rowData.lateTotal}`,
        `${rowData.inOutAbsenceTotal}`
      );

      const newRow = worksheet.addRow(rowValues);

      const numberCell = newRow.getCell(1); 
      numberCell.alignment = { horizontal: 'left' };

      for (let i = 0; i < this.maxViolationsCount; i++) {
        const cell = newRow.getCell(i + 5);
        cell.alignment = { wrapText: true, vertical: 'top' };

        if (i < rowData.violations.length) {
          const violationType = rowData.violations[i].violationType;
          let fillColor = null;
          switch (violationType) {
            case 'absence':
              fillColor = 'FFFFDBB1';
              break;
            case 'late':
              fillColor = 'FFF2F2F2';
              break;
            case 'no-in':
            case 'no-out':
              fillColor = 'FFFFF0B3';
              break;
          }
          if (fillColor) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: fillColor },
            };
          }
        }
      }

      rowIndex++;
    });
  }

  generateAndDownloadExcel(workbook) {
    workbook.xlsx.writeBuffer().then((buffer) => {
      const workSheetName = this.localization.getSync('Список нарушений');
      saveAs(
        new Blob([buffer], { type: 'application/octet-stream' }),
        `${workSheetName}.xlsx`
      );
    });
  }

  customSort(a, b) {
    const order = (str) => {
      if (str.toString().match(/^\d/)) return 1;
      if (str.toString().match(/^[A-Za-z]/)) return 2;
      return 3;
    };

    const orderA = order(a.employeeName);
    const orderB = order(b.employeeName);

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return a.employeeName.localeCompare(b.employeeName, 'ru', {
      numeric: true,
    });
  }

  onContentReady(e) {
    const currentPageData = e.component.getVisibleRows().map((row) => row.data);

    this.maxViolationsCount = this.getMaxViolationsCount(currentPageData);
  }

  getMaxViolationsCount(data: ReportViolationsModel[]): number {
    return data.reduce((max, item) => Math.max(max, item.spans.length), 0);
  }

  getEmptyCellsForGrid(length: number): void[] {
    return Array(Math.max(0, length));
  }

  calculateContainerWidth(violationsCount: number): string {
    const columnWidth = 170;
    const totalWidth = violationsCount * columnWidth;
    return `${totalWidth}px`;
  }
}
