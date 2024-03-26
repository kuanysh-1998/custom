import { AuthorizeService } from './../../../../auth/services/authorize.service';
import {
  Component,
  OnInit,
  ViewChild,
  Input,
  ChangeDetectorRef,
  AfterViewChecked,
} from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import { Workbook } from 'exceljs';
import saveAs from 'file-saver';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { ReportEmployeeService } from '../../../../services/report-employee.service';
import { ReportActualHoursWorkedModel } from '../../../../models/report-employee.model';
import { FormBuilder, Validators } from '@angular/forms';
import { DepartmentService } from '../../../../services/department.service';
import { EmployeeService } from '../../../../services/employee.service';
import startOfDay from 'date-fns/startOfDay';
import { HttpCustom } from 'src/app/shared/http';
import DataSource from 'devextreme/data/data_source';
import format from 'date-fns/format';
import { LocalizationService } from '../../../../shared/services/localization.service';
import { ShortDateFormat } from 'src/app/shared/consts/date-format.const';
import { WpCustomValidators } from 'src/app/shared/validators/wp-custom-validators';

@Component({
  selector: 'app-actual-hours-worked',
  templateUrl: './actual-hours-worked.component.html',
  styleUrls: ['./actual-hours-worked.component.scss'],
})
export class ActualHoursWorkedComponent implements OnInit, AfterViewChecked {
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;
  @Input() title: string;
  dataActualHoursWorked: ReportActualHoursWorkedModel[] = [];
  expanded: boolean = true;
  searchValue: string;
  employeeDataSource: DataSource;
  departmentsDataSource: DataSource;
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
    private reportEmployeeService: ReportEmployeeService,
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private employeeService: EmployeeService,
    private http: HttpCustom,
    private auth: AuthorizeService,
    private localization: LocalizationService,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {    
    this.employeeDataSource = new DataSource({
      store: this.http.createStore(
        'id',
        this.employeeService.getAllEmployeeUrl()
      ),
      sort: [{ selector: 'fullName', desc: false }],
      filter: this.notDeletedFilter,
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

  ngOnInit() {
    this.getReportActualHoursWorked(this.auth.currentOrganizationId);
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  changeFilter() {
    if (this.showDeletedEmployees) {
      this.employeeDataSource = new DataSource({
        store: this.http.createStore(
          'id',
          this.employeeService.getAllEmployeeUrl()
        ),
        sort: [{ selector: 'fullName', desc: false }],
      });
    } else {
      this.employeeDataSource.filter(this.notDeletedFilter);
      this.employeeDataSource.load();
    }
  }

  getReportActualHoursWorked(organizationId, params?) {
    this.dataGrid?.instance?.beginCustomLoading(null);
    this.reportEmployeeService
      .getReportActualHoursWorked(organizationId, params)
      .subscribe((res) => {
        this.dataActualHoursWorked = res.data;
        this.dataGrid?.instance?.endCustomLoading();
      });
  }

  exportToExcel() {
    const workSheetName = this.localization.getSync(
      'Фактически отработанные часы'
    );
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(workSheetName);
    exportDataGrid({
      worksheet: worksheet,
      component: this.dataGrid.instance,
      customizeCell: (options) => {
        const { gridCell, excelCell } = options;
        if (gridCell.rowType === 'data') {
          if (gridCell.column.cellTemplate == 'minutesTemplate') {
            excelCell.value = this.formatMinutes(gridCell.value);
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
    };
    params['departmentsId'] = filterFormValue.departments;
    params['employeesId'] = filterFormValue.employees;
    this.getReportActualHoursWorked(this.auth.currentOrganizationId, params);
  }

  formatMinutes(minutes: number | null): string | null {
    if (minutes == null) {
      return null;
    }
    minutes = Math.round(minutes);
    const leftMinutes = minutes % 60;
    const hours = (minutes - leftMinutes) / 60;
    return `${hours.toString().padStart(2, '0')}:${leftMinutes
      .toString()
      .padStart(2, '0')}`;
  }
}
