export interface SuspiciousModel {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeIsDeleted: boolean;
  employeeDeletedOn?: Date;
  departmentId: string;
  departmentName: string;
  deviceType: number;
  markDate: Date;
  markDateOffset: number;
  createdOn: Date;
  markType: number;
  locationId: string;
  locationName: string;
  coordinates: {
    longitude: number;
    latitude: number;
  };
  verified: boolean;
  isSynced: boolean;
  isForced: boolean;
  comment: string;
  fileId: string;
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
  provenLocalTime: Date;
  suspiciousCauses: SuspiciousCauses[];
}

export enum DeviceType {
  CORPORATE = 1,
  PERSONAL = 2,
}

export enum MarkType {
  IN = 0,
  OUT = 1,
}

export enum SuspiciousCauses {
  None = 0,
  PhotoNotRecognized = 1,
  LocationNotDefined = 2,
  TimetableSpanNotDefined = 3,
  TimeSpoofing = 4,
  PhotoSpoofDetected = 6,
}

export interface DataTimeTable {
  data: TimeTableList[];
}

export interface TimeTableList {
  id: string;
  date: Date | string;
  dayType: number;
  scheduleName: string;
  scheduleColor: string;
  scheduleType: number;
  workTime: {
    start: Date;
    end: Date;
  };
  employeeId: string;
  employeeName: string;
  locationId: string;
  locationName: string;
  inMarkId: string;
  outMarkId: string;
  boundaryInTime: {
    start: Date;
    end: Date;
  };
  boundaryOutTime: {
    start: Date;
    end: Date;
  };
}
