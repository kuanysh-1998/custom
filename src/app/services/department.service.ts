import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DepartmentModel } from '../models/department.model';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  constructor(private http: HttpClient) {}

  getAllDepartmentUrl(currentOrganizationId: string) {
    return `api-department/getall/dx/${currentOrganizationId}`;
  }

  getAllDepartment(organizationId: string): Observable<DepartmentModel[]> {
    return this.http.get<DepartmentModel[]>(
      `api-department/getAll/${organizationId}`
    );
  }

  addDepartment(body: DepartmentModel): Observable<DepartmentModel> {
    return this.http.post<DepartmentModel>('api-department', body);
  }

  getDepartmentById(id: string) {
    return this.http.get<DepartmentModel>(`api-department/${id}`);
  }

  updateDepartment(body: DepartmentModel) {
    return this.http.put('api-department', body);
  }

  removeDepartment(id: string) {
    return this.http.delete(`api-department/${id}`);
  }
}
