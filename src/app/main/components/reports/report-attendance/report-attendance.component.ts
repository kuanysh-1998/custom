import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DepartmentService } from '../../../../services/department.service';
import { EmployeeService } from '../../../../services/employee.service';
import { Observable } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { DxDataGridComponent } from 'devextreme-angular';
import { Workbook } from 'exceljs';
import saveAs from 'file-saver';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { ReportEmployeeService } from '../../../../services/report-employee.service';
import startOfDay from 'date-fns/startOfDay';
import { HttpCustom } from 'src/app/shared/http';
import DataSource from 'devextreme/data/data_source';
import { AuthorizeService } from 'src/app/auth/services/authorize.service';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { LocationModel } from '../../../../models/location.model';
import { TranslateService } from '@ngx-translate/core';
import { format, isSameDay } from 'date-fns';
import { ScreenSizeService } from 'src/app/shared/services/screen-size.service';
import { WpCustomValidators } from 'src/app/shared/validators/wp-custom-validators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-report-attendance',
  templateUrl: './report-attendance.component.html',
  styleUrls: ['./report-attendance.component.scss'],
})
export class ReportAttendanceComponent implements OnInit, AfterViewChecked {
  @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

  departmentsDataSource: DataSource;
  employeeDataSource: DataSource;
  dataReportTable: any[] = [];
  initialStateDataReportTable: any[] = [];
  uniqueEventsDates: Set<string>;
  locations$: Observable<LocationModel[]>;
  showDeleted = false;
  isLargeScreen: boolean;

  listColumnsNoMinutes = [
    'plannedEventDateIn',
    'plannedEventDateOut',
    'plannedWorkedTimeInMinutes',
    'eventDateIn',
    'locationNameIn',
    'eventDateOut',
    'locationNameOut',
  ];

  errorMessageInDate = this.localization.getSync(
    'Период не должен превышать 31 день'
  );

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
    { id: 11, text: this.localization.getSync('Присутствие'), show: true },
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
        'Время и локация отметок прихода, ухода, количество отработанных часов и количество отработанных часов внутри графика'
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
    columnItem: this.fb.control<Array<string>>([]),
  });

  constructor(
    private departmentService: DepartmentService,
    private employeeService: EmployeeService,
    private reportEmployeeService: ReportEmployeeService,
    private auth: AuthorizeService,
    private localization: LocalizationService,
    private translateService: TranslateService,
    private http: HttpCustom,
    private fb: FormBuilder,
    private screenSizeService: ScreenSizeService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {
    this.employeeDataSource = new DataSource({
      store: http.createStore('id', this.employeeService.getAllEmployeeUrl()),
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
      pageSize: 20,
    });
  }

  ngOnInit(): void {
    this.translateService.onLangChange
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.dataReportTable = [];
      });
    // this.locations$ = this.locationService
    //   .getAllLocation(this.auth.currentOrganizationId)
    //   .pipe(map((x) => x.sort((a, b) => a.name.localeCompare(b.name))));

    this.createReport();

    this.screenSizeService.isLargeScreen$.subscribe((isLargeScreen) => {
      this.isLargeScreen = isLargeScreen;
    });
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  createReport() {
    this.filterForm.markAllAsTouched();
    if (!this.filterForm.valid) {
      return;
    }

    this.dataGrid?.instance?.beginCustomLoading(null);
    const formValue = this.filterForm.value;
    const [start, end] = this.filterForm.controls.eventDate.value;
    this.reportEmployeeService
      .getInOutPairedExtended(
        this.auth.currentOrganizationId,
        start,
        end,
        formValue.employees,
        formValue.departments,
        formValue.locations
      )
      .subscribe((response) => {
        this.dataGrid?.instance?.endCustomLoading();
        this.dataReportTable = response;
        for (let i = 0; i < this.dataReportTable.length; i++) {
          let employee = this.dataReportTable[i].employee;
          for (let prop in employee) {
            if (employee.hasOwnProperty(prop)) {
              this.dataReportTable[i][prop] = employee[prop];
            }
          }
        }
        this.uniqueEventsDates = new Set<string>();
        this.dataReportTable.forEach((item) => {
          if (item.report == null || item.report.length == 0) {
            return;
          }
          item.eventsReport = {};
          item.report.forEach((event) => {
            item.eventsReport[event.eventDate] = event;
            this.uniqueEventsDates.add(event.eventDate);
          });
        });
        this.initialStateDataReportTable = this.dataReportTable;
        this.changeFilter(false);
        this.handleValueChange(formValue.columnItem);
      });
  }

  checkEmployeeDeletedDate(data): boolean | string {
    const fieldDate =
      (data.column.dataField.match(/\d{4}-\d{2}-\d{2}/) || [])[0]?.split(
        'T'
      )[0] || false;
    if (
      fieldDate &&
      (isSameDay(new Date(fieldDate), new Date(data.data.deletedOn)) ||
        new Date(fieldDate) > new Date(data.data.deletedOn))
    ) {
      return true;
    }
  }

  minutesToHours(minutes: number | null, data: any): string | null {
    if (data.data.isDeleted && data.data.deletedOn !== null) {
      if (this.checkEmployeeDeletedDate(data)) {
        return this.localization.getSync('У');
      }
    }
    if (minutes !== null && typeof minutes === 'number') {
      minutes = Math.round(minutes);
      return (Math.round((<number>minutes * 100) / 60.0) / 100).toFixed(2);
    }
    return data.value;
  }

  formatMinutes(minutes: number | null, data: any): string | null {
    if (data.data.isDeleted && data.data.deletedOn !== null) {
      if (this.checkEmployeeDeletedDate(data)) {
        return this.localization.getSync('У');
      }
      if (data.column.dataType === 'date' && data.value) {
        return format(data.value, 'HH:mm');
      }
    }
    if (
      !data.data.isDeleted &&
      data.data.deletedOn === null &&
      this.listColumnsNoMinutes.some((str) =>
        data.column.dataField.includes(str)
      )
    ) {
      if (data.column.dataType === 'date' && data.value) {
        return format(data.value, 'HH:mm');
      }
    }
    if (minutes !== null && typeof minutes === 'number') {
      minutes = Math.round(minutes);
      const leftMinutes = minutes % 60;
      const hours = (minutes - leftMinutes) / 60;
      return `${hours.toString().padStart(2, '0')}:${leftMinutes
        .toString()
        .padStart(2, '0')}`;
    }
    return data.value;
  }

  exportToExcel(e?) {
    const workSheetName = this.localization.getSync('Табель посещаемости');
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(workSheetName);

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
      this.dataReportTable = this.initialStateDataReportTable;
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
      this.dataReportTable = this.initialStateDataReportTable.filter(
        (item) => item.isDeleted === false
      );
    }
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
}
