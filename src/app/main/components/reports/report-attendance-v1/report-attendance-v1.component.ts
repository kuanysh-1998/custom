import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  AfterViewChecked,
} from '@angular/core';
import { DepartmentService } from '../../../../services/department.service';
import { EmployeeService } from '../../../../services/employee.service';
import { FormBuilder } from '@angular/forms';
import { DxDataGridComponent } from 'devextreme-angular';
import { Workbook } from 'exceljs';
import saveAs from 'file-saver';
import { exportDataGrid } from 'devextreme/excel_exporter';
import startOfDay from 'date-fns/startOfDay';
import { HttpCustom } from 'src/app/shared/http';
import DataSource from 'devextreme/data/data_source';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { TranslateService } from '@ngx-translate/core';
import { format, isSameDay } from 'date-fns';
import { ReportsService } from '../../../../services/reports.service';
import { ReportAttendanceModel } from '../../../../models/reports.model';
import { ScreenSizeService } from 'src/app/shared/services/screen-size.service';
import { AuthorizeService } from 'src/app/auth/services/authorize.service';
import { WpCustomValidators } from 'src/app/shared/validators/wp-custom-validators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-report-attendance-v1',
  templateUrl: './report-attendance-v1.component.html',
  styleUrls: ['./report-attendance-v1.component.scss'],
})
export class ReportAttendanceV1Component implements OnInit, AfterViewChecked {
  @ViewChild('dataGrid') dataGrid: DxDataGridComponent;
  isMobile: boolean;
  isLargeScreen: boolean;

  employeeDataSource: DataSource;
  departmentsDataSource: DataSource;
  dataReportTable: ReportAttendanceModel[] = null;
  uniqueEventsDates: Set<string>;
  showDeleted = false;
  listСolumnsForSpanExist = ['workTimeDurationWithoutBreaks', 'presence'];

  errorMessageInDate = this.localization.getSync(
    'Период не должен превышать 31 день'
  );

  showTotalColumn: boolean = true;
  showPresenceTime: boolean = false;
  showPresenceLocation: boolean = false;

  columnList = [
    {
      id: 1,
      text: this.localization.getSync('Отработанные дни'),
      show: true,
    },
    {
      id: 2,
      text: this.localization.getSync('Отработанные часы'),
      show: true,
    },
    {
      id: 3,
      text: this.localization.getSync('Часы по графику'),
      show: true,
    },
    { id: 4, text: this.localization.getSync('Ранний приход'), show: true },
    { id: 5, text: this.localization.getSync('Поздний приход'), show: true },
    { id: 6, text: this.localization.getSync('Ранний уход'), show: true },
    { id: 7, text: this.localization.getSync('Поздний уход'), show: true },
    { id: 8, text: this.localization.getSync('Переработка'), show: true },
    { id: 9, text: this.localization.getSync('Недоработка'), show: true },
    { id: 10, text: this.localization.getSync('План'), show: true },
    {
      id: 11,
      text: this.localization.getSync('Присутствие. Время'),
      show: true,
    },
    {
      id: 12,
      text: this.localization.getSync('Присутствие. Локация'),
      show: true,
    },
  ];

  tooltip = [
    {
      id: 1,
      text: this.localization.getSync(
        'Количество дней, в которые были отметки и прихода, и ухода за выбранную дату или период'
      ),
    },
    {
      id: 2,
      text: this.localization.getSync(
        'Продолжительность времени от самой ранней отметки прихода до самой поздней отметки ухода за выбранную дату или период'
      ),
    },
    {
      id: 3,
      text: this.localization.getSync(
        'Продолжительность времени от самой ранней отметки прихода до самой поздней отметки ухода внутри графика работы за выбранную дату или период'
      ),
    },
    {
      id: 4,
      text: this.localization.getSync(
        'Продолжительность времени от фактического прихода до планируемого прихода'
      ),
    },
    {
      id: 5,
      text: this.localization.getSync(
        'Продолжительность времени от планируемого прихода до фактического прихода'
      ),
    },
    {
      id: 6,
      text: this.localization.getSync(
        'Продолжительность времени от фактического ухода до планируемого ухода'
      ),
    },
    {
      id: 7,
      text: this.localization.getSync(
        'Продолжительность времени от планируемого ухода до фактического ухода'
      ),
    },
    {
      id: 8,
      text: this.localization.getSync('Сумма раннего прихода и позднего ухода'),
    },
    {
      id: 9,
      text: this.localization.getSync('Сумма позднего прихода и раннего ухода'),
    },
    {
      id: 10,
      text: this.localization.getSync(
        'Время начала рабочего графика, время окончания рабочего графика и количество часов, требуемых отработать в графике работы'
      ),
    },
    {
      id: 11,
      text: this.localization.getSync(
        'Время отметок прихода, ухода, количество отработанных часов и количество отработанных часов внутри графика'
      ),
    },
    {
      id: 12,
      text: this.localization.getSync(
        'Локация отметок прихода, ухода, количество отработанных часов и количество отработанных часов внутри графика'
      ),
    },
  ];

  filterForm = this.fb.group({
    eventDate: this.fb.control<Date[]>(
      [startOfDay(new Date()), startOfDay(new Date())],
      [
        WpCustomValidators.dateRangeRequired(),
        WpCustomValidators.maxDayInterval(31, this.errorMessageInDate),
      ]
    ),
    departments: this.fb.control<Array<string>>([]),
    employees: this.fb.control<Array<string>>([]),
    locations: this.fb.control<Array<string>>([]),
    columnItem: this.fb.control<Array<number>>([]),
  });

  constructor(
    private departmentService: DepartmentService,
    private employeeService: EmployeeService,
    private reportsService: ReportsService,
    private localization: LocalizationService,
    private translateService: TranslateService,
    private http: HttpCustom,
    private auth: AuthorizeService,
    private fb: FormBuilder,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private screenSizeService: ScreenSizeService
  ) {}

  ngOnInit(): void {
    this.initDataSource();
    this.translateService.onLangChange
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.dataReportTable = null;
      });
    this.createReport();

    this.screenSizeService.isLargeScreen$.subscribe((isLargeScreen) => {
      this.isLargeScreen = isLargeScreen;
    });
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
      filter: ['isDeleted', '=', false],
    });
    this.departmentsDataSource = new DataSource({
      store: this.http.createStore(
        'id',
        this.departmentService.getAllDepartmentUrl(
          this.auth.currentOrganizationId
        )
      ),
      sort: [{ selector: 'name', desc: false }],
    });
  }

  createReport() {
    this.filterForm.markAllAsTouched();
    if (!this.filterForm.valid) {
      return;
    }

    this.dataGrid?.instance?.beginCustomLoading(null);
    const formValue = this.filterForm.value;
    const selectedColumnItems = new Set(formValue.columnItem);
    const [start, end] = this.filterForm.controls.eventDate.value;
    this.reportsService
      .getReportAttendance(
        start,
        end,
        formValue.employees,
        formValue.departments
      )
      .subscribe((response) => {
        this.dataGrid?.instance?.endCustomLoading();
        this.dataReportTable = response.data;

        this.uniqueEventsDates = new Set<string>();
        this.dataReportTable.forEach((item) => {
          if (item.spans == null || item.spans.length == 0) {
            return;
          }
          item.eventsReport = {};
          item.spans.forEach((span) => {
            item.eventsReport[span.date] = span;
            this.uniqueEventsDates.add(span.date);
          });
        });
        this.changeFilter(false);

        const nonSpecialItemSelected = this.columnList
          .filter((column) => ![10, 11, 12].includes(column.id))
          .some((column) => selectedColumnItems.has(column.id));

        this.showTotalColumn =
          nonSpecialItemSelected || selectedColumnItems.size === 0;

        this.showPresenceTime =
          formValue.columnItem.length === 0 ||
          formValue.columnItem.includes(11);
        this.showPresenceLocation =
          formValue.columnItem.length === 0 ||
          formValue.columnItem.includes(12);

        this.handleValueChange(formValue.columnItem);
      });
  }

  handleValueChange(value: any) {
    if (value.length > 0) {
      this.columnList.forEach((column) => {
        if (value.includes(column.id)) {
          column.show = true;
        } else {
          column.show = false;
        }
      });
    } else {
      this.columnList.forEach((column) => (column.show = true));
    }
  }

  // Todo
  checkDateEmployeeDeleted(row: any): boolean | null {
    if (!row.data.employeeIsDeleted && row.data.employeeDeletedOn === null) {
      return null;
    }
    const fieldDate =
      (row.column.dataField.match(/\d{4}-\d{2}-\d{2}/) || [])[0]?.split(
        'T'
      )[0] || false;
    if (
      fieldDate &&
      (isSameDay(new Date(fieldDate), new Date(row.data.employeeDeletedOn)) ||
        new Date(fieldDate) > new Date(row.data.employeeDeletedOn))
    ) {
      return true;
    }
  }

  minutesToHours(minutes: number | null, row: any): string | null {
    if (this.checkDateEmployeeDeleted(row)) {
      return this.localization.getSync('У');
    }
    if (
      this.listСolumnsForSpanExist.includes(this.getColumnName(row)) &&
      !this.checkEventSpanExistence(row)
    ) {
      return '-';
    }
    if (minutes !== null && typeof minutes === 'number') {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, '0')}:${mins
        .toString()
        .padStart(2, '0')}`;
    }
    if (row.column.dataType === 'date' && row.value) {
      return format(row.value, 'HH:mm');
    }
    return row.value;
  }

  formatMinutes(minutes: number | null, row: any): string | null {
    if (this.checkDateEmployeeDeleted(row)) {
      return this.localization.getSync('У');
    }
    if (!this.checkEventSpanExistence(row)) {
      return '-';
    }
    if (minutes !== null && typeof minutes === 'number') {
      minutes = Math.round(minutes);
      const leftMinutes = minutes % 60;
      const hours = (minutes - leftMinutes) / 60;
      return `${hours.toString().padStart(2, '0')}:${leftMinutes
        .toString()
        .padStart(2, '0')}`;
    }
    if (row.column.dataType === 'date' && row.value) {
      return format(row.value, 'HH:mm');
    }
    return row.value;
  }

  checkEventSpanExistence(row): boolean {
    const nameField = row.column.dataField;
    if (nameField.includes('.')) {
      const parts = nameField.split('.');
      const date = parts[1];
      if (row && row.data && row.data['eventsReport'][date]?.spanExist) {
        return row.data['eventsReport'][date].spanExist;
      } else {
        return false;
      }
    }
  }

  getColumnName(row): string {
    const nameField = row.column.dataField;
    if (nameField.includes('.')) {
      const parts = nameField.split('.');
      const name = parts[2];
      return name;
    }
  }

  exportToExcel(e?) {
    const workSheetName = this.localization.getSync('Табель посещаемости');
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(workSheetName);
    let rowIndex = 1;

    exportDataGrid({
      worksheet: worksheet,
      component: this.dataGrid.instance,
      customizeCell: (options) => {
        const { gridCell, excelCell } = options;
        if (gridCell.rowType === 'data') {
          if (gridCell.column.cellTemplate == 'minutesToHoursTemplate') {
            excelCell.value = this.minutesToHours(gridCell.value, gridCell);
          }
          if (gridCell.column.cellTemplate == 'minutesTemplate') {
            excelCell.value = this.formatMinutes(gridCell.value, gridCell);
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
    e.cancel = true;
  }

  changeFilter(condition: boolean = true) {
    if (this.showDeleted) {
      this.employeeDataSource = new DataSource({
        store: this.http.createStore(
          'id',
          this.employeeService.getAllEmployeeUrl()
        ),
        sort: [{ selector: 'fullName', desc: false }],
      });
    }
    if (!this.showDeleted && condition) {
      this.employeeDataSource.filter(['isDeleted', '=', false]);
      this.employeeDataSource.load();
      this.filterForm.get('employees').setValue([]);
    }
  }
}
