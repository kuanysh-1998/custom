import { AuthorizeService } from '../auth/services/authorize.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  EmployeeCreationModel,
  EmployeeDetail,
  EmployeeModel,
  EmployeeUpdateModel,
} from '../models/employee.model';
import { InterceptorSkipHandleErrors } from '../auth/services/authorize.interceptor';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  constructor(private http: HttpClient, private auth: AuthorizeService) {}

  getAllEmployeeUrl() {
    return `api/employee`;
  }

  uploadExcelFile(file: File) {
    const formData = new FormData();
    formData.append('file', file, file.name);
    const headers = {};
    headers[InterceptorSkipHandleErrors] = 'true';

    return this.http.post('api/Employee/create-from-excel', formData, {
      headers,
    });
  }

  uploadZipFile(file: File, departmentId: string): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('employeesArchive', file, file.name);

    const url = `${'api/Employee/import-from-archive'}?departmentId=${departmentId}`;

    return this.http.post(url, formData);
  }

  changePermissions(
    employeeId: string,
    permissions: Array<string>
  ): Observable<void> {
    return this.http.put<void>(
      `api/Employee/${employeeId}/change-permissions`,
      permissions
    );
  }

  blockEmployee(id: string): Observable<void> {
    return this.http.put<void>(`api/Employee/${id}/block/`, {});
  }

  unblockEmployee(id: string): Observable<void> {
    return this.http.put<void>(`api/Employee/${id}/unblock/`, {});
  }

  uploadEmployeePhotos(formData: FormData, employeeId: string) {
    const url = `api/employee/photo/add-batch?employeeId=${employeeId}`;
    return this.http.post(url, formData);
  }
  
  getTimetablesByEmployeeIdUrl(employeeId: string) {
    return `domain-api/timetable/by-employee/${employeeId}`;
  }

  getAllEmployeeDx() {
    const filterParam = encodeURIComponent('["isDeleted", "=", false]');
    return this.http.get<any>(`api/employee?filter=${filterParam}`);
  }

  getAllEmployeesTotalCount() {
    const filterParam = encodeURIComponent('["isDeleted", "=", false]');
    const requireTotalCountParam = 'true';
    return this.http.get<any>(
      `api/employee?filter=${filterParam}&requireTotalCount=${requireTotalCountParam}`
    );
  }

  addEmployee(
    employee: EmployeeCreationModel
  ): Observable<EmployeeCreationModel> {
    return this.http.post<EmployeeCreationModel>(
      'api/Employee/create',
      employee
    );
  }

  removePhotoEmployee(
    employeeId: string,
    photoId: string
  ): Observable<boolean> {
    return this.http.delete<boolean>(
      `api/employee/${employeeId}/photo/${photoId}`
    );
  }

  getEmployeeById(id: string): Observable<EmployeeDetail> {
    return this.http.get<EmployeeDetail>(`api/employee/${id}`);
  }

  updateEmployee(employee: EmployeeUpdateModel): Observable<void> {
    return this.http.put<void>(`api/Employee/change`, employee);
  }

  removeEmployee(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`api/employee/${id}`);
  }
}
