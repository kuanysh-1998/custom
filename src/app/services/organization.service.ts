import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrganizationModel } from '../models/organization.model';
import { DataModel } from '../models/data.model';
import {
  AdministrationOrganizationCto,
  AdministrationOrganizationModel,
  AdministrationOrganizationWithLevel,
} from '../cabinet-administrator/models/organization.model';
import { AuthorizeService } from '../auth/services/authorize.service';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  constructor(
    private http: HttpClient,
    private authService: AuthorizeService
  ) {}

  get organizations(): Observable<OrganizationModel[]> {
    return this.http.get<OrganizationModel[]>('api/organization');
  }

  getOrganizationById(id: string): Observable<OrganizationModel> {
    return this.http.get<OrganizationModel>(`api/organization/${id}`).pipe(
      tap((organization) => {
        // TODO: Обновление организации в локальном хранилище
        if (organization.id === this.authService.currentOrganizationId) {
          this.saveOrganizationLocally(organization);
        }
      })
    );
  }

  getOrganizationByPartnerId(
    partnerOrganizationId: string
  ): Observable<DataModel> {
    return this.http.get<DataModel>(
      `api/Organization/ServicedBy/${partnerOrganizationId}`
    );
  }

  getAllPartner(): Observable<DataModel> {
    return this.http.get<DataModel>('api/organization/partners/extended');
  }

  getOrganizationDxUrl(): string {
    return 'api/Organization/dx?type=0';
  }

  getOrganizationDxServiceByUrl(organizationsId: string): string {
    return `api/Organization/dx/servicedby/${organizationsId}`;
  }

  getAllOrganization(
    type: number
  ): Observable<AdministrationOrganizationModel[]> {
    return this.http.get<AdministrationOrganizationModel[]>(
      `api/organization?type=${type}`
    );
  }

  getAdministrationOrganizationById(
    id: string
  ): Observable<AdministrationOrganizationModel> {
    return this.http.get<AdministrationOrganizationModel>(
      `api/organization/${id}`
    );
  }

  addOrganization(body: AdministrationOrganizationModel): Observable<string> {
    return this.http.post<string>('api/organization', body);
  }

  addOrganizationCTO(
    organizationWithCTO: AdministrationOrganizationCto
  ): Observable<boolean> {
    return this.http.post<boolean>(
      'billing-api/personal-account/create',
      organizationWithCTO
    );
  }

  addOrganizationWithLevel(
    body: AdministrationOrganizationWithLevel
  ): Observable<boolean> {
    return this.http.post<boolean>(
      'billing-api/personal-account/CreateWithLevel',
      body
    );
  }

  removeOrganization(id: string) {
    return this.http.delete(`api/organization/${id}`);
  }

  getPersonalInformationCTO(
    ownerId: string
  ): Observable<AdministrationOrganizationWithLevel> {
    return this.http.get<AdministrationOrganizationWithLevel>(
      `billing-api/personal-account/Information?owner=${ownerId}`
    );
  }

  updateOrganization(body: AdministrationOrganizationModel) {
    return this.http.put('api/organization', body);
  }

  changeLevel(body: AdministrationOrganizationWithLevel): Observable<void> {
    return this.http.put<void>(
      'billing-api/personal-account/ChangeLevel',
      body
    );
  }

  getCurrentOrganization(): OrganizationModel {
    return JSON.parse(localStorage.getItem('organization'));
  }

  private saveOrganizationLocally(organization: OrganizationModel) {
    localStorage.setItem('organization', JSON.stringify(organization));
  }
}
