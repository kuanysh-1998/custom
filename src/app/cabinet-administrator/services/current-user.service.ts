import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EmployeeDetail } from 'src/app/models/employee.model';

@Injectable()
export class CurrentUserService {
  private currentUserSubject = new ReplaySubject<EmployeeDetail>(1);

  user$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  getCurrentUserByEmployeeId(
    employeeId: string
  ): Observable<EmployeeDetail> {
    return this.http.get<EmployeeDetail>(`api/Employee/${employeeId}`);
  }

  setCurrentUser(user: EmployeeDetail): void {
    this.currentUserSubject.next(user);
  }
}
