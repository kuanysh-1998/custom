import { CoordinatesModel } from './coordinatesModel';

export interface LocationModel {
  id?: string;
  name: string;
  organizationId: string;
  radius: number;
  coordinates: CoordinatesModel | null;
}
