import DataSource from 'devextreme/data/data_source';
import { Component, Inject, OnInit } from '@angular/core';
import { HttpCustom } from '../../../../shared/http';
import { PersonalAccountModel } from '../../../../models/personal-account.model';
import { OrganizationService } from '../../../../services/organization.service';
import { OrganizationModel } from '../../../../models/organization.model';
import { Observable } from 'rxjs';
import { BalanceManagementComponent } from '../balance-management/balance-management.component';
import { PermissionEnum } from '../../../../shared/models/permission.enum';
import { DisplayValueModel } from 'src/app/shared/models/display-value.model';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { DIALOG_DATA } from 'src/app/shared/tokens/dialog-data.token';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';

@Component({
  selector: 'app-view-personal-info',
  templateUrl: './view-personal-info.component.html',
  styleUrls: ['./view-personal-info.component.scss'],
})
export class ViewPersonalInfoComponent implements OnInit {
  balanceHistory: DataSource;
  levelName: string;
  levelTypes: DisplayValueModel<number>[];
  organization: Observable<OrganizationModel>;
  PermissionType = PermissionEnum;

  constructor(
    @Inject(DIALOG_DATA)
    public data: { personal: PersonalAccountModel; initiator },
    private http: HttpCustom,
    private organizationService: OrganizationService,
    private localization: LocalizationService,
    private dialogService: DialogService
  ) {
    this.levelTypes = [1, 2, 3, 4, 5].map((x) => {
      return {
        display: this.localization.getSync('Уровень __level__', { level: x }),
        value: x,
      };
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.balanceHistory = new DataSource(
      this.http.createStore(
        'id',
        `billing-api/personal-account/BalanceHistory?owner=${this.data.personal.owner}`
      )
    );
    this.levelName = this.levelTypes.find(
      (x) => x.value === this.data.personal.level
    ).display;
    this.organization = this.organizationService.getOrganizationById(
      this.data.personal.owner
    );
  }

  topUpBalance(): void {
    this.dialogService.show('Пополнение баланса', {
      componentType: BalanceManagementComponent,
      componentData: {
        component: 'toUpBalance',
        organizationId: this.data.personal.owner,
        description: this.localization.getSync('Сумма баланса'),
        initiator: this.data.initiator,
      },
      onClose: (result) => {
        if (result.saved) {
          this.balanceHistory.reload();
        }
      },
    });
  }

  addOverdraft(): void {
    this.dialogService.show('Изменение овердрафта', {
      componentType: BalanceManagementComponent,
      componentData: {
        component: 'addOverdraft',
        organizationId: this.data.personal.owner,
        description: this.localization.getSync('Сумма овердрафта'),
        initiator: this.data.initiator,
      },
      onClose: (result) => {
        if (result.saved) {
          this.balanceHistory.reload();
        }
      },
    });
  }
}
