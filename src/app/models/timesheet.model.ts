export interface TimesheetModel {
  id?: string;
  organizationId: string;
  color?: string;
  subjects: Subjects[];
  appointments: Appointments[];
}

interface Subjects {
  subjectId: string;
  subjectType: SubjectType;
}

export interface Appointments {
  id?: string;
  description: string;
  text: string;
  recurrenceRule?: string;
  subjects?: Subjects[];
  startDate: Date;
  endDate: Date;
  color?: string;
}

export enum SubjectType {
  organization = 1,
  department = 2,
  employee = 3
}

export interface SubjectView {
  subjectType: SubjectType;
  name: string;
  subjectId: string;
}
