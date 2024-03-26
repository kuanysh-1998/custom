import {
  Component,
  ViewChild,
  OnInit,
  ChangeDetectorRef,
  AfterViewChecked,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { map } from 'rxjs/operators';
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
import { ReportHoursWorkedModel } from '../../../../models/reports.model';
import compareAsc from 'date-fns/compareAsc';
import { UtilsService } from '../../../../shared/services/utils.service';
import { ShortDateFormat } from 'src/app/shared/consts/date-format.const';
import { AuthorizeService } from 'src/app/auth/services/authorize.service';
import { WpCustomValidators } from 'src/app/shared/validators/wp-custom-validators';

@Component({
  selector: 'app-hours-worked',
  templateUrl: './hours-worked.component.html',
  styleUrls: ['./hours-worked.component.scss'],
})
export class HoursWorkedComponent implements OnInit, AfterViewChecked {
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;
  days: Set<string | Date>;
  employeeDataSource: DataSource;
  departmentsDataSource: DataSource;
  dataHoursWorked: ReportHoursWorkedModel[] = [];
  showDeletedEmployees = false;
  private readonly notDeletedFilter = ['isDeleted', '=', false];
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
    private reportsService: ReportsService,
    public utilsService: UtilsService,
    private authorizeService: AuthorizeService,
    private localization: LocalizationService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const today = startOfDay(new Date());
    const params = {
      start: format(today, ShortDateFormat),
      end: format(today, ShortDateFormat),
    };
    this.getReportHoursWorked(params);
    this.initDataSource();
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
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
          this.authorizeService.currentOrganizationId
        )
      ),
      sort: [{ selector: 'name', desc: false }],
      pageSize: 20,
    });
  }

  getReportHoursWorked(params: any) {
    this.dataGrid?.instance?.beginCustomLoading(null);
    this.reportsService
      .getReportHoursWorked(params)
      .pipe(
        map((x: { data: ReportHoursWorkedModel[] }) => {
          this.days = new Set<string>();
          if (x.data.length > 0) {
            for (let i = 0; i < x.data.length; i++) {
              const spans = x.data[i].spans;
              for (let j = 0; j < spans.length; j++) {
                const date = spans[j].date;
                this.days.add(date);
              }
            }
            const datesArray = Array.from(this.days);
            const sortedDatesArray = datesArray.sort((a, b) =>
              compareAsc(new Date(a), new Date(b))
            );
            this.days = new Set(sortedDatesArray);
          }
          x.data.map((item) => {
            const spans = {};
            item.spans.forEach((s) => {
              spans[<any>s.date] = s;
            });
            (<any>item).spans = spans;
          });
          return x;
        })
      )
      .subscribe((res) => {
        this.dataHoursWorked = res.data;
        this.dataGrid?.instance?.endCustomLoading();
      });
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
    };

    this.getReportHoursWorked(params);
  }

  exportToExcel() {
    const workSheetName = this.localization.getSync(
      'Отработанные часы по графику'
    );
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
          `${workSheetName}.xlsx`
        );
      });
    });
  }
}
