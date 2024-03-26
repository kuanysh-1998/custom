import { ChangeDetectorRef, Component, HostListener, Inject, OnInit } from '@angular/core';
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { DeviceModel } from '../../../../models/device.model';
import { DeviceService } from '../../../../services/device.service';
import { LocationService } from '../../../../services/location.service';
import { Observable } from 'rxjs';
import { LocationModel } from '../../../../models/location.model';
import { LocalizationService } from '../../../../shared/services/localization.service';
import { DIALOG_DATA } from 'src/app/shared/tokens/dialog-data.token';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import { AuthorizeService } from 'src/app/auth/services/authorize.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-edit-device',
  templateUrl: './edit-device.component.html',
  styleUrls: ['./edit-device.component.scss'],
})
export class EditDeviceComponent implements OnInit {
  form: UntypedFormGroup;
  location$: Observable<LocationModel[]>;
  eventTypes: Array<{ id: boolean; text: string }>;
  isLoading = true;
  activeButton: 'cancel' | 'save' = 'save';

  constructor(
    @Inject(DIALOG_DATA) public data: DeviceModel,
    private service: DeviceService,
    private locationService: LocationService,
    private localization: LocalizationService,
    private dialogService: DialogService,
    private auth: AuthorizeService,
    private cdr: ChangeDetectorRef
  ) {
    this.eventTypes = [
      { id: false, text: this.localization.getSync('Статичная') },
      {
        id: true,
        text: this.localization.getSync('Динамическая'),
      },
    ];
  }

  ngOnInit(): void {
    this.location$ = this.locationService.getAllLocation(
      this.auth.currentOrganizationId
    );

    this.form = new UntypedFormGroup({
      id: new UntypedFormControl(''),
      serialNumber: new UntypedFormControl(''),
      organizationId: new UntypedFormControl(''),
      name: new UntypedFormControl('', [
        Validators.required,
        Validators.maxLength(100),
      ]),
      locationId: new UntypedFormControl('', [Validators.required]),
      isDynamic: new UntypedFormControl(null),
      pinCode: new UntypedFormControl('', [
        Validators.required,
        Validators.maxLength(4),
      ]),
    });
    this.service
      .getDeviceById(this.data.id)
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.form.patchValue(res);
        this.isLoading = false;
        this.cdr.markForCheck();
      });
  }

  update(): void {
    if (this.form.get('isDynamic').value) {
      this.form.get('locationId').clearValidators();
      this.form.controls.locationId.updateValueAndValidity();
      this.form.updateValueAndValidity();
    }
    if (this.form.valid) {
      const body: DeviceModel = this.form.getRawValue();
      this.service.updateDevice(body).subscribe(() => {
        this.dialogService.close(EditDeviceComponent, { saved: true });
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

  closeModal() {
    this.dialogService.close(EditDeviceComponent);
  }

  
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
        this.activeButton === 'save' ? this.update() : this.closeModal();
        break;
      case 'ArrowLeft':
        this.activeButton = 'cancel';
        break;
      case 'ArrowRight':
        this.activeButton = 'save';
        break;
      default:
        break;
    }
  }
}
