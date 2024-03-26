import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ReportDataLateInModel,
  ReportFilterForm,
  ReportDataAttendanceModel,
  ReportDataMarkModel,
  ReportDataViolationsModel,
} from '../models/reports.model';
import subMinutes from 'date-fns/subMinutes';
import {
  ReportDataActualHoursWorkedModel,
  ReportDataHoursWorkedModel,
} from '../models/reports.model';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  constructor(private http: HttpClient) {}

  getReportActualHoursWorked(
    params: ReportFilterForm
  ): Observable<ReportDataActualHoursWorkedModel> {
    return this.http.get<ReportDataActualHoursWorkedModel>(
      `domain-api/v1/report/presence`,
      { params }
    );
  }

  getReportHoursWorked(
    params: ReportFilterForm
  ): Observable<ReportDataHoursWorkedModel> {
    return this.http.get<ReportDataHoursWorkedModel>(
      `domain-api/v1/report/worktimepresence`,
      { params }
    );
  }

  getReportLateIn(params: ReportFilterForm): Observable<ReportDataLateInModel> {
    return this.http.get<ReportDataLateInModel>(`domain-api/v1/report/latein`, {
      params,
    });
  }

  getReportAttendance(
    start: Date,
    end: Date,
    employees: string[],
    departments: string[]
  ): Observable<ReportDataAttendanceModel> {
    return this.http.get<ReportDataAttendanceModel>(`domain-api/v1/report`, {
      params: {
        start: subMinutes(start, start.getTimezoneOffset()).toISOString(),
        end: subMinutes(end, end.getTimezoneOffset()).toISOString(),
        departmentsId: departments,
        employeesId: employees,
      },
    });
  }

  getReportMarks(params: ReportFilterForm): Observable<ReportDataMarkModel> {
    return this.http.get<ReportDataMarkModel>(`domain-api/v1/report/marks`, {
      params,
    });
  }

  getViolationsReport(
    params: ReportFilterForm
  ): Observable<ReportDataViolationsModel> {
    return this.http.get<ReportDataViolationsModel>(
      `domain-api/v1/report/violations`,
      {
        params,
      }
    );
  }
}
