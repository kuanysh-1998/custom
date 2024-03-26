export type AbsenceFilterForm = {
  date?: string;
  departments?: string[];
  employees?: string[];
};

export type LateFilterForm = {
  start?: string;
  end?: string;
  departments?: string[];
  locations?: string[];
};

export type EarlyOutFilterForm = {
  start?: string;
  end?: string;
  employees?: string[];
  departments?: string[];
};

export interface ReportDataAbsenceModel {
  data: ReportAbsenceModel[];
}

export interface ReportAbsenceModel {
  employeeName: string;
  departmentName: string;
  employeeIsDeleted: boolean;
  employeeDeletedOn: Date;
  scheduleName: string;
  locationName: string;
}

export interface ReportDataLateModel {
  data: ReportLateModel[];
}

export interface ReportLateModel {
  date: Date;
  employeeName: string;
  departmentName: string;
  employeeIsDeleted: boolean;
  employeeDeletedOn: Date;
  scheduleName: string;
  inMarkDateTime: Date;
  inMarkOffset: number;
  inMarkLocationName: string;
  lateIn: number;
}

export interface ReportDataEarlyOutModel {
  data: ReportEarlyOutModel[];
}

export interface ReportEarlyOutModel {
  employeeName: string;
  departmentName: string;
  employeeIsDeleted: boolean;
  employeeDeletedOn: Date;
  scheduleName: string;
  earlyOut: number;
  spans: DataSpans[];
}

export interface DataSpans {
  date: Date | string;
  earlyOut: number;
}
