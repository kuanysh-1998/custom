import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  DeviceInfo,
  DeviceModel,
  PersonalDeviceModel,
} from '../models/device.model';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  constructor(private http: HttpClient) {}

  getInfo(organizationId: string): Observable<DeviceInfo> {
    return this.http.get<DeviceInfo>(`api/device/info/${organizationId}`);
  }

  getInfoPersonal(organizationId: string): Observable<DeviceInfo> {
    return this.http.get<DeviceInfo>(
      `api/device/personal/info/${organizationId}`
    );
  }

  getAllDevice(id: string): Observable<DeviceModel[]> {
    return this.http.get<DeviceModel[]>(`api/device/getAll/${id}`);
  }

  getAllPersonalDevice(id: string): Observable<PersonalDeviceModel[]> {
    return this.http.get<PersonalDeviceModel[]>(
      `api/device/personal/getAll/${id}`
    );
  }

  getPersonalDeviceId(id: string): Observable<PersonalDeviceModel> {
    return this.http.get<PersonalDeviceModel>(`api/device/personal/${id}`);
  }

  getDeviceById(id: string): Observable<DeviceModel> {
    return this.http.get<DeviceModel>(`api/device/${id}`);
  }

  updateDevice(body: DeviceModel): Observable<void> {
    return this.http.put<void>('api/device', body);
  }

  updatePersonalDevice(body: PersonalDeviceModel): Observable<void> {
    return this.http.put<void>('api/device/personal', body);
  }

  approveDevice(id: string): Observable<void> {
    return this.http.put<void>(`api/Device/${id}/approve`, id);
  }

  rejectDevice(id: string): Observable<void> {
    return this.http.put<void>(`api/Device/${id}/reject`, id);
  }

  removeDevice(serialId: string): Observable<void> {
    return this.http.delete<void>(`api/device/${serialId}`);
  }
}
