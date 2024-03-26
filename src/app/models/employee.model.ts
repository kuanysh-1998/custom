import { TimetableStatus } from '../main/feature-modules/schedule/models/timetable';

export interface EmployeeModel {
  id: string;
  name: {
    firstName: string;
    lastName: string;
    middleName: string;
  };
  fullName: string;
  email: string;
  departmentId: string;
  departmentName: string;
  organizationId: string;
  azureEmployee: string;
  externalId_1C: string;
  phone: string;
  createdOn: string;
  isDeleted: boolean;
}

interface Permission {
  id: string;
  code: number;
  name: string;
}

export interface EmployeeDetail {
  id: string;
  name: {
    firstName: string;
    lastName: string;
    middleName: string;
  };
  fullName: string;
  email: string;
  dateOfBirth: string;
  photoId: string;
  photos: string[];
  departmentId: string;
  departmentName: string;
  organizationId: string;
  organizationName: string;
  azureEmployee: string;
  externalId_1C: string;
  phone: string;
  iin: string;
  createdOn: string;
  isDeleted: boolean;
  blockAuthentication: boolean;
  permissions: Permission[];
}

export interface EmployeeCreationModel {
  firstName: string;
  lastName: string;
  middleName?: string;
  email?: string;
  dateOfBirth?: string;
  departmentId: string;
  externalId_1C?: string;
  password?: string;
  iin?: string;
}

export interface EmployeeUpdateModel {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email?: string;
  dateOfBirth?: string;
  departmentId: string;
  externalId_1C?: string;
  password?: string;
  iin?: string;
}

export interface EmployeePhoto {
  id: string;
  url: string;
  isLoading: boolean;
  isServerLoaded: boolean;
  file?: File;
}

export interface EmployeeTimetable {
  id: string;
  employeeName: string;
  departmnetName: string;
  scheduleName: string;
  startDate: string;
  endDate: string;
  status: TimetableStatus;
}

export enum EmployeeTypeModel {
  ADMIN,
  EMPLOYEE,
  HR,
}
