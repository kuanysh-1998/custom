import {
  Component,
  ViewChild,
  OnInit,
  ChangeDetectorRef,
  AfterViewChecked,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { DepartmentService } from '../../../services/department.service';
import { UserModel } from '../../../models/UserModel';
import { DxDataGridComponent } from 'devextreme-angular';
import { Workbook } from 'exceljs';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { saveAs } from 'file-saver';
import startOfDay from 'date-fns/startOfDay';
import { DepartmentModel } from 'src/app/models/department.model';
import { StatisticsAnalyticsService } from 'src/app/services/statistics-analytics';
import { LatecomersModel } from '../../../models/statistics-analytics.model';
import { format } from 'date-fns';
import { AuthorizeService } from '../../../auth/services/authorize.service';
import { LocationService } from '../../../services/location.service';
import { LocalizationService } from '../../../shared/services/localization.service';
import DataSource from 'devextreme/data/data_source';
import { HttpCustom } from 'src/app/shared/http';
import { WpCustomValidators } from 'src/app/shared/validators/wp-custom-validators';

@Component({
  selector: 'app-list-latecomers',
  templateUrl: './list-latecomers.component.html',
  styleUrls: ['./list-latecomers.component.scss'],
})
export class ListLatecomersComponent implements OnInit, AfterViewChecked {
  areUserLoadedSub: Subscription;
  currentUserSub: Subscription;
  subscription = new Subscription();
  departmentsDataSource: DataSource;
  user: UserModel;
  locationsDataSource: DataSource;
  dataLatecomers: LatecomersModel[] = [];
  maxDate: Date = new Date();
  title: string = this.localization.getSync('Опоздания');
  @ViewChild('grid', { static: false }) grid: DxDataGridComponent;

  department$: Observable<DepartmentModel[]>;
  filterForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private locationService: LocationService,
    private statisticsAnalyticsService: StatisticsAnalyticsService,
    private auth: AuthorizeService,
    private localization: LocalizationService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private http: HttpCustom
  ) {
    this.initDataSource();
  }

  ngOnInit(): void {
    if (this.auth.currentOrganizationId) {
      this.getLatecomers(this.auth.currentOrganizationId);
    }

    this.filterForm = this.fb.group({
      eventDate: this.fb.control<Date[]>(
        [startOfDay(new Date()), startOfDay(new Date())],
        [WpCustomValidators.dateRangeRequired()]
      ),
      departments: new FormControl([]),
      locations: new FormControl([]),
    });
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  getLatecomers(organizationId, params?) {
    this.statisticsAnalyticsService
      .getListLatecomers(organizationId, params)
      .subscribe((res: LatecomersModel[]) => {
        this.dataLatecomers = res;
      });
  }

  initDataSource() {
    this.departmentsDataSource = new DataSource({
      store: this.http.createStore(
        'id',
        this.departmentService.getAllDepartmentUrl(this.auth.currentOrganizationId)
      ),
      sort: [{ selector: 'name', desc: false }],
      pageSize: 20,
    });
    this.locationsDataSource = new DataSource({
      store: this.http.createStore(
        'id',
        this.locationService.getAllLocationDxUrl(
          this.auth.currentOrganizationId
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
    const [start, end] = this.filterForm.controls.eventDate.value;
    const params = {
      start: format(start, 'yyyy-MM-dd'),
      end: format(end, 'yyyy-MM-dd'),
      departmentsId: filterFormValue.departments,
      locationsId: filterFormValue.locations,
    };
    this.getLatecomers(this.auth.currentOrganizationId, params);
  }

  exportToExcel(e) {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(this.title);

    exportDataGrid({
      component: this.grid.instance,
      worksheet,
      autoFilterEnabled: true,
      customizeCell: ({ gridCell, excelCell }) => {
        if (gridCell.rowType === 'data') {
          if (gridCell.column.cellTemplate == 'minutesTemplate') {
            excelCell.value = this.formatMinutes(gridCell.value);
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

  calculateData(rowData: LatecomersModel): string {
    return `UTC${
      Math.sign(rowData.eventDateInUtcOffset) === 1
        ? `+${rowData.eventDateInUtcOffset}`
        : `${rowData.eventDateInUtcOffset}`
    }`;
  }

  formatMinutes(minutes: number | null): string | null {
    if (minutes == null) {
      return null;
    }
    minutes = Math.round(minutes);
    const leftMinutes = minutes % 60;
    const hours = (minutes - leftMinutes) / 60;
    return `${hours.toString().padStart(2, '0')}ч ${leftMinutes
      .toString()
      .padStart(2, '0')}мин`;
  }
}
