import { AuthorizeService } from './../../../auth/services/authorize.service';
import { Component, OnInit } from '@angular/core';
import { PersonalAccountModel } from '../../../models/personal-account.model';
import { BillingService } from '../../../services/billing.service';
import { HttpCustom } from '../../../shared/http';
import { OrganizationModel } from '../../../models/organization.model';
import { OrganizationService } from '../../../services/organization.service';
import { PermissionEnum } from "../../../shared/models/permission.enum";
import DataSource from 'devextreme/data/data_source';
import { DisplayValueModel } from 'src/app/shared/models/display-value.model';
import { LocalizationService } from 'src/app/shared/services/localization.service';

@Component({
  selector: 'app-personal-account',
  templateUrl: './personal-account.component.html',
  styleUrls: ['./personal-account.component.scss']
})
export class PersonalAccountComponent implements OnInit {
  personalAccount: PersonalAccountModel;
  balanceHistory: DataSource;
  organization: OrganizationModel;
  levelType: DisplayValueModel<number>[];
  levelName: string;
  PermissionType = PermissionEnum;

  constructor(
    private service: BillingService,
    private organizationService: OrganizationService,
    private auth: AuthorizeService,
    private http: HttpCustom,
    private localization: LocalizationService
  ) {
    this.levelType = [1, 2, 3, 4, 5].map(x => {
      return { display: this.localization.getSync("Уровень __level__", { level: x }), value: x };
    });
  }

  ngOnInit(): void {
    this.service.getPersonalInformation(this.auth.currentOrganizationId).subscribe(res => {
      this.personalAccount = res;
      this.levelName = this.levelType.find(x => x.value === res.level).display;
    });
    this.balanceHistory = new DataSource(this.http.createStore('id', `billing-api/personal-account/BalanceHistory?owner=${this.auth.currentOrganizationId}`));
    this.organizationService.getOrganizationById(this.auth.currentOrganizationId)
      .subscribe(res => {
        this.organization = res;
      });
  }
}
