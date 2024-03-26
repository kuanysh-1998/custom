export interface AdministrationOrganizationModel {
  id?: string;
  name: string;
  isPartner: boolean;
  servingOrganizationId?: string;
  servingOrganizationName?: string;
}

export interface AdministrationOrganizationCto{
  ownerId: string;
}

export interface AdministrationOrganizationWithLevel extends AdministrationOrganizationCto {
  level: string;
}
