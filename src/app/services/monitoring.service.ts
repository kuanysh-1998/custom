import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ReportDataEarlyOutModel,
  LateFilterForm,
  EarlyOutFilterForm,
  AbsenceFilterForm,
} from '../models/monitoring.model';
import {
  ReportDataAbsenceModel,
  ReportDataLateModel,
} from '../models/monitoring.model';

@Injectable({
  providedIn: 'root',
})
export class MonitoringService {
  constructor(private http: HttpClient) {}

  getReportAbsence(
    params: AbsenceFilterForm
  ): Observable<ReportDataAbsenceModel> {
    return this.http.get<ReportDataAbsenceModel>(
      `domain-api/monitoring/absence`,
      { params }
    );
  }

  getReportLate(params: LateFilterForm): Observable<ReportDataLateModel> {
    return this.http.get<ReportDataLateModel>(`domain-api/monitoring/latein`, {
      params,
    });
  }

  getReportEarlyOut(
    params: EarlyOutFilterForm
  ): Observable<ReportDataEarlyOutModel> {
    return this.http.get<ReportDataEarlyOutModel>(
      `domain-api/monitoring/earlyout`,
      {
        params,
      }
    );
  }
}
