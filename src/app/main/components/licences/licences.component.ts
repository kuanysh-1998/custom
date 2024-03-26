import { AuthorizeService } from '../../../auth/services/authorize.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { LicenceService } from '../../../services/licence.service';
import { OrganizationService } from '../../../services/organization.service';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import DataSource from 'devextreme/data/data_source';
import { HttpCustom } from '../../../shared/http';
import { OrganizationModel } from '../../../models/organization.model';
import { combineLatest } from 'rxjs';
import { LocalizationService } from '../../../shared/services/localization.service';
import { PermissionEnum } from '../../../shared/models/permission.enum';
import { AddLicenseComponent } from '../../dialog/license/add-license/add-license.component';
import { LicenseDataModel } from '../../../models/licences/licence.model';
import { LicenseStatus } from '../../../models/license-status.model';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { WpMessageComponent } from 'src/app/shared/components/wp-message/wp-message.component';

export enum LicenseActionType {
  activate = 'activate',
  cancel = 'cancel',
  'revoke' = 'revoke',
}

@UntilDestroy()
@Component({
  selector: 'app-licences',
  templateUrl: './licences.component.html',
  styleUrls: ['./licences.component.scss'],
})
export class LicencesComponent implements OnInit {
  @ViewChild('grid', { static: false }) grid: DxDataGridComponent;

  licencesDataSource: DataSource;
  licences: LicenseDataModel[];
  uniqueLicences: LicenseDataModel[];
  organizations: OrganizationModel[] = [];
  isContextMenuVisible: boolean = false;

  statuses: { name: string; value: number }[] = [
    { name: this.localization.getSync('Создана'), value: 0 },
    {
      name: this.localization.getSync('Активна'),
      value: 1,
    },
    {
      name: this.localization.getSync('Истек срок'),
      value: 2,
    },
    { name: this.localization.getSync('Отозвана'), value: 3 },
    { name: this.localization.getSync('Отменена'), value: 4 },
  ];

  permissions: PermissionEnum[] = this.authService.getPermissions();
  contextMenuStatuses: boolean[] = [];

  get PermissionType() {
    return PermissionEnum;
  }

  constructor(
    private licenceService: LicenceService,
    private organizationService: OrganizationService,
    private authService: AuthorizeService,
    private localization: LocalizationService,
    private http: HttpCustom,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.organizationService.getOrganizationById(
        this.authService.currentOrganizationId
      ),
      this.organizationService.getOrganizationByPartnerId(
        this.authService.currentOrganizationId
      ),
    ]).subscribe(([organization, organizationsData]) => {
      const merged = [organization, ...organizationsData.data];
      const uniqueIds = [...new Set(merged.map((x) => x.id))];
      this.organizations = uniqueIds.map((id) =>
        merged.find((x) => x.id === id)
      );
    });

    this.initLicences();
  }

  initLicences() {
    const dataStore = this.http.createStore(
      'id',
      'domain-api/LicenseOrganization'
    );
    dataStore.on('loaded', (data) => {
      const licenseDataModels = data.data as LicenseDataModel[];
      licenseDataModels.forEach((element: LicenseDataModel, index: number) => {
        element['menuItems'] = this.getMenuItems(element);
        this.contextMenuStatuses[index] = false;
      });
    });

    this.licencesDataSource = new DataSource({
      store: dataStore,
      pageSize: 0,
    });

    this.licencesDataSource.load().then((licences) => {
      this.licences = licences;

      const uniqueSubjectNames = new Set(
        licences.map((licence) => licence.subjectName)
      );
      this.uniqueLicences = Array.from(uniqueSubjectNames).map(
        (subjectName) => {
          return licences.find(
            (licence) => licence.subjectName === subjectName
          );
        }
      );
    });
  }

  createLicence() {
    this.dialogService.show('Добавление лицензии', {
      componentType: AddLicenseComponent,
      componentData: {
        organizations: this.organizations,
      },
      onClose: (result) => {
        if (result.saved) {
          this.initLicences();
        }
      },
    });
  }

  activate(data: LicenseDataModel): void {
    this.licenceService.activate(data.id).subscribe(() => this.initLicences());
  }

  revoke(data: LicenseDataModel): void {
    this.dialogService.show('Отзыв лицензии ', {
      componentType: WpMessageComponent,
      componentData: {
        message: 'Вы уверены что хотите отозвать лицензию?',
      },

      onClose: (result) => {
        if (result.saved) {
          this.licenceService
            .revoke(data.id)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
              this.initLicences();
            });
        }
      },
    });
  }

  cancel(data: LicenseDataModel): void {
    this.dialogService.show('Отмена лицензии', {
      componentType: WpMessageComponent,
      componentData: {
        message: 'Вы уверены что хотите отменить лицензию?',
      },

      onClose: (result) => {
        if (result.saved) {
          this.licenceService
            .cancel(data.id)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
              this.initLicences();
            });
        }
      },
    });
  }

  private getMenuItems(licenseData: LicenseDataModel) {
    const items = [];

    switch (licenseData.status) {
      case LicenseStatus.created:
        if (
          this.permissions.includes(PermissionEnum.LicenseActivate) &&
          licenseData.manualActivationAllowed
        ) {
          items.push({
            text: this.localization.getSync('Активировать'),
            actionType: 'activate',
          });
        }

        if (
          this.permissions.includes(PermissionEnum.OwnLicensesRevoke) ||
          this.permissions.includes(PermissionEnum.AnyLicenseRevoke)
        ) {
          items.push({
            text: this.localization.getSync('Отозвать'),
            actionType: 'revoke',
          });
        }
        break;
      case LicenseStatus.active:
        if (this.permissions.includes(PermissionEnum.AnyLicenseCancel)) {
          items.push({
            text: this.localization.getSync('Отменить'),
            actionType: 'cancel',
          });
        }
        break;
    }

    return items;
  }

  executeLicenseAction(
    menuInfo:
      | {
          text: string;
          actionType: LicenseActionType;
        }
      | any,
    data: LicenseDataModel
  ) {
    switch (menuInfo.actionType) {
      case LicenseActionType.activate:
        this.activate(data);
        break;
      case LicenseActionType.revoke:
        this.revoke(data);
        break;
      case LicenseActionType.cancel:
        this.cancel(data);
        break;
    }
  }
}
