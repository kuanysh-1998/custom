export interface LicenceModel {
  subject: string;
  prefix: string;
}

export interface LicenceActivateModel {
  subjects: string[];
}

export interface LicenseDetailsModel {
  subject: string;
  number: string;
  prefix: string;
  status: string;
  employeeMaxNumber: string;
  licenseTypeName: {
    ru: string;
    en: string;
  };
  created: Date;
  activated: Date;
  expiring: Date;
}

export interface LicenseDataModel {
  id: number;
  manualActivationAllowed: boolean;
  name: string;
  subject: string;
  subjectName: string;
  owner: string;
  ownerName: string;
  number: string;
  prefix: string;
  status: number;
  days: number;
  employeeMaxNumber: number;
  created: string;
  activated: string;
  actualPrice: number;
  initialPrice: number;
  clientPrice: number;
  expiring: string;
}

export interface LicenceTableModel {
  data: LicenseDataModel[];
  totalCount: number;
}

export interface LicenseSearchModel {
  subject: string;
  status: string | number;
  prefix: string;
  employeeNumberMin: string | number;
  employeeNumberMax: string | number;
  activatedStart: string;
  activatedEnd: string;
  expiringStart: string;
  expiringEnd: string;
  createdStart: string;
  createdEnd: string;
}

