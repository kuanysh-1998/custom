import {UserType} from "./usertype";
import {EventType} from "./report-employee.model";

export interface UserModel {
  id: number;
  userName: string;
  fullName: string;
  organizationId: string;
  email: string;
  lockoutEnabled: boolean;
  userType?: UserType;
  eventType?: EventType;
}
