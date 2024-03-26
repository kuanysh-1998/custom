import { ChangeDetectorRef, Component, HostListener, Inject, OnInit } from '@angular/core';
import { PersonalDeviceModel } from '../../../../models/device.model';
import { LocationService } from '../../../../services/location.service';
import { LocationModel } from '../../../../models/location.model';
import { DeviceService } from '../../../../services/device.service';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DIALOG_DATA } from 'src/app/shared/tokens/dialog-data.token';
import DataSource from 'devextreme/data/data_source';
import { HttpCustom } from 'src/app/shared/http';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@UntilDestroy()
@Component({
  selector: 'app-edit-personal-device',
  templateUrl: './edit-personal-device.component.html',
  styleUrls: ['./edit-personal-device.component.scss'],
})
export class EditPersonalDeviceComponent implements OnInit {
  deviceForm: FormGroup;
  deviceLocations: LocationModel[] = [];
  availableLocations: LocationModel[] = [];
  locationsDataSource: DataSource;
  activeButton: 'cancel' | 'save' = 'save';

  constructor(
    private locationService: LocationService,
    private deviceService: DeviceService,
    private dialogService: DialogService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private http: HttpCustom,
    @Inject(DIALOG_DATA) public personalDeviceData: PersonalDeviceModel
  ) {
    this.deviceForm = this.fb.group({
      id: ['', Validators.required],
      organizationId: ['', Validators.required],
      locationsId: [[], [Validators.required]],
    });
  }

  ngOnInit(): void {
    if (this.personalDeviceData) {
      this.deviceForm.patchValue({
        id: this.personalDeviceData.id,
        organizationId: this.personalDeviceData.organizationId,
        locationsId: this.personalDeviceData.locationsId,
      });
      this.initializeLocationsDataSource();
      this.loadDeviceAndLocations();
    }
  }

  private initializeLocationsDataSource(): void {
    const dataStore = this.http.createStore(
      'id',
      this.locationService.getAllLocationDxUrl(
        this.personalDeviceData.organizationId
      )
    );

    this.locationsDataSource = new DataSource({
      store: dataStore,
      sort: [{ selector: 'name', desc: false }],
      pageSize: 0,
    });
  }

  private loadDeviceAndLocations(): void {
    from(this.locationsDataSource.load())
      .pipe(
        switchMap((locations: LocationModel[]) => {
          this.availableLocations = locations;

          return this.deviceService.getPersonalDeviceId(
            this.personalDeviceData.id
          );
        }),
        untilDestroyed(this)
      )
      .subscribe((device) => {
        this.updateDeviceLocations(device);
        this.cdr.detectChanges();
      });
  }

  private updateDeviceLocations(device: PersonalDeviceModel): void {
    const locationsId = Array.isArray(device.locationsId)
      ? device.locationsId
      : [];
    this.deviceForm.patchValue({ locationsId });
    this.deviceLocations = this.availableLocations.filter((location) =>
      locationsId.includes(location.id)
    );
  }

  update(): void {
    this.deviceForm.markAllAsTouched();

    if (this.deviceForm.valid) {
      const updatedDevice: PersonalDeviceModel = {
        ...this.personalDeviceData,
        ...this.deviceForm.value,
      };

      this.deviceService.updatePersonalDevice(updatedDevice).subscribe(() => {
        this.dialogService.close(EditPersonalDeviceComponent, { saved: true });
      });
    }
  }

  closeModal(): void {
    this.dialogService.close(EditPersonalDeviceComponent);
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
