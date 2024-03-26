import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import {
  EventModel,
  PairedEventReportExtended,
  ReportEmployeeModel,
  ReportsModel,
  SendDataReportModel,
} from '../models/report-employee.model';
import { HttpClient } from '@angular/common/http';
import subMinutes from 'date-fns/subMinutes';
import { ReportDataActualHoursWorkedModel } from '../models/report-employee.model';

@Injectable({
  providedIn: 'root',
})
export class ReportEmployeeService {
  public dataSubject = new Subject<number>();
  public data$ = this.dataSubject.asObservable();
  private dataLoadedSubject = new Subject<void>();
  public dataLoaded$ = this.dataLoadedSubject.asObservable();
  private pagesLoaded: { [pageIndex: number]: boolean } = {};
  private itemsPerPage: { [pageIndex: number]: number } = {};

  constructor(private http: HttpClient) {}

  updateMark(markId: string, timetableSpanId: string): Observable<void> {
    const body = { markId, timetableSpanId };
    return this.http.put<void>('domain-api/mark/change', body);
  }

  getReportActualHoursWorked(
    organizationId,
    params?
  ): Observable<ReportDataActualHoursWorkedModel> {
    params ? { params } : '';
    return this.http.get<ReportDataActualHoursWorkedModel>(
      `api/Report/inout/${organizationId}/paired`,
      { params }
    );
  }

  sendDataLate(body: SendDataReportModel): Observable<ReportsModel> {
    return this.http.post<ReportsModel>('api/Report/LateArrival', body);
  }

  sendDataHouseWorked(body: SendDataReportModel): Observable<ReportsModel> {
    return this.http.post<ReportsModel>('api/Report/WorkedHours', body);
  }

  sendDataEarly(body: SendDataReportModel): Observable<ReportsModel> {
    return this.http.post<ReportsModel>('api/Report/EarlyDeparture', body);
  }

  addEvent(body: EventModel): Observable<EventModel> {
    return this.http.post<EventModel>(`domain-api/mark/manual`, body);
  }

  deleteEvent(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`domain-api/mark/${id}`);
  }

  getInOutPairedExtended(
    organizationId: string,
    start: Date,
    end: Date,
    employees: string[],
    departments: string[],
    locations: string[]
  ): Observable<PairedEventReportExtended[]> {
    return this.http.get<PairedEventReportExtended[]>(
      `api/Report/inout/${organizationId}/paired/extended`,
      {
        params: {
          start: subMinutes(start, start.getTimezoneOffset()).toISOString(),
          end: subMinutes(end, end.getTimezoneOffset()).toISOString(),
          departmentsId: departments,
          employeesId: employees,
          locationsId: locations,
        },
      }
    );
  }

  areDataLoadedForPage(pageIndex: number): boolean {
    return !!this.pagesLoaded[pageIndex];
  }

  getItemsCountOnPage(pageIndex: number): number {
    return this.itemsPerPage[pageIndex] || 0;
  }

  notifyDataLoaded() {
    this.dataLoadedSubject.next();
  }

  setPageLoaded(pageIndex: number, loaded: boolean): void {
    this.pagesLoaded[pageIndex] = loaded;
  }

  setItemsPerPage(pageIndex: number, count: number): void {
    this.itemsPerPage[pageIndex] = count;
  }

  changeData(value: number) {
    this.dataSubject.next(value);
  }
}
