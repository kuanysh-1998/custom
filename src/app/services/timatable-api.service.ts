import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  TimetableEditForm,
  TimetablesEditForm,
} from '../main/feature-modules/schedule/models/timetable';
import { Observable } from 'rxjs';
import { UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class TimetableApiService {
  constructor(private http: HttpClient) {}

  url = (id: string) => {
    return `domain-api/timetable/by-schedule/${id}`;
  };

  edit(form: TimetableEditForm) {
    return this.http.put<void>(`domain-api/timetable/change`, {
      ...form,
    });
  }

  editBatch(form: TimetablesEditForm) {
    return this.http.put<void>(`domain-api/timetable/change-batch`, {
      ...form,
    });
  }

  deleteTimetables(timetablesToDelete: {
    timetablesId: string[];
  }): Observable<void> {
    return this.http.delete<void>(`domain-api/timetable/delete-batch`, {
      body: timetablesToDelete,
    });
  }

  reprocess(id: string): Observable<void> {
    const url = `domain-api/timetable/${id}/spans/reprocess`;
    return this.http.post<void>(url, {});
  }
}
