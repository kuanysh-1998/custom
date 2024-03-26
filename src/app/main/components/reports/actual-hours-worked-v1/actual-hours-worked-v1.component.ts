import {
  Component,
  OnInit,
  ViewChild,
  Input,
  AfterViewChecked,
  ChangeDetectorRef,
} from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import { Workbook } from 'exceljs';
import saveAs from 'file-saver';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { ReportActualHoursWorkedModel } from '../../../../models/reports.model';
import { Observable } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { DepartmentService } from '../../../../services/department.service';
import { DepartmentModel } from '../../../../models/department.model';
import { EmployeeService } from '../../../../services/employee.service';
import startOfDay from 'date-fns/startOfDay';
import format from 'date-fns/format';
import { LocalizationService } from '../../../../shared/services/localization.service';
import { ReportsService } from '../../../../services/reports.service';
import DataSource from 'devextreme/data/data_source';
import { HttpCustom } from '../../../../shared/http';
import { UtilsService } from '../../../../shared/services/utils.service';
import { ShortDateFormat } from 'src/app/shared/consts/date-format.const';
import { EmployeeModel } from 'src/app/models/employee.model';
import { AuthorizeService } from 'src/app/auth/services/authorize.service';
import { WpCustomValidators } from 'src/app/shared/validators/wp-custom-validators';
import { DropdownComponent } from 'src/app/shared/wk-components/lib/dropdown/dropdown.component';

@Component({
  selector: 'app-actual-hours-worked-v1',
  templateUrl: './actual-hours-worked-v1.component.html',
  styleUrls: ['./actual-hours-worked-v1.component.scss'],
})
export class ActualHoursWorkedV1Component implements OnInit, AfterViewChecked {
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;
  @ViewChild(DropdownComponent) dropdownComponent: DropdownComponent;

  @Input() title: string;

  dataActualHoursWorked: ReportActualHoursWorkedModel[] = [];
  expanded: boolean = true;
  searchValue: string;
  departments$: Observable<DepartmentModel[]>;
  employees$: Observable<EmployeeModel[]>;
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
    private reportsService: ReportsService,
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private employeeService: EmployeeService,
    private localization: LocalizationService,
    private http: HttpCustom,
    private authorizeService: AuthorizeService,
    public utilsService: UtilsService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const today = startOfDay(new Date());
    const params = {
      start: format(today, ShortDateFormat),
      end: format(today, ShortDateFormat),
    };
    this.getReportActualHoursWorked(params);
    this.employeeDataSource = new DataSource({
      store: this.http.createStore(
        'id',
        this.employeeService.getAllEmployeeUrl()
      ),
      sort: [{ selector: 'fullName', desc: false }],
      filter: [this.notDeletedFilter],
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

  loadMoreData() {
    const currentPage = this.departmentsDataSource.pageIndex();
    this.departmentsDataSource.pageIndex(currentPage + 1);
    this.departmentsDataSource.load().then((data) => {
      // Теперь у вас есть доступ к методам dropdownComponent
      this.dropdownComponent.updateOptions(data);
    });
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

  getReportActualHoursWorked(params?: any) {
    this.dataGrid?.instance?.beginCustomLoading(null);
    this.reportsService.getReportActualHoursWorked(params).subscribe((res) => {
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
    let rowIndex = 1;

    exportDataGrid({
      worksheet: worksheet,
      component: this.dataGrid.instance,
      customizeCell: (options) => {
        const { gridCell, excelCell } = options;
        if (gridCell.rowType === 'header') {
          excelCell.alignment = { horizontal: 'left' };
        } else if (gridCell.rowType === 'data') {
          if (gridCell.column.cellTemplate == 'minutesTemplate') {
            excelCell.value = this.utilsService.formatMinutes(gridCell.value);
          }
          if (gridCell.column.cellTemplate === 'rowIndexTemplate') {
            excelCell.value = rowIndex++;
            excelCell.alignment = { horizontal: 'left' };
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

    const [start, end] = this.filterForm.controls.eventDate.value;
    const filterFormValue = this.filterForm.value;
    const params = {
      start: format(start, ShortDateFormat),
      end: format(end, ShortDateFormat),
      employeesId: filterFormValue.employees,
      departmentsId: filterFormValue.departments,
    };

    this.getReportActualHoursWorked(params);
  }
}
