export interface BalanceManagementModel {
  title: string;
  organizationId: string;
  description: string;
  component: string;
  initiator: string;
}

export interface BalanceModel {
  ownerId: string;
  sum: string;
  comment: string;
  initiator: string;
}

export interface OverdraftModel {
  owner: string;
  overdraft: string;
  comment: string;
  initiator: string;
}
