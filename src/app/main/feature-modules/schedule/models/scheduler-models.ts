export interface SchedulerDay {
  id: string;
  date: Date | string;
  dayType: number;
  scheduleName: string;
  scheduleColor: string;
  workTime: {
    start: Date | string;
    end: Date | string;
  };
  boundaryTime: {
    start: Date | string;
    end: Date | string;
  };
  employeeId: string;
  employeeName: string;
  employeeIsDeleted: boolean;
  employeeDeletedOn: Date;
  locationId: string;
  inMarkId: string;
  outMarkId: string;
}

export enum DayType {
  None = 0,
  Workday = 1,
  Offday = 2,
  Holiday = 3,
}

export type SchedulerFilterForm = {
  start?: string;
  end?: string;
  scheduleIds?: string[];
  locationIds?: string[];
  departmentIds?: string[];
};
