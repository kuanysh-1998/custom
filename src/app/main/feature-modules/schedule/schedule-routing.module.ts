import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ScheduleTableComponent } from './pages/schedule-table/schedule-table.component';
import { ScheduleActionComponent } from './pages/schedule-action/schedule-action.component';
import { ScheduleResolver } from './resolvers/schedule.resolver';
import { ScheduleEmployeesComponent } from './pages/schedule-employees/schedule-employees.component';

const routes: Routes = [
  {
    path: '',
    component: ScheduleTableComponent,
    data: { title: 'Графики работ' },
    pathMatch: 'full',
  },
  {
    path: ':id',
    component: ScheduleActionComponent,
    resolve: {
      schedule: ScheduleResolver,
    },
  },
  {
    path: 'employee/:id',
    component: ScheduleEmployeesComponent,
    data: { title: 'Добавление расписания' },
    resolve: {
      schedule: ScheduleResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ScheduleRoutingModule {}
