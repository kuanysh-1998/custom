import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  PublishedEditForm,
  PublishScheduleForm,
  Schedule,
  ScheduleCreateForm,
  ScheduleEditForm,
} from '../main/feature-modules/schedule/models/schedule-models';
import { Observable, BehaviorSubject } from 'rxjs';
import { InterceptorSkipHandleErrors } from '../auth/services/authorize.interceptor';

@Injectable({
  providedIn: 'root',
})
export class ScheduleAPIService {
  private currentPageSubject = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {}

  getScheduleURL() {
    return 'domain-api/v1/schedule';
  }

  updateSchedule(scheduleForm: PublishedEditForm): Observable<void> {
    return this.http.post<void>(`domain-api/v1/schedule/change`, {
      ...scheduleForm,
    });
  }

  saveDraft(draft: ScheduleCreateForm): Observable<string> {
    return this.http.post<string>('domain-api/v1/schedule/create', {
      ...draft,
    });
  }

  publish(publishForm: PublishScheduleForm): Observable<string> {
    const headers = {};
    headers[InterceptorSkipHandleErrors] = 'true';
    return this.http.post<string>(
      'domain-api/v1/schedule/publish',
      {
        ...publishForm,
      },
      { headers }
    );
  }

  getSchedule(id: string): Observable<Schedule> {
    return this.http.get<Schedule>(`domain-api/v1/schedule/${id}`);
  }

  deleteSchedule(id: string): Observable<void> {
    return this.http.delete<void>(`domain-api/v1/schedule/${id}`);
  }

  setCurrentPage(page: number) {
    this.currentPageSubject.next(page);
  }

  getCurrentPage() {
    return this.currentPageSubject.asObservable();
  }
}
