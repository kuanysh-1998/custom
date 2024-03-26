import { PermissionEnum } from 'src/app/shared/models/permission.enum';
import { PermissionsModel } from './permissions.model';

export interface AdministrationUserModel {
  id: string;
  name: {
    firstName: string;
    lastName: string;
    middleName: string;
  };
  firstName: string;
  lastName: string;
  middleName: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  departmentId: string;
  departmentName: string;
  organizationId: string;
  organizationName: string;
  azureEmployee: string;
  externalId_1C: string;
  phone: string;
  iin: string;
  createdOn: Date;
  isDeleted: boolean;
  blockAuthentication: boolean;
}

export interface IRightsCategory {
  name: string;
  codes: PermissionEnum[];
}

export interface IUserPermissionsSelection {
  permissions: PermissionsModel[];
  selectedPermissions: PermissionsModel[];
}

export interface PasswordButton {
  icon: string;
  onClick: () => void;
}
