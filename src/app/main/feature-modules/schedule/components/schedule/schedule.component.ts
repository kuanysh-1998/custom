import { Component, OnInit } from '@angular/core';
import {
  Schedule,
  ScheduleContext,
  ScheduleCreateForm,
  ScheduleDay,
  ScheduleStatus,
  ScheduleTabs,
  ScheduleType,
} from '../../models/schedule-models';
import { ScheduleService } from '../../services/schedule.service';
import { ScheduleAPIService } from '../../../../../services/schedule-api.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { LocalizationService } from '../../../../../shared/services/localization.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { WpSnackBar } from 'src/app/shared/services/wp-snackbar.service';
import { WpMessageComponent } from 'src/app/shared/components/wp-message/wp-message.component';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';

@UntilDestroy()
@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
})
export class ScheduleComponent implements OnInit {
  schedule: Schedule;
  selectedTabIndex: number = 0;
  isDraft: boolean = false;
  isCopyMode: boolean = false;
  context: ScheduleContext;

  scheduleFromRoute: Schedule | null = null;

  basicGroup: FormGroup<{
    name: FormControl<string>;
    color: FormControl<string>;
  }>;

  protected readonly ScheduleStatus = ScheduleStatus;
  protected readonly ScheduleContext = ScheduleContext;
  private readonly tabTitles: { [key: string]: ScheduleTabs } = {
    График: ScheduleTabs.schedule,
    'Расписание сотрудников': ScheduleTabs.timetable,
  };

  constructor(
    private scheduleService: ScheduleService,
    private localizationService: LocalizationService,
    private timesheetService: ScheduleAPIService,
    private titleService: Title,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: WpSnackBar,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    combineLatest([this.route.queryParams, this.route.data])
      .pipe(
        untilDestroyed(this),
        map(([queryParams, data]) => {
          return {
            mode: queryParams['mode'],
            tab: queryParams['tab'],
            schedule: data.schedule as Schedule,
          };
        })
      )
      .subscribe(({ mode, tab, schedule }) => {
        this.handleContext(mode);
        switch (tab) {
          case 'schedule':
            this.selectedTabIndex = 0;
            break;
          case 'timetable':
            this.selectedTabIndex = 1;
            break;
          default:
            this.selectedTabIndex = 0;
        }

        this.handleRouteData(schedule);
      });

    this.subscribeToRouterEvents();
  }

  private handleRouteData(schedule: Schedule | null) {
    this.scheduleFromRoute = schedule;

    this.isDraft =
      this.isCopyMode || !schedule || schedule.status === ScheduleStatus.draft;
    this.context = this.determineContext(schedule);

    if (this.context === ScheduleContext.COPY && schedule) {
      this.schedule = {
        ...schedule,
        id: '',
        status: ScheduleStatus.draft,
      };
    } else {
      this.schedule = schedule
        ? { ...schedule, days: [] }
        : this.getInitialSchedule();
    }

    this.setPageTitle(this.context);
    this.initScheduleDays(schedule);
  }

  private determineContext(schedule: Schedule | null): ScheduleContext {
    if (!schedule) return ScheduleContext.CREATE;
    if (this.isCopyMode) return ScheduleContext.COPY;
    if (schedule.status === ScheduleStatus.draft) return ScheduleContext.EDIT;
    if (this.context === ScheduleContext.EDIT_PUBLISHED)
      return ScheduleContext.EDIT_PUBLISHED;
    return ScheduleContext.VIEW;
  }

  private getInitialSchedule(): Schedule {
    return {
      createdOn: '',
      deletedOn: '',
      id: '',
      status: ScheduleStatus.draft,
      timetableCount: 0,
      updatedOn: '',
      color: '#EDE1FF',
      days: [],
      name: '',
      type: ScheduleType.weekDays,
    };
  }

  private subscribeToRouterEvents() {
    this.router.events.pipe(untilDestroyed(this)).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.setPageTitle(this.context);
      }
    });
  }

  private handleContext(mode: string) {
    this.isCopyMode = mode === 'copy';
    if (mode === 'edit') {
      this.context = ScheduleContext.EDIT_PUBLISHED;
    } else {
      this.context = this.isCopyMode
        ? ScheduleContext.COPY
        : ScheduleContext.EDIT;
    }
  }

  handleScheduleChange(updatedSchedule: Schedule) {
    this.schedule = updatedSchedule;
  }

  private validateForm(): boolean {
    this.basicGroup.markAllAsTouched();
    const trimmedValue = this.basicGroup.controls.name.value.trim();
    this.basicGroup.controls.name.setValue(trimmedValue);

    if (this.basicGroup.invalid) {
      this.snackBar.open('Заполните необходимые поля', 4000, 'error');
      return false;
    }

    return true;
  }

  private createScheduleForm(
    scheduleDays: ScheduleDay[]
  ): ScheduleCreateForm | null {
    if (!this.validateForm()) {
      return null;
    }

    const days = scheduleDays.map((day) => {
      return {
        ...day,
        workSpans: day.workSpans.map((workSpan) => {
          return {
            ...workSpan,
            breaks: workSpan?.breaks?.[0]?.time ? [workSpan.breaks[0]] : [],
          };
        }),
      };
    });

    return {
      ...this.schedule,
      days: [...days],
      color: this.basicGroup.controls.color.value,
      name: this.basicGroup.controls.name.value,
    };
  }

  handleSave(scheduleDays: ScheduleDay[]) {
    const scheduleForm = this.createScheduleForm(scheduleDays);
    if (!scheduleForm) return;

    switch (this.context) {
      case ScheduleContext.EDIT:
        this.change(scheduleForm);
        break;
      case ScheduleContext.EDIT_PUBLISHED:
        this.confirm(scheduleDays);
        break;
      case ScheduleContext.CREATE:
      case ScheduleContext.COPY:
      default:
        this.save(scheduleForm);
        break;
    }
  }

  save(scheduleForm: ScheduleCreateForm) {
    this.timesheetService
      .saveDraft(scheduleForm)
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.snackBar.open('График сохранен как черновик', 4000, 'success');
        this.resetDataGridToFirstPage();
        this.navigateToScheduleList();
      });
  }

  change(scheduleForm: ScheduleCreateForm) {
    if (!this.scheduleFromRoute) return;

    this.timesheetService
      .updateSchedule({ ...scheduleForm, id: this.scheduleFromRoute.id })
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.snackBar.open('Черновик успешно изменен', 4000, 'success');
       this.resetDataGridToFirstPage();
        this.navigateToScheduleList();
      });
  }

  handlePublish(scheduleDays: ScheduleDay[]) {
    const scheduleForm = this.createScheduleForm(scheduleDays);
    if (!scheduleForm) return;

    this.context === ScheduleContext.COPY
      ? this.copyTimesheet(scheduleForm)
      : this.publish(scheduleForm);
  }

  copyTimesheet(scheduleForm: ScheduleCreateForm) {
    const originalScheduleId = this.scheduleFromRoute
      ? this.scheduleFromRoute.id
      : this.schedule.id;

    this.timesheetService
      .saveDraft(scheduleForm)
      .pipe(untilDestroyed(this))
      .subscribe((id) => {
        this.navigateToScheduleDetails(id, true, originalScheduleId);
      });
  }

  publish(scheduleForm: ScheduleCreateForm) {
    if (!this.scheduleFromRoute) {
      this.timesheetService
        .saveDraft(scheduleForm)
        .pipe(untilDestroyed(this))
        .subscribe((id) => {
          this.navigateToScheduleDetails(id);
          this.resetDataGridToFirstPage();
        });
    } else {
      this.timesheetService
        .updateSchedule({ ...scheduleForm, id: this.scheduleFromRoute.id })
        .pipe(untilDestroyed(this))
        .subscribe(() => {
          this.navigateToScheduleDetails(this.scheduleFromRoute.id);
          this.resetDataGridToFirstPage();
        });
    }
  }

  confirm(scheduleDays: ScheduleDay[]): void {
    this.dialogService.show('Редактирование опубликованного графика', {
      componentType: WpMessageComponent,
      componentData: {
        message:
          'Вы действительно хотите изменить опубликованный график? Если в настройках выбранных дней графика были внесены изменения, все предыдущие отметки и отчеты будут пересчитаны.',
      },
      onClose: (result) => {
        if (result.saved) {
          this.updatePublishedSchedule(scheduleDays);
        }
      },
    });
  }

  updatePublishedSchedule(scheduleDays: ScheduleDay[]): void {
    const scheduleForm = this.createScheduleForm(scheduleDays);
    if (!scheduleForm) return;

    this.timesheetService
      .updateSchedule({ ...scheduleForm, id: this.scheduleFromRoute.id })
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.snackBar.open('График успешно сохранен', 4000, 'success');
        this.navigateToScheduleList();
      });
  }

  private navigateToScheduleDetails(
    id: string,
    isCopy: boolean = false,
    originalScheduleId?: string
  ) {
    const queryParams = isCopy
      ? { mode: 'copy', originalScheduleId: originalScheduleId }
      : {};
    this.router.navigate([`timesheet2/employee/${id}`], { queryParams });
  }

  scheduleTypeChange(scheduleType: ScheduleType) {
    this.schedule = {
      ...this.schedule,
      type: scheduleType,
      days: [],
    };
    this.scheduleService.switchScheduleType(scheduleType);
  }

  updateScheduleBasic(
    basic: FormGroup<{
      name: FormControl<string>;
      color: FormControl<string>;
    }>
  ) {
    this.basicGroup = basic;
  }

  private initScheduleDays(schedule: Schedule | null): void {
    if (!schedule) {
      this.scheduleService.initWeekDaysSchedule();
      return;
    }

    this.scheduleService.setScheduleDays(schedule.days);
  }

  onTabSelectionChange(event: any) {
    const title = event.addedItems[0].title;
    const tabName = this.tabTitles[title];

    if (tabName !== undefined) {
      this.selectedTabIndex = tabName === ScheduleTabs.schedule ? 0 : 1;

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { tab: tabName },
        queryParamsHandling: 'merge',
      });
    }
  }

  private setPageTitle(context: ScheduleContext) {
    let titleKey;
    switch (context) {
      case ScheduleContext.COPY:
        titleKey = 'Копирование графика работы';
        break;
      case ScheduleContext.EDIT:
        titleKey = 'Редактирование черновика';
        break;
      case ScheduleContext.CREATE:
        titleKey = 'Добавление графика работы';
        break;
      case ScheduleContext.EDIT_PUBLISHED:
        titleKey = 'Редактирование опубликованного графика';
        break;
      case ScheduleContext.VIEW:
        titleKey = 'Просмотр опубликованного графика';
        break;
    }

    const title = this.localizationService.getSync(titleKey);
    this.titleService.setTitle(title);
  }

  navigateToScheduleList() {
    this.router.navigate(['timesheet2']);
  }

  resetDataGridToFirstPage() {
    if (this.context === ScheduleContext.CREATE) {
      this.timesheetService.setCurrentPage(0);
    }
  }
}
