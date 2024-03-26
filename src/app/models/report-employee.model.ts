import { Injectable } from '@angular/core';
import { DisplayValueModel } from '../shared/models/display-value.model';
import { LocalizationService } from '../shared/services/localization.service';
import { SubjectType } from './timesheet.model';

export interface ReportEmployeeModel {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeIsDeleted: boolean;
  employeeDeletedOn?: Date;
  departmentId: string;
  departmentName: string;
  eventDate: Date;
  localEventDate?: Date;
  utcEventDate: Date;
  eventDateOffset: number;
  eventType: number;
  locationId: string;
  locationName: string;
  verified: boolean;
  createdOn: Date;
  isSynced: boolean;
  comment: string;
  fileId: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  timetableSpan: {
    id: string;
    date: string;
    dayType: number;
    scheduleName: string;
    workTime: {
      start: Date;
      end: Date;
    };
  };
}

export interface ReportDataActualHoursWorkedModel {
  data: ReportActualHoursWorkedModel[];
}

export interface ReportActualHoursWorkedModel {
  employeeId: string;
  employeeName: string;
  departmentId: string;
  departmentName: string;
  workedTimeInMinutes: number;
  localEventDateIn: Date;
  localEventDateOut: Date;
  locationIdIn: string;
  locationNameIn: string;
  verifiedIn: boolean;
  locationIdOut: string;
  locationNameOut: string;
  verifiedOut: boolean;
}

export interface EventModel {
  id?: string;
  organizationId: string;
  employeeId: string;
  locationId: string;
  eventDate: string;
  eventType: EventType;
}

export interface ReportsModel {
  data: ReportsDataModel[];
  totalCount: number;
}

export interface ReportsDataModel {
  employeeId: string;
  employeeName: string;
  departmentId: string;
  departmentName: string;
  schedules: [
    {
      id: string;
      name: string;
    }
  ];
  durationsPerDay: [
    {
      date: Date;
      duration: string;
    }
  ];
  totalDuration: string;
}

interface Subjects {
  subjectId: string;
  subjectType: SubjectType;
}

export interface SendDataReportModel {
  organizationId: string;
  start: string;
  end: string;
  skip: number;
  take: number;
  subjects: Subjects[];
}

export enum EventType {
  IN = 0,
  OUT = 1,
  BIOMATRIX = 2,
}

@Injectable({ providedIn: 'root' })
export class EventTypesProvider {
  public readonly values: DisplayValueModel<EventType>[];
  constructor(private localization: LocalizationService) {
    this.values = this.getEventTypes();
  }

  getEventTypes(): DisplayValueModel<EventType>[] {
    return [
      { display: this.localization.getSync('Приход'), value: EventType.IN },
      { display: this.localization.getSync('Уход'), value: EventType.OUT },
      {
        display: this.localization.getSync('Biomatrix'),
        value: EventType.BIOMATRIX,
      },
    ];
  }
}

export interface PairedEventReportExtendedByDay {
  eventDate: Date;
  plannedWorkedTimeInMinutes: number;
  workedTimeInMinutes: number;
  workedTimeInMinutesWithinPlan: number;
  plannedEventDateIn?: Date;
  eventDateIn?: Date;
  locationNameIn: string;
  verifiedIn: boolean;
  plannedEventDateOut?: Date;
  eventDateOut?: Date;
  locationNameOut: string;
  verifiedOut: boolean;
  lateInTimeInMinutes: number;
  overTimeInMinutes: number;
  earlyOutTimeInMinutes: number;
  deficiencyTimeInMinutes: number;
  earlyInTimeInMinutes: number;
  lateOutTimeInMinutes: number;
}

export interface PairedEventReportExtendedEmployee {
  id: string;
  name: string;
  isDeleted: boolean;
  deletedOn: Date;
  departmentName: string;
}

export interface PairedEventReportExtended {
  employee: PairedEventReportExtendedEmployee;
  report: PairedEventReportExtendedByDay[];
  totalLateInTimeInMinutes: number;
  totalOverTimeInMinutes: number;
  totalEarlyOutTimeInMinutes: number;
  totalDeficiencyTimeInMinutes: number;
  totalWorkedTimeInMinutes: number;
  totalWorkedTimeInMinutesWithinPlan: number;
  totalWorkedDays: number;
  totalEarlyInTimeInMinutes: number;
  totalLateOutTimeInMinutes: number;
}

export interface EmployeeBlockData {
  locationName: string;
  departmentName?: string;
  timetableSpan?: {
    id: string;
    date: string;
    dayType: number;
    scheduleName: string;
    workTime: {
      start: Date;
      end: Date;
    };
  };
  comment: string;
  eventType?: number;
  id?: string;
}

export interface UpdateMarkData {
  markId: string;
  timetableSpanId: string;
}
