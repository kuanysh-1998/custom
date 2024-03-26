export interface Timetable {
  id: string;
  employee: Employee;
  startDate: string;
  endDate: string;
  status: TimetableStatus;
}

export enum TimetableStatus {
  created = 0,
  active = 1,
  expired = 2,
  processing = 3,
  processFailed = 4
}

export interface Employee {
  id: string;
  fullname: string;
  departmnet: Departmnet;
}

export interface Departmnet {
  id: string;
  name: string;
}

export interface TimetableEditForm {
  timetableId: string;
  start: string;
  end: string;
}

export interface TimetablesEditForm {
  timetablesId: string[];
  start: string;
  end: string;
}
