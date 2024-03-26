import {
  Component,
  ViewChild,
  OnInit,
  AfterViewChecked,
  ChangeDetectorRef,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DxDataGridComponent } from 'devextreme-angular';
import { Workbook } from 'exceljs';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { saveAs } from 'file-saver';
import startOfDay from 'date-fns/startOfDay';
import { StatisticsAnalyticsService } from 'src/app/services/statistics-analytics';
import { format } from 'date-fns';
import { AbsenceReportModel } from '../../../../models/statistics-analytics.model';
import { DepartmentService } from '../../../../services/department.service';
import { AuthorizeService } from '../../../../auth/services/authorize.service';
import { EmployeeService } from '../../../../services/employee.service';
import DataSource from 'devextreme/data/data_source';
import { HttpCustom } from '../../../../shared/http';
import { LocalizationService } from '../../../../shared/services/localization.service';
import { WpCustomValidators } from 'src/app/shared/validators/wp-custom-validators';

@Component({
  selector: 'app-absence-report',
  templateUrl: './absence-report.component.html',
  styleUrls: ['./absence-report.component.scss'],
})
export class AbsenceReportComponent implements OnInit, AfterViewChecked {
  dataAbsenceReport: AbsenceReportModel[] = [];
  employeeDataSource: DataSource;
  departmentsDataSource: DataSource;

  title: string = this.localization.getSync('Отсутствия');
  @ViewChild('grid', { static: false }) grid: DxDataGridComponent;
  filterForm: FormGroup;
  maxDate: Date = new Date();

  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private employeeService: EmployeeService,
    private statisticsAnalyticsService: StatisticsAnalyticsService,
    private auth: AuthorizeService,
    private http: HttpCustom,
    private localization: LocalizationService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.auth.currentOrganizationId) {
      this.getAbsenceReport(this.auth.currentOrganizationId);
      this.employeeDataSource = new DataSource({
        store: this.http.createStore(
          'id',
          this.employeeService.getAllEmployeeUrl()
        ),
        sort: [{ selector: 'fullName', desc: false }],
        filter: ['isDeleted', '=', false],
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

    const today = startOfDay(new Date());
    this.filterForm = this.fb.group({
      date: new FormControl(
        today,
        WpCustomValidators.dateRequired('Выберите дату')
      ),
      departments: new FormControl([]),
      employees: new FormControl([]),
    });
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  getAbsenceReport(organizationId, params?) {
    this.statisticsAnalyticsService
      .getListAbsenceReport(organizationId, params)
      .subscribe((res: AbsenceReportModel[]) => {
        this.dataAbsenceReport = res;
      });
  }

  createReport() {
    this.filterForm.markAllAsTouched();
    if (!this.filterForm.valid) {
      return;
    }
    const filterFormValue = this.filterForm.value;
    const params = {
      date: format(filterFormValue.date, 'MM/dd/yyyy'),
      departmentsId: filterFormValue.departments,
      employeesId: filterFormValue.employees,
    };

    this.getAbsenceReport(this.auth.currentOrganizationId, params);
  }

  exportToExcel(e) {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(this.title);

    exportDataGrid({
      component: this.grid.instance,
      worksheet,
      autoFilterEnabled: true,
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
}
