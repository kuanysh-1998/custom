import { Pipe, PipeTransform } from '@angular/core';
import { LocationModel } from '../../../../models/location.model';

@Pipe({
  name: 'locationName',
})
export class LocationNamePipe implements PipeTransform {
  transform(locationId: string, locations: LocationModel[]): string {
    if (!locationId) {
      return '-';
    }
    const location = locations.find((l) => l.id === locationId);

    if (location) {
      return location.name;
    }

    return '-';
  }
}
