import { AuthorizeService } from './../auth/services/authorize.service';
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LicenceTypeModel } from '../models/licences/licence-type.model';
import { LicenseDataModel } from '../models/licences/licence.model';
import { InterceptorSkipHandleErrors } from '../auth/services/authorize.interceptor';
import {
  LicenceTableModel,
  LicenseSearchModel,
} from '../models/licences/licence.model';
import { TariffPrefix, OptimalTariff } from '../models/licences/tariff.model';

@Injectable({
  providedIn: 'root',
})
export class LicenceService {
  constructor(private http: HttpClient, private auth: AuthorizeService) {}

  getCurrentLicences(subject: string): Observable<LicenseDataModel> {
    return this.http.get<LicenseDataModel>(
      `billing-api/license/current?subject=${subject}`
    );
  }

  create(subject: string, prefixes: TariffPrefix[]): Observable<void> {
    return this.http.post<void>('billing-api/license/create', {
      subject: subject,
      prefixes: prefixes,
    });
  }

  activate(id: number): Observable<void> {
    return this.http.post<void>(`billing-api/license/${id}/activate`, {});
  }

  revoke(id: number): Observable<void> {
    return this.http.post<void>(`billing-api/license/${id}/revoke`, {
      comment: 'no comment',
    });
  }

  cancel(id: number): Observable<void> {
    return this.http.post<void>(`billing-api/license/${id}/cancel`, {
      comment: 'no comment',
    });
  }

  getOptimalTariff(
    employeeNumber: number,
    days: number,
    subject: string
  ): Observable<OptimalTariff> {
    return this.http.get<OptimalTariff>(
      `billing-api/license/optimal?employeeNumber=${employeeNumber}&days=${days}&subject=${subject}`
    );
  }
}
