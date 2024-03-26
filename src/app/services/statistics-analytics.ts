import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LatecomersModel, AbsenceReportModel } from '../models/statistics-analytics.model';

@Injectable({
  providedIn: 'root',
})
export class StatisticsAnalyticsService {
  constructor(private http: HttpClient) {}

  getListLatecomers(organizationId, params?): Observable<LatecomersModel[]> {
    params ? { params } : '';
    return this.http.get<LatecomersModel[]>(
      `api/Report/latein/${organizationId}`,
      { params }
    );
  }

  getListAbsenceReport(organizationId, params?): Observable<AbsenceReportModel[]> {
    params ? { params } : '';
    return this.http.get<AbsenceReportModel[]>(
      `api/Report/absence/${organizationId}`,
      { params }
    );
  }
}
