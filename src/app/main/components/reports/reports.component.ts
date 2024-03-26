import { AuthorizeService } from './../../../auth/services/authorize.service';
import { DateRange } from './../../../shared/components/date-range-box/date-range-box.component';
import {
  Component,
  ViewChild,
  OnInit,
  ChangeDetectorRef,
  AfterViewChecked,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { SubjectType } from '../../../models/timesheet.model';
import { DepartmentService } from '../../../services/department.service';
import { EmployeeService } from '../../../services/employee.service';
import {
  ReportsDataModel,
  SendDataReportModel,
} from '../../../models/report-employee.model';
import { ReportEmployeeService } from '../../../services/report-employee.service';
import CustomStore from 'devextreme/data/custom_store';
import { DxDataGridComponent } from 'devextreme-angular';
import { Workbook } from 'exceljs';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { saveAs } from 'file-saver';
import startOfDay from 'date-fns/startOfDay';
import { DepartmentModel } from 'src/app/models/department.model';
import { HttpCustom } from 'src/app/shared/http';
import DataSource from 'devextreme/data/data_source';
import subMinutes from 'date-fns/subMinutes';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { Router } from '@angular/router';
import { WpCustomValidators } from 'src/app/shared/validators/wp-custom-validators';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent implements OnInit, AfterViewChecked {
  @ViewChild('grid', { static: false }) grid: DxDataGridComponent;
  maxDate: Date = new Date();
  departments$: Observable<DepartmentModel[]>;
  days: any[] = [];
  allData: number = 0;
  statusReportLate: boolean = false;
  reportDescription = {
    late: this.localization.getSync('Опоздания'),
    early: this.localization.getSync('Ранний уход'),
    hoursWorked: this.localization.getSync('Отработанные часы'),
  };

  component: string;
  title: string;

  private readonly reportChooser = {
    late: (body: SendDataReportModel) => {
      return this.service.sendDataLate(body);
    },
    hoursWorked: (body: SendDataReportModel) => {
      return this.service.sendDataHouseWorked(body);
    },
    early: (body: SendDataReportModel) => {
      return this.service.sendDataEarly(body);
    },
  };
  dataSource: DataSource;
  employeeDataSource: DataSource;
  departmentsDataSource: DataSource;
  showDeletedEmployees = false;
  private readonly notDeletedFilter = ['isDeleted', '=', false];
  showCheckBox: boolean = true;

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
    private service: ReportEmployeeService,
    private http: HttpCustom,
    private auth: AuthorizeService,
    private localization: LocalizationService,
    private router: Router,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {
    for (const key in this.reportDescription) {
      if (window.location.pathname.includes(key)) {
        this.component = key;
        this.title = this.reportDescription[key];
        if (this.component === 'late') {
          this.statusReportLate = true;
        }
      }
    }
    this.employeeDataSource = new DataSource({
      store: http.createStore('id', this.employeeService.getAllEmployeeUrl()),
      sort: [{ selector: 'fullName', desc: false }],
      filter: this.notDeletedFilter,
    });
    this.departmentsDataSource = new DataSource({
      store: this.http.createStore(
        'id',
        this.departmentService.getAllDepartmentUrl(this.auth.currentOrganizationId)
      ),
      sort: [{ selector: 'name', desc: false }],
      pageSize: 20,
    });

    const dataStore = new CustomStore({
      key: 'employeeId',
      load: (loadOptions: any) => {
        if (!this.filterForm.valid) {
          return of({ data: [], totalCount: 0 }).toPromise();
        }
        loadOptions.skip = loadOptions.skip ?? 0;
        if (loadOptions.isLoadingAll) {
          loadOptions.take = <number>this.grid.instance.totalCount();
        } else {
          loadOptions.take = loadOptions.take ?? this.allData;
        }
        var formValue = this.filterForm.value;

        const subjects = formValue.departments
          .map((x) => {
            return { subjectId: x, subjectType: SubjectType.department };
          })
          .concat(
            formValue.employees.map((x) => {
              return { subjectId: x, subjectType: SubjectType.employee };
            })
          );
        const [start, end] = this.filterForm.controls.eventDate.value;
        const body: SendDataReportModel = {
          organizationId: this.auth.currentOrganizationId,
          start: subMinutes(start, start.getTimezoneOffset()).toISOString(),
          end: subMinutes(end, end.getTimezoneOffset()).toISOString(),
          take: loadOptions.take,
          skip: loadOptions.skip,
          subjects: subjects,
        };
        const report = this.reportChooser[this.component];
        return report(body)
          .pipe(
            map((x: { data: ReportsDataModel[]; totalCount: number }) => {
              if (x.totalCount > 0) {
                this.days = x.data[0].durationsPerDay;
              } else {
                this.days = [];
              }
              x.data.map((item) => {
                const durationsByDay = {};
                item.durationsPerDay.forEach((d) => {
                  durationsByDay[<any>d.date] = d;
                });
                (<any>item).durationsByDay = durationsByDay;
              });
              return x;
            })
          )
          .toPromise();
      },
    });
    this.dataSource = new DataSource(dataStore);
  }

  ngOnInit(): void {
    this.checkRoute();
  }

  checkRoute() {
    if (this.router.url.includes('/early')) {
      this.showCheckBox = false;
    }
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  loadData(): void {
    this.filterForm.markAllAsTouched();
    if (this.filterForm.valid) {
      this.grid.instance.refresh();
    }
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
    }
  }

  exportToExcel() {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(this.title);

    exportDataGrid({
      component: this.grid.instance,
      worksheet,
      autoFilterEnabled: true,
      customizeCell: ({ gridCell, excelCell }) => {
        if (gridCell.rowType === 'data') {
          if (gridCell.column.dataField === 'schedules') {
            excelCell.value = gridCell.value.map((x) => x.name).join(', ');
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
  }
}
