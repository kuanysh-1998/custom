import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../shared/shared.module';
import { ScheduleRoutingModule } from './schedule-routing.module';
import { DxButtonGroupModule } from 'devextreme-angular/ui/button-group';
import { DxCheckBoxModule } from 'devextreme-angular/ui/check-box';
import { DxColorBoxModule } from 'devextreme-angular/ui/color-box';
import { DxNumberBoxModule } from 'devextreme-angular/ui/number-box';
import { DxTreeViewModule } from 'devextreme-angular/ui/tree-view';
import { DxSchedulerModule } from 'devextreme-angular/ui/scheduler';

import { ScheduleActionComponent } from './pages/schedule-action/schedule-action.component';
import { ScheduleTableComponent } from './pages/schedule-table/schedule-table.component';
import { ScheduleBasicControlsComponent } from './components/schedule-basic-controls/schedule-basic-controls.component';
import { ScheduleActionControlComponent } from './components/schedule-action-control/schedule-action-control.component';
import { ScheduleComponent } from './components/schedule/schedule.component';
import { ScheduleDayEditComponent } from './components/schedule-day-edit/schedule-day-edit.component';
import { ScheduleEmployeesComponent } from './pages/schedule-employees/schedule-employees.component';
import { TimetableComponent } from './components/timetable/timetable.component';
import { PublishEditBasicComponent } from './components/publish-edit-schedule-basic/publish-edit-basic.component';
import { EditTimetablesComponent } from './components/edit-timetables/edit-timetables.component';
import { SchedulerComponent } from './pages/scheduler/scheduler.component';
import { SchedulerTableComponent } from './components/scheduler-table/scheduler-table.component';
import { SchedulePlanComponent } from './components/schedule-plan/schedule-plan.component';

import { DayNumberPipe } from './pipes/day-number.pipe';
import { ScheduleTimePipe } from './pipes/schedule-time.pipe';
import { SelectedDaysPipe } from './pipes/selected-days.pipe';
import { LocationNamePipe } from './pipes/location-name.pipe';
import { ScheduleTypePipe } from './pipes/schedule-type.pipe';

import { ResizableWidthDirective } from './directives/resizable-width.directive';
import { AdjustHeightsDirective } from './directives/adjust-heights.directive';
import { DynamicSizeColumnDirective } from './directives/dynamic-size-column.directive';

@NgModule({
  declarations: [
    ScheduleActionComponent,
    ScheduleTableComponent,
    ScheduleBasicControlsComponent,
    ScheduleActionControlComponent,
    ScheduleComponent,
    DayNumberPipe,
    ScheduleTimePipe,
    ScheduleDayEditComponent,
    SelectedDaysPipe,
    LocationNamePipe,
    ScheduleEmployeesComponent,
    TimetableComponent,
    SchedulePlanComponent,
    PublishEditBasicComponent,
    ScheduleTypePipe,
    EditTimetablesComponent,
    SchedulerComponent,
    ResizableWidthDirective,
    AdjustHeightsDirective,
    SchedulerTableComponent,
    DynamicSizeColumnDirective,
  ],
  imports: [
    CommonModule,
    ScheduleRoutingModule,
    DxColorBoxModule,
    DxCheckBoxModule,
    DxNumberBoxModule,
    SharedModule,
    DxTreeViewModule,
    DxButtonGroupModule,
    DxSchedulerModule,
  ],
})
export class ScheduleModule {}
