import { Injectable } from '@angular/core';
import {TimesheetModel} from '../models/timesheet.model';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimesheetService {

  constructor(
    private http: HttpClient
  ) { }

  getTimesheet(organizationId: string): Observable<TimesheetModel[]> {
    return this.http.get<TimesheetModel[]>(`api/schedule/organization/${organizationId}`);
  }

  addTimesheet(body: TimesheetModel): Observable<TimesheetModel> {
    return this.http.post<TimesheetModel>('api/Schedule', body);
  }

  updateTimesheet(body: TimesheetModel): Observable<TimesheetModel> {
    return this.http.put<TimesheetModel>('api/Schedule', body);
  }

  deleteTimesheet(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`api/Schedule/${id}`);
  }

}
