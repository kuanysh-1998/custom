import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {PartnerModel} from '../models/partner.model';
import {PersonalAccountModel} from '../models/personal-account.model';
import {BalanceModel, OverdraftModel} from '../models/billing.model';

@Injectable({
  providedIn: 'root'
})
export class BillingService {

  constructor(
    private http: HttpClient
  ) { }

  getInformationAllPartner(): Observable<PartnerModel> {
    return this.http.get<PartnerModel>('api/Partner');
  }

  getPersonalInformation(organizationId: string): Observable<PersonalAccountModel> {
    return this.http.get<PersonalAccountModel>(`billing-api/personal-account/Information?owner=${organizationId}`);
  }

  topUpBalance(body: BalanceModel): Observable<void> {
    return this.http.post<void>('billing-api/personal-account/Deposit', body);
  }

  addOverdraft(body: OverdraftModel): Observable<void> {
    return this.http.put<void>('billing-api/personal-account/Overdraft', body);
  }
}
