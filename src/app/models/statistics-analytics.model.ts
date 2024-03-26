export interface LatecomersModel {
  employeeId: string;
  employeeName: string;
  departmentName: string;
  plannedEventDateIn?: Date;
  eventDateIn?: Date;
  locationNameIn: string;
  scheduleName: string;
  verifiedIn: boolean;
  eventDateInUtcOffset: number;
  lateInTimeInMinutes: number;
}

export interface AbsenceReportModel {
  employeeId: string;
  employeeName: string;
  departmentName: string;
  scheduleName: string;
}