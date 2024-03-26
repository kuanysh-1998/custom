import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SchedulerDay, SchedulerFilterForm } from '../models/scheduler-models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SchedulerService {
  constructor(private http: HttpClient) {}

  getSpansForCalendar(params: SchedulerFilterForm): Observable<SchedulerDay[]> {
    return this.http.get<SchedulerDay[]>(
      `domain-api/timetable/spans/for-calendar`,
      { params }
    );
  }
}
