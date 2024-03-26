import { ChangeDetectorRef, Component, HostListener, Inject, OnInit } from '@angular/core';
import { DeviceService } from '../../../../services/device.service';
import { TypesOfDevices } from '../../../../shared/consts/device.const';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { DIALOG_DATA } from 'src/app/shared/tokens/dialog-data.token';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-add-device',
  templateUrl: './add-device.component.html',
  styleUrls: ['./add-device.component.scss'],
})
export class AddDeviceComponent implements OnInit {
  qrValue: string = '';
  codeOrganization: string;
  title: string;
  isLoading: boolean = true;

  constructor(
    @Inject(DIALOG_DATA)
    public data: {
      organizationId: string;
      component: TypesOfDevices;
    },
    private service: DeviceService,
    private localization: LocalizationService,
    private dialogService: DialogService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.data.component === TypesOfDevices.personal) {
      this.requestPersonalDeviceQr(this.data.organizationId);
    } else {
      this.requestCorporateDeviceQr(this.data.organizationId);
    }
  }

  requestPersonalDeviceQr(organizationId: string): void {
    this.isLoading = true;
    this.service
      .getInfoPersonal(organizationId)
      .pipe(untilDestroyed(this))
      .subscribe((response) => {
        this.title = this.localization.getSync(
          'Отсканируйте QR-код на личном устройстве сотрудника'
        );
        this.qrValue = response.qrCode;
        this.codeOrganization = response.code;
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  requestCorporateDeviceQr(organizationId: string): void {
    this.isLoading = true;
    this.service
      .getInfo(organizationId)
      .pipe(untilDestroyed(this))
      .subscribe((response) => {
        this.title = this.localization.getSync(
          'Отсканируйте QR-код на корпоративным устройстве сотрудника'
        );
        this.qrValue = response.qrCode;
        this.codeOrganization = response.code;
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  closeDialog(): void {
    this.dialogService.close(AddDeviceComponent);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.closeDialog();
    }
  }
}
