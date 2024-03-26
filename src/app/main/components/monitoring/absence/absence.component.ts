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
import { format } from 'date-fns';
import { DepartmentService } from '../../../../services/department.service';
import { EmployeeService } from '../../../../services/employee.service';
import DataSource from 'devextreme/data/data_source';
import { HttpCustom } from '../../../../shared/http';
import { LocalizationService } from '../../../../shared/services/localization.service';
import { first } from 'rxjs/operators';
import { MonitoringService } from '../../../../services/monitoring.service';
import {
  ReportDataAbsenceModel,
  ReportAbsenceModel,
} from '../../../../models/monitoring.model';
import { AuthorizeService } from 'src/app/auth/services/authorize.service';
import { WpCustomValidators } from 'src/app/shared/validators/wp-custom-validators';

@Component({
  selector: 'app-absence',
  templateUrl: './absence.component.html',
  styleUrls: ['./absence.component.scss'],
})
export class AbsenceComponent implements OnInit, AfterViewChecked {
  dataAbsenceReport: ReportAbsenceModel[] = [];
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
    private monitoringService: MonitoringService,
    private http: HttpCustom,
    private authorizeService: AuthorizeService,
    private localization: LocalizationService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initDataSource();
    const today = startOfDay(new Date());
    this.filterForm = this.fb.group({
      date: new FormControl(today, [
        WpCustomValidators.dateRequired('Выберите дату'),
      ]),
      departments: new FormControl([]),
      employees: new FormControl([]),
    });
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
      filter: ['isDeleted', '=', false],
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

  createReport() {
    this.filterForm.markAllAsTouched();
    if (!this.filterForm.valid) {
      return;
    }
    const filterFormValue = this.filterForm.value;
    const params = {
      date: format(filterFormValue.date, 'yyyy-MM-dd'),
      employeesId: filterFormValue.employees,
      departmentsId: filterFormValue.departments,
    };
    this.monitoringService
      .getReportAbsence(params)
      .pipe(first())
      .subscribe((res: ReportDataAbsenceModel) => {
        this.dataAbsenceReport = res.data;
      });
  }

  exportToExcel(e) {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(this.title);
    let rowIndex = 1;
    exportDataGrid({
      component: this.grid.instance,
      worksheet,
      autoFilterEnabled: true,
      customizeCell: ({ gridCell, excelCell }) => {
        if (gridCell.rowType === 'header') {
          excelCell.alignment = { horizontal: 'left' };
        } else if (gridCell.rowType === 'data') {
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
          `${this.title}.xlsx`
        );
      });
    });
    e.cancel = true;
  }
}
