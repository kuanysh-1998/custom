export type ReportFilterForm = {
  start?: string;
  end?: string;
  employees?: string[];
  departments?: string[];
  isLateIn?: boolean;
  schedules?: string[];
};

export interface ReportDataActualHoursWorkedModel {
  data: ReportActualHoursWorkedModel[];
}

export interface ReportActualHoursWorkedModel {
  date: Date;
  employeeName: string;
  departmentName: string;
  employeeIsDeleted: boolean;
  employeeDeletedOn: Date;
  inMarkDateTime: Date;
  inMarkLocationName: string;
  outMarkDateTime: Date;
  outMarkLocationName: string;
  presence: number;
}

export interface ReportDataHoursWorkedModel {
  data: ReportHoursWorkedModel[];
}

export interface ReportHoursWorkedModel {
  employeeName: string;
  departmentName: string;
  employeeIsDeleted: boolean;
  employeeDeletedOn: Date;
  scheduleNames: string;
  workTimePresenceOutsideBreak: number;
  spans: [{ date: Date; workTimePresenceOutsideBreak: number }];
}

export interface ReportDataLateInModel {
  data: ReportLateInModel[];
}

export interface ReportLateInModel {
  employeeName: string;
  departmentName: string;
  employeeIsDeleted: boolean;
  employeeDeletedOn: Date;
  scheduleNames: string;
  lateIn: number;
  spans: DataSpans[];
}

export interface DataSpans {
  in: Date | string;
  date: Date;
  inLocationName: string;
  inComment: string;
  lateIn: number;
  isMark?: boolean;
}

export interface ReportDataAttendanceModel {
  data: ReportAttendanceModel[];
}

export interface ReportAttendanceModel {
  eventsReport?: {};
  employeeName: string;
  employeeIIN: string;
  departmentName: string;
  employeeIsDeleted: boolean;
  employeeDeletedOn: Date;
  spans: AttendanceDataSpans[];
  earlyIn: number;
  earlyOut: number;
  lateIn: number;
  lateOut: number;
  presence: number;
  workTimePresenceOutsideBreak: number;
  deficiency: number;
  workTimeOvertimeWithoutBreaks: number;
  workedDaysCount: number;
}

export interface AttendanceDataSpans {
  date: string;
  in: Date | string;
  inLocationName: string;
  out: number;
  outLocationName: string;
  workTime: {
    start: Date;
    end: Date;
  };
  workTimeDurationWithoutBreaks: number;
  earlyIn: number;
  earlyOut: number;
  lateIn: number;
  lateOut: number;
  presence: number;
  spanExist: boolean;
  workTimePresenceOutsideBreak: number;
  deficiency: number;
  workTimeOvertimeWithoutBreaks: number;
}

export interface ReportDataMarkModel {
  data: ReportMarkModel[];
}

export interface ReportMarkModel {
  employeeName: string;
  departmentName: string;
  date: string;
  workTime: WorkTime;
  inMark: TimeMark;
  inLocationName: string;
  inComment: string;
  outMark: TimeMark;
  outLocationName: string;
  outComment: string;
  lateIn: TimeMark;
}

export interface TimeMark {
  hour: number;
  minute: number;
}

export interface WorkTime {
  start: TimeMark;
  end: TimeMark;
}

export interface ReportDataViolationsModel {
  data: ReportViolationsModel[];
}
export interface ReportViolationsModel {
  employeeId: string;
  employeeName: string;
  employeeIsDeleted: boolean;
  departmentName: string;
  scheduleName: string;
  spans: ViolationsDataSpans[];
  absenceTotal: number;
  lateTotal: number;
  inOutAbsenceTotal: number;
  violations?: Violation[];
}

export interface ViolationsDataSpans {
  date: string;
  workTime: WorkTime;
  inMarkId: string;
  earlyIn: Date;
  outMarkId: string;
  lastOut: Date;
  lateIn: number;
  lateOut: number;
}

export interface Violation {
  date: string;
  violationText: string;
  violationType: string;
}
