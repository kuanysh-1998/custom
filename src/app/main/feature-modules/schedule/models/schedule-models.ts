export interface ScheduleCreateForm {
  name: string;
  color: string;
  type: number;
  days: ScheduleDay[];
}

export type ScheduleEditForm = ScheduleCreateForm & {
  id: string;
};

export interface ScheduleDay {
  isOffday: boolean;
  dayNumber: number;
  workSpans: WorkSpan[];
}

export interface WorkSpan {
  locationId: string;
  workTime: TimeRange;
  boundaryInTime: TimeRange;
  boundaryOutTime: TimeRange;
  breaks: BreakTime[];
}

export interface BreakTime {
  time: TimeRange;
}

export interface TimeRange {
  start: Time;
  end: Time;
}

export interface Time {
  hour: number;
  minute: number;
}

export interface Schedule {
  id: string;
  name: string;
  color: string;
  type: ScheduleType;
  status: ScheduleStatus;
  timetableCount: number;
  createdOn: string;
  updatedOn: string;
  deletedOn: string;
  days: ScheduleDay[];
}

export enum ScheduleStatus {
  draft = 0,
  published = 1,
}

export enum ScheduleTabs {
  schedule = 'schedule',
  timetable = 'timetable',
}

export enum ScheduleContext {
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  COPY = 'COPY',
  VIEW = 'VIEW',
  EDIT_PUBLISHED = 'EDIT_PUBLISHED' 
}


export enum ScheduleType {
  cyclic = 0,
  weekDays = 1,
}

export interface PublishScheduleForm {
  id: string;
  employeesId: string[];
  start: string;
  end: string;
}

export type PublishedEditForm = {
  id: string;
  name: string;
  color: string;
  type: number;
  days: ScheduleDay[];
};
