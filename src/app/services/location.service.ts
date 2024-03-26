import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocationModel } from '../models/location.model';
import { DepartmentModel } from '../models/department.model';
import { RadiusModel } from '../models/radius.model';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  constructor(private http: HttpClient) {}

  getAllLocationDxUrl(organizationId: string): string {
    return `api/location/getAll/dx/${organizationId}`;
  }

  getAllLocation(organizationId: string): Observable<LocationModel[]> {
    return this.http.get<LocationModel[]>(
      `api/location/getAll/${organizationId}`
    );
  }

  addLocation(body: LocationModel): Observable<LocationModel> {
    return this.http.post<LocationModel>('api/location', body);
  }

  getLocationById(id: string) {
    return this.http.get<DepartmentModel>(`api/location/${id}`);
  }

  getRadiusDictionary(): Observable<RadiusModel[]> {
    return this.http.get<RadiusModel[]>('api/location/radius/getall');
  }

  updateLocation(body: LocationModel) {
    return this.http.put('api/location', body);
  }

  removeLocation(id: string) {
    return this.http.delete(`api/location/${id}`);
  }
}
