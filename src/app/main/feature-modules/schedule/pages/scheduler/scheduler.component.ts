import { Component } from '@angular/core';
import { SchedulerService } from '../../services/scheduler.service';
import { OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { ShortDateFormat } from '../../../../../shared/consts/date-format.const';
import { format, subDays } from 'date-fns';
import DataSource from 'devextreme/data/data_source';
import { HttpCustom } from '../../../../../shared/http';
import { DepartmentService } from '../../../../../services/department.service';
import { LocationService } from '../../../../../services/location.service';
import { AuthorizeService } from '../../../../../auth/services/authorize.service';
import { FormBuilder, FormControl } from '@angular/forms';
import { ScheduleAPIService } from '../../../../../services/schedule-api.service';
import { SchedulerFilterForm } from '../../models/scheduler-models';
import startOfDay from 'date-fns/startOfDay';
import { SchedulerDay } from '../../models/scheduler-models';
import compareAsc from 'date-fns/compareAsc';
import { Locale } from 'src/app/shared/consts/locale.const';
import { LocalizationService } from '../../../../../shared/services/localization.service';
import { WpCustomValidators } from 'src/app/shared/validators/wp-custom-validators';
import { WpSnackBar } from 'src/app/shared/services/wp-snackbar.service';

@Component({
  selector: 'app-scheduler',
  templateUrl: './scheduler.component.html',
  styleUrls: ['./scheduler.component.scss'],
})
export class SchedulerComponent implements OnInit {
  locationsDataSource: DataSource;
  departmentsDataSource: DataSource;
  schedulesDataSource: DataSource;
  showContent: boolean = false;
  currentLocale: Locale;
  widthLaptop: number = 1536;
  data: SchedulerDay[] = [];
  uniqueEmployees: {
    employeeId: string;
    employeeName: string;
    employeeIsDeleted: boolean;
  }[] = [];
  uniqueDates = [];

  form = this.fb.group({
    schedules: new FormControl<Array<string>>([]),
    locations: new FormControl<Array<string>>([]),
    departments: new FormControl<Array<string>>([]),
    eventDate: this.fb.control<Date[]>(
      [subDays(startOfDay(new Date()), 5), startOfDay(new Date())],
      [
        WpCustomValidators.dateRangeRequired(),
        
      ]
    ),
  });

  constructor(
    private fb: FormBuilder,
    private http: HttpCustom,
    private auth: AuthorizeService,
    private schedulerService: SchedulerService,
    private departmentService: DepartmentService,
    private locationService: LocationService,
    private scheduleAPIService: ScheduleAPIService,
    private localization: LocalizationService,
    private snackBar: WpSnackBar
  ) {}

  ngOnInit(): void {
    this.initDataSource();
    this.applyFilter();
  }

  applyFilter() {
    this.form.markAllAsTouched();
    if (!this.form.valid) {
      return;
    }
    const filterFormValue = this.form.value;
    const [start, end] = this.form.controls.eventDate.value;

    const params: SchedulerFilterForm = {
      start: format(start, ShortDateFormat),
      end: format(end, ShortDateFormat),
      scheduleIds: filterFormValue.schedules,
      locationIds: filterFormValue.locations,
      departmentIds: filterFormValue.departments,
    };
    this.showContent = false;
    this.schedulerService
      .getSpansForCalendar(params)
      .pipe(first())
      .subscribe({
        next: (res: SchedulerDay[]) => {
          this.data = res;

          this.uniqueDates = Array.from(
            new Set(this.data.map((item) => item.date))
          );
          this.uniqueDates = this.sortAndSetUniqueDates(this.uniqueDates);

          this.uniqueEmployees = [
            ...new Set(this.data.map((item) => item.employeeId)),
          ].map((employeeId) => {
            const item = this.data.find(
              (dataItem) => dataItem.employeeId === employeeId
            );
            return {
              employeeId: employeeId,
              employeeName: item.employeeName,
              employeeIsDeleted: item.employeeIsDeleted,
            };
          });
          this.uniqueEmployees.sort((a, b) => {
            const nameA = a.employeeName.toUpperCase();
            const nameB = b.employeeName.toUpperCase();
            if (nameA < nameB) {
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }
            return 0;
          });

          this.fillWithEmptyСellsGrid();
        },
        error: (error) => {
          this.showContent = true;
          this.snackBar.open(error, 3000, 'error');
        },
        complete: () => {
          this.showContent = true;
        },
      });
  }

  fillWithEmptyСellsGrid() {
    const cellsCount = window.innerWidth > this.widthLaptop ? 8 : 6;
    if (this.uniqueDates.length < cellsCount) {
      const emptyCellsCount = cellsCount - this.uniqueDates.length;
      const fillArray = Array(emptyCellsCount).fill('');
      this.uniqueDates = this.uniqueDates.concat(fillArray);
    }
  }

  sortAndSetUniqueDates(dataDays) {
    const sortedDatesArray = dataDays.sort((a, b) =>
      compareAsc(new Date(a), new Date(b))
    );
    return [...new Set(sortedDatesArray)];
  }

  initDataSource() {
    this.schedulesDataSource = new DataSource({
      store: this.http.createStore(
        'id',
        this.scheduleAPIService.getScheduleURL()
      ),
      sort: [{ selector: 'name', desc: false }],
      filter: ['status', '=', 1],
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
}
