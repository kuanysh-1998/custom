export interface OrganizationModel {
  id: string;
  name: string;
  isPartner: boolean;
  servingOrganizationId: string;
  servingOrganizationName: string;
  usingNewSchedules: boolean;
}
