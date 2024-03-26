import { AuthorizeService } from 'src/app/auth/services/authorize.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { TimesheetService } from '../../../services/timesheet.service';
import { DepartmentService } from '../../../services/department.service';
import { combineLatest } from 'rxjs';
import { filter, first, map } from 'rxjs/operators';
import { EmployeeService } from '../../../services/employee.service';
import {
  Appointments,
  SubjectType,
  SubjectView,
  TimesheetModel,
} from '../../../models/timesheet.model';
import { DxSchedulerComponent } from 'devextreme-angular';
import { LocalizationService } from 'src/app/shared/services/localization.service';

@Component({
  selector: 'app-timesheet',
  templateUrl: './timesheet.component.html',
  styleUrls: ['./timesheet.component.scss'],
})
export class TimesheetComponent implements OnInit {
  dataSource: Appointments[] = [];
  filterValues: Appointments[] = [];
  subjectView: SubjectView[] = [];
  currentDate: Date = new Date();
  data: TimesheetModel[];
  resourcesDataSource: SubjectView[] = [];
  isLoadingResults = true;

  @ViewChild(DxSchedulerComponent, { static: false })
  scheduler: DxSchedulerComponent;

  constructor(
    private service: TimesheetService,
    private departmentService: DepartmentService,
    private employeeService: EmployeeService,
    private auth: AuthorizeService,
    private localization: LocalizationService
  ) {
    this.isLoadingResults = true;
    const department$ = this.departmentService.getAllDepartment(
      this.auth.currentOrganizationId
    );
    const employee$ = this.employeeService
      .getAllEmployeeDx()
      .pipe(map((res) => res.data));
    combineLatest([department$, employee$])
      .pipe(
        first(),
        filter(([dep, emp]) => !!dep && !!emp)
      )
      .subscribe(([department, employee]) => {
        const dataInitOrganization: SubjectView[] = [];
        dataInitOrganization.push({
          subjectId: this.auth.currentOrganizationId,
          name: this.localization.getSync('Вся компания'),
          subjectType: SubjectType.organization,
        });
        const dataInitDepartment: SubjectView[] = [];
        department.map((item) => {
          dataInitDepartment.push({
            subjectId: item.id,
            name: item.name,
            subjectType: SubjectType.department,
          });
        });
        const data = dataInitOrganization.concat(dataInitDepartment);
        const dataInitEmployee: SubjectView[] = [];
        employee.map((x) => {
          dataInitEmployee.push({
            subjectId: x.id,
            name: x.fullName,
            subjectType: SubjectType.employee,
          });
        });
        this.resourcesDataSource = data.concat(dataInitEmployee);
        this.isLoadingResults = false;
      });
    this.loadData();
  }

  ngOnInit(): void {}

  showAppointmentPopup(e): void {
    this.scheduler.instance.showAppointmentPopup();
  }

  loadData(): void {
    this.service
      .getTimesheet(this.auth.currentOrganizationId)
      .pipe(
        first(),
        filter((t) => !!t)
      )
      .subscribe((res) => {
        this.data = res;
        const data: Appointments[] = [];
        res.map((x) => {
          x.appointments.map((item) => {
            data.push({
              id: x.id,
              description: item.description,
              text: item.text,
              color: x.color,
              recurrenceRule: item.recurrenceRule,
              subjects: x.subjects,
              startDate: item.startDate,
              endDate: item.endDate,
            });
          });
        });
        this.dataSource = data;
      });
  }

  onAppointmentFormOpening($event: any): void {
    const forms = $event.form;
    const formItems = forms.option('items');
    formItems[0].items[2].items[0].visible = false;
    if (!formItems.find((i) => i.label?.id === 'employee')) {
      formItems.push({
        colSpan: 2,
        label: {
          text: this.localization.getSync('Сотрудник'),
          id: 'employee',
        },
        editorType: 'dxTagBox',
        dataField: 'subjects',
        editorOptions: {
          valueExpr: (item) => {
            return item;
          },
          displayExpr: (items) => {
            const value = this.resourcesDataSource.find(
              (x) => x.subjectId === items.subjectId
            )?.name;
            return value;
          },
          searchEnabled: true,
          items: this.resourcesDataSource,
          onValueChanged: (data) => {
            this.subjectView = data?.value;
          },
        },
      });
      formItems.push({
        colSpan: 2,
        label: {
          text: this.localization.getSync('Цвет'),
        },
        editorType: 'dxColorBox',
        dataField: 'color',
      });
      formItems.map((item) => {
        item?.items?.map((value) => {
          if (value?.dataField === 'text') {
            value.validationRules = [
              {
                type: 'required',
                message: this.localization.getSync(
                  'Поле обязательно для заполнения'
                ),
              },
              {
                type: 'stringLength',
                max: 100,
                message: this.localization.getSync(
                  'Максимальная длина значения: __length__ символов',
                  { length: 100 }
                ),
              },
            ];
          }
          if (value?.dataField === 'description') {
            value.validationRules = [
              {
                type: 'stringLength',
                max: 500,
                message: this.localization.getSync(
                  'Максимальная длина значения: __length__ символов',
                  { length: 100 }
                ),
              },
            ];
          }
          value?.items?.map((values) => {
            if (
              values?.dataField === 'startDate' ||
              values?.dataField === 'endDate'
            ) {
              values.editorOptions = {
                calendarOptions: {
                  firstDayOfWeek: 1,
                },
                type: 'datetime',
                width: '100%',
                acceptCustomValue: false,
              };
            }
          });
        });
        if (item?.dataField === 'subjects' || item?.dataField === 'color') {
          item.validationRules = [
            {
              type: 'required',
              message: this.localization.getSync(
                'Поле обязательно для заполнения'
              ),
            },
          ];
        }
      });
      forms.option({
        items: formItems,
      });
    }
  }

  onAppointmentAdded($event: any): void {
    const body: TimesheetModel = {
      organizationId: this.auth.currentOrganizationId,
      color: $event.appointmentData.color,
      subjects: [],
      appointments: [
        {
          text: $event.appointmentData.text,
          startDate: $event.appointmentData.startDate,
          endDate: $event.appointmentData.endDate,
          description: $event.appointmentData.description,
          recurrenceRule: $event.appointmentData.recurrenceRule,
        },
      ],
    };
    $event.appointmentData.subjects.forEach((value) => {
      body.subjects.push({
        subjectId: value.subjectId,
        subjectType: value.subjectType,
      });
    });
    this.service.addTimesheet(body).subscribe(
      () => {
        this.loadData();
      },
      (error) => {
        this.loadData();
      }
    );
  }

  onAppointmentUpdated($event: any): void {
    const body: TimesheetModel = {
      id: $event.appointmentData.id,
      organizationId: this.auth.currentOrganizationId,
      color: $event.appointmentData.color,
      subjects: [],
      appointments: [
        {
          text: $event.appointmentData.text,
          startDate: $event.appointmentData.startDate,
          endDate: $event.appointmentData.endDate,
          description: $event.appointmentData.description,
          recurrenceRule: $event.appointmentData.recurrenceRule,
        },
      ],
    };
    $event.appointmentData.subjects.forEach((value) => {
      body.subjects.push({
        subjectId: value.subjectId,
        subjectType: value.subjectType,
      });
    });
    this.service.updateTimesheet(body).subscribe(
      () => {
        this.loadData();
      },
      (error) => {
        this.loadData();
      }
    );
  }

  onAppointmentDeleted($event: any): void {
    this.service.deleteTimesheet($event.appointmentData.id).subscribe(
      () => {
        this.loadData();
      },
      (error) => {
        this.loadData();
      }
    );
  }

  onAppointmentRendered($event: any): void {
    $event.appointmentElement.style.backgroundColor =
      $event.appointmentData.color;
  }

  onValueChanged($event: any): void {
    this.isLoadingResults = true;
    this.filterValues = [];
    const value: string[] = $event.value;
    if (value.length === 0) {
      this.isLoadingResults = false;
      this.scheduler.dataSource = this.dataSource;
      this.scheduler.instance._refresh();
    } else {
      value.map((val) => {
        this.dataSource.map((items) => {
          items.subjects.map((item) => {
            if (item.subjectId === val) {
              this.filterValues.push(items);
            }
          });
        });
      });
      this.isLoadingResults = false;
      this.scheduler.dataSource = this.filterValues;
      this.scheduler.instance._refresh();
    }
  }
}
