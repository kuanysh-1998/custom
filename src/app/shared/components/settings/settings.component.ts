import { AuthorizeService } from './../../../auth/services/authorize.service';
import { PermissionEnum } from './../../models/permission.enum';
import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../../services/settings.service';
import { Subject } from 'rxjs';
import { PermissionGroupModel } from '../../../models/permission-group.model';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LocalizationService } from '../../services/localization.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { WpSnackBar } from '../../services/wp-snackbar.service';

@UntilDestroy()
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  isLoggingWithoutLocationAllowed = false;
  hasIntegrationWith_1C = false;
  isCommentInEvents: boolean = false;
  isCommentOutEvents: boolean = false;
  count = 0;
  private countSubject = new Subject<number>();
  PermissionEnum = PermissionEnum;

  constructor(
    private service: SettingsService,
    private snackBar: WpSnackBar,
    private auth: AuthorizeService,
    private localization: LocalizationService
  ) {
    this.service
      .getPermissionGroup(this.auth.currentOrganizationId)
      .subscribe((res) => {
        this.isLoggingWithoutLocationAllowed =
          res.personalDeviceLoggingWithoutLocation;
        this.hasIntegrationWith_1C = res.integrationWith_1C;
        this.isCommentInEvents = res.commentInEvents;
        this.isCommentOutEvents = res.commentOutEvents;
        this.count = res.generalDevicePhotoRecognitionRetryNumber;
        this.countSubject.next(res.generalDevicePhotoRecognitionRetryNumber);
      });
  }

  ngOnInit(): void {
    this.countSubject
      .pipe(untilDestroyed(this), debounceTime(500), distinctUntilChanged())
      .subscribe((count) => {
        const body: PermissionGroupModel = {
          organizationId: this.auth.currentOrganizationId,
          personalDeviceLoggingWithoutLocation:
            this.isLoggingWithoutLocationAllowed,
          integrationWith_1C: this.hasIntegrationWith_1C,
          commentInEvents: this.isCommentInEvents,
          commentOutEvents: this.isCommentOutEvents,
          generalDevicePhotoRecognitionRetryNumber: count,
        };
        this.service
          .updatePermissionGroup(body)
          .pipe(untilDestroyed(this))
          .subscribe(
            (res) => {},
            (err) => {
              this.snackBar.open(err.error, 5000);
            }
          );
      });
  }

  onChange(count: number) {
    if (count !== null && count < 4) {
      this.count = count;
      this.countSubject.next(count);
    }
  }

  sendData(): void {
    const body: PermissionGroupModel = {
      organizationId: this.auth.currentOrganizationId,
      personalDeviceLoggingWithoutLocation:
        this.isLoggingWithoutLocationAllowed,
      integrationWith_1C: this.hasIntegrationWith_1C,
      commentInEvents: this.isCommentInEvents,
      commentOutEvents: this.isCommentOutEvents,
    };
    this.service
      .updatePermissionGroup(body)
      .pipe(untilDestroyed(this))
      .subscribe((res) =>
        this.service.getPermissionGroup(this.auth.currentOrganizationId)
      );
  }
}
