import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PermissionsModel } from '../models/permissions.model';
import { DataTasksModel } from '../models/tasks.model';
import { SpansModel } from '../models/system-administration.model';

@Injectable({
  providedIn: 'root',
})
export class AdministrationService {
  constructor(private http: HttpClient) {}

  getAllPermissions(): Observable<PermissionsModel[]> {
    return this.http.get<PermissionsModel[]>('api/permission');
  }

  updateStatuses(data: { organizationId: string }) {
    return this.http.put<SpansModel>(
      `domain-api/timetable/update-statuses`,
      data,
      { observe: 'response' }
    );
  }

  bindMarks(data: SpansModel) {
    return this.http.put<SpansModel>(
      `domain-api/timetable/spans/bind-marks`,
      data,
      { observe: 'response' }
    );
  }

  createSpans(data: SpansModel) {
    return this.http.post<any>(`domain-api/timetable/spans/create`, data, {
      observe: 'response',
    });
  }

  getTasks(): Observable<DataTasksModel> {
    return this.http.get<DataTasksModel>(`domain-api/background-job-history`);
  }
}
