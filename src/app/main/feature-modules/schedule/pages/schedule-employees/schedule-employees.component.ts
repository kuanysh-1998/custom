import { Component, OnInit, ViewChild } from '@angular/core';
import { DxTreeViewComponent } from 'devextreme-angular';
import Popup from 'devextreme/ui/popup';
import { EmployeeService } from '../../../../../services/employee.service';
import { catchError } from 'rxjs/operators';
import { EmployeeModel } from '../../../../../models/employee.model';
import { ActivatedRoute, Router } from '@angular/router';
import {
  PublishScheduleForm,
  Schedule,
  ScheduleStatus,
} from '../../models/schedule-models';
import { addDays, format, startOfDay, subDays } from 'date-fns';
import { ScheduleAPIService } from '../../../../../services/schedule-api.service';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import DataSource from 'devextreme/data/data_source';
import { HttpCustom } from 'src/app/shared/http';
import { TimetableApiService } from 'src/app/services/timatable-api.service';
import { FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { WpCustomValidators } from 'src/app/shared/validators/wp-custom-validators';
import { WpSnackBar } from 'src/app/shared/services/wp-snackbar.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import { WpMessageComponent } from 'src/app/shared/components/wp-message/wp-message.component';

export interface TreeElement {
  id: string;
  name: string;
  parentId?: string;
  type?: 'department' | 'employee';
  searchName?: string;
}

@UntilDestroy()
@Component({
  selector: 'app-schedule-employees',
  templateUrl: './schedule-employees.component.html',
  styleUrls: ['./schedule-employees.component.scss'],
})
export class ScheduleEmployeesComponent implements OnInit {
  @ViewChild(DxTreeViewComponent, { static: false })
  treeView: DxTreeViewComponent;

  schedule: Schedule;

  allEmployees: TreeElement[] = [];
  employeesDataSource: DataSource;
  selectedEmployees: string[] = [];
  departments: TreeElement[] = [];

  form: FormGroup;
  minDate: Date = new Date(1001, 0, 1);
  maxDate: Date = new Date(9000, 11, 31);
  startDate: Date | null = null;
  endDate: Date | null = null;

  conflictMessage: string = '';

  employeeListValid: boolean = true;
  publishBtnClicked = false;

  timetableDataSource: DataSource;
  originalScheduleId: string;
  allSelectedNodes = [];

  hasStartDateEditorSpecificError = false;
  hasEndDateEditorSpecificError = false;

  constructor(
    private employeeService: EmployeeService,
    private router: Router,
    private scheduleAPIService: ScheduleAPIService,
    private timetableApiService: TimetableApiService,
    private route: ActivatedRoute,
    private httpCustom: HttpCustom,
    private fb: FormBuilder,
    private snackBar: WpSnackBar,
    private dialogService: DialogService
  ) {
    this.selectedEmployees = [];
  }

  ngOnInit(): void {
    this.subscribeToQueryParams();

    if (this.originalScheduleId) {
      this.initTimetableSource();
    }

    this.initForm();
    this.loadInitialData();
  }

  private initForm(): void {
    this.form = this.fb.group({
      startDate: [
        null,
        [
          WpCustomValidators.dateRequired('Выберите дату'),
          this.editorSpecificValidator('startDate'),
        ],
      ],
      endDate: [
        null,
        [
          WpCustomValidators.dateRequired('Выберите дату'),
          this.editorSpecificValidator('endDate'),
        ],
      ],
      selectedEmployees: [[], Validators.required],
    });
  }

  private subscribeToQueryParams(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['mode'] === 'copy' && params['originalScheduleId']) {
        this.originalScheduleId = params['originalScheduleId'];
      }
    });
  }
  

  private loadInitialData(): void {
    this.schedule = this.route.snapshot.data.schedule as Schedule;

    this.employeeService
      .getAllEmployeeDx()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        const { departments, employees } = this.generateEmployeeDepartmentTree(
          res.data
        );
        this.departments = departments;
        this.allEmployees = employees;

        this.initEmployeesDataSource();
      });
  }

  initTimetableSource() {
    const dataStore = this.httpCustom.createStore(
      'id',
      this.timetableApiService.url(this.originalScheduleId)
    );
    this.timetableDataSource = new DataSource(dataStore);

    this.timetableDataSource.load().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        const uniqueEmployeeIds = new Set<string>();

        data.forEach((item) => uniqueEmployeeIds.add(item.employeeId));

        this.selectedEmployees = Array.from(uniqueEmployeeIds);
      }
    });
  }

  initEmployeesDataSource() {
    this.employeesDataSource = new DataSource({
      store: this.allEmployees,
      sort: [{ selector: 'name', desc: false }],
    });
  }

  publish() {
    this.publishBtnClicked = true;

    this.updateDropDownBoxValidation();

    if (this.form.invalid || !this.employeeListValid) {
      this.form.markAllAsTouched();
      this.snackBar.open('Заполните все необходимые поля', 5000, 'error');

      this.publishBtnClicked = false;
      return;
    }

    const form = this.preparePublishForm();

    this.executePublish(form);
  }

  private executePublish(form: PublishScheduleForm): void {
    this.scheduleAPIService
      .publish(form)
      .pipe(catchError((err: HttpErrorResponse) => of(err)))
      .subscribe((res) => this.handlePublishResponse(res));
  }

  private preparePublishForm(): PublishScheduleForm {
    const scheduleId = this.schedule.id;
    const employeesIds = this.selectedEmployees as string[];
    const { startDate, endDate } = this.form.value;

    const formattedStartDate = format(startDate, 'yyyy-MM-dd');
    const formattedEndDate = format(endDate, 'yyyy-MM-dd');

    return {
      id: scheduleId,
      employeesId: employeesIds,
      start: formattedStartDate,
      end: formattedEndDate,
    };
  }

  private handlePublishResponse(res: any): void {
    if (res instanceof HttpErrorResponse && res.status === 400) {
      this.conflictMessage = res.error;
    } else {
      this.snackBar.open('Расписания созданы успешно', 5000, 'success');
      this.navigateToTimetable();
    }
    this.publishBtnClicked = false;
  }

  private navigateToTimetable(): void {
    this.router.navigate(['timesheet2', this.schedule.id], {
      queryParams: { tab: 'timetable' },
    });
  }

  cancel() {
    this.dialogService.show('Отмена добавления расписания', {
      componentType: WpMessageComponent,
      componentData: {
        message:
          'Вы действительно хотите выйти? Расписания для сотрудников не будут созданы. График сохранится в статусе черновик',
      },
      onClose: (result) => {
        if (result.saved) {
          if (this.schedule.status === ScheduleStatus.published) {
            this.navigateToTimetable();
          } else {
            this.router.navigate(['timesheet2']);
          }
        }
      },
    });
  }

  onDateChanged(e: any, dateType: 'startDate' | 'endDate') {
    if (e.name === 'validationErrors') {
      const validationErrors = e.value;
      const newHasEditorSpecificError =
        validationErrors && validationErrors.some((err) => err.editorSpecific);

      const errorProperty =
        dateType === 'startDate'
          ? 'hasStartDateEditorSpecificError'
          : 'hasEndDateEditorSpecificError';
      if (this[errorProperty] !== newHasEditorSpecificError) {
        this[errorProperty] = newHasEditorSpecificError;
      }
    }
  }

  editorSpecificValidator(dateType: 'startDate' | 'endDate'): ValidatorFn {
    return (): ValidationErrors | null => {
      const errorProperty =
        dateType === 'startDate'
          ? 'hasStartDateEditorSpecificError'
          : 'hasEndDateEditorSpecificError';
      return this[errorProperty] ? { editorSpecificError: true } : null;
    };
  }

  // TODO: Вынести в отдельный компонент | Функций для списка сотрудников

  onDropDownBoxValueChanged(e: any) {
    this.updateSelection(this.treeView && this.treeView.instance);
    this.updateDropDownBoxValidation();
  }

  updateDropDownBoxValidation() {
    this.conflictMessage = '';
    this.employeeListValid = true;
  }

  onTreeViewReady(e: any) {
    this.updateSelection(e.component);
  }

  updateSelection(treeView: any) {
    if (!treeView) return;

    if (!this.selectedEmployees) {
      treeView.unselectAll();
    }

    if (this.selectedEmployees) {
      this.selectedEmployees.forEach((value) => {
        treeView.selectItem(value);
      });
    }

    let element = document.querySelector(
      '#myDropDownBox .dx-dropdowneditor-overlay'
    );
    if (element) {
      let popup = Popup.getInstance(element) as Popup,
        scrollable = treeView.getScrollable(),
        scrollTop = scrollable.scrollTop();
      popup.repaint();
      scrollable.scrollTo(scrollTop);
    }
  }

  onTreeViewSelectionChanged(e: any) {
    const isDepartment = e.node.itemData.type === 'department';

    if (isDepartment) {
      e.node.children.forEach((childNode) => {
        const childKey = childNode.key;
        if (e.node.selected && !this.allSelectedNodes.includes(childKey)) {
          this.allSelectedNodes.push(childKey);
        } else if (!e.node.selected) {
          const index = this.allSelectedNodes.indexOf(childKey);
          if (index > -1) {
            this.allSelectedNodes.splice(index, 1);
          }
        }
      });
    }

    const nodeKey = e.node.key;
    if (e.node.selected && !this.allSelectedNodes.includes(nodeKey)) {
      this.allSelectedNodes.push(nodeKey);
    } else if (!e.node.selected) {
      const index = this.allSelectedNodes.indexOf(nodeKey);
      if (index > -1) {
        this.allSelectedNodes.splice(index, 1);
      }
    }

    this.selectedEmployees = this.allSelectedNodes.filter((nodeKey) => {
      return !this.departments.some((department) => department.id === nodeKey);
    });

    this.updateDropDownBoxValidation();
    this.updateSelection(e.component);
  }

  onTagBoxValueChanged(e: any) {
    this.allSelectedNodes = [...e.value];

    if (this.treeView) {
      this.treeView.instance.unselectAll();

      this.allSelectedNodes.forEach((nodeKey) => {
        this.treeView.instance.selectItem(nodeKey);
      });
    }
  }

  private generateEmployeeDepartmentTree(employees: EmployeeModel[]): {
    departments: TreeElement[];
    employees: TreeElement[];
  } {
    const departmentNames = new Map<string, string>();
    employees.forEach((emp) => {
      departmentNames.set(emp.departmentId, emp.departmentName);
    });

    const uniqueDepartmentIds = new Set(
      employees.map((emp) => emp.departmentId)
    );

    const departments = Array.from(uniqueDepartmentIds).map((deptId) => ({
      id: deptId,
      name: departmentNames.get(deptId),
      type: 'department' as 'department',
    }));

    const employeeTreeElements = employees.map((emp) => ({
      id: emp.id,
      name: emp.fullName,
      searchName: emp.fullName,
      parentId: emp.departmentId,
      type: 'employee' as 'employee',
    }));

    return {
      departments,
      employees: [...departments, ...employeeTreeElements],
    };
  }
}
