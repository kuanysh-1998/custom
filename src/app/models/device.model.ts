import {OrganizationModel} from './organization.model';
import {EmployeeModel} from './employee.model';

export interface DeviceModel {
  id?: string;
  serialNumber: string;
  organizationId: string;
  name: string;
  pinCode: string;
  locationId: string;
  isDynamic: boolean;
}

export interface PersonalDeviceModel {
  id?: string;
  serialNumber: string;
  organizationId: string;
  organization: OrganizationModel;
  name: string;
  pinCode: string;
  locationsId: string[];
  employeeId: EmployeeModel;
  employee: EmployeeModel;
  employeeFullname: string;
  photoId: string;
  verified: string;
  approved: string;
  locationId: string;
  isDynamic: boolean;
}

export interface DeviceInfo {
  qrCode: string;
  code: string;
}

export interface DevicePersonalInfo {
  link: string;
}
