import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {PermissionGroupModel} from "../models/permission-group.model";

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor(
    private http: HttpClient
  ) { }

  getPermissionGroup(organizationId: string): Observable<PermissionGroupModel> {
    return this.http.get<PermissionGroupModel>(`api/organization/${organizationId}/permissiongroup`);
  }

  updatePermissionGroup(data: PermissionGroupModel): Observable<PermissionGroupModel> {
    return this.http.put<PermissionGroupModel>(`api/organization/${data.organizationId}/permissiongroup`,
      {
        personalDeviceLoggingWithoutLocation: data.personalDeviceLoggingWithoutLocation,
        integrationWith_1C: data.integrationWith_1C,
        commentInEvents: data.commentInEvents,
        commentOutEvents: data.commentOutEvents,
        generalDevicePhotoRecognitionRetryNumber: data.generalDevicePhotoRecognitionRetryNumber
      });
  }
}
