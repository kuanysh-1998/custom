import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnInit,
  Renderer2,
  RendererFactory2,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocationModel } from '../../../../models/location.model';
import { LocationService } from '../../../../services/location.service';
import { DIALOG_DATA } from 'src/app/shared/tokens/dialog-data.token';
import { DxTextBoxComponent } from 'devextreme-angular/ui/text-box';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import { WpLocationService } from 'src/app/services/wp-location.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { WpCustomValidators } from 'src/app/shared/validators/wp-custom-validators';

@UntilDestroy()
@Component({
  selector: 'app-add-location',
  templateUrl: './add-location.component.html',
  styleUrls: ['./add-location.component.scss'],
  providers: [WpLocationService],
})
export class AddLocationComponent implements OnInit {
  @ViewChild('dxTextBox', { static: true }) dxTextBox: DxTextBoxComponent;
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  renderer: Renderer2;
  form: FormGroup;
  minLocationSize: number = 100;
  maxLocationSize: number = 10000;
  _latitude: number | null = null;
  _longitude: number | null = null;

  get latitude(): number | null {
    return this._latitude;
  }

  set latitude(value: number | null) {
    this._latitude = value;
    this.updateMap();
  }

  get longitude(): number | null {
    return this._longitude;
  }

  set longitude(value: number | null) {
    this._longitude = value;
    this.updateMap();
  }

  zoom: number = 12;
  circle: google.maps.Circle | null = null;
  activeButton: 'cancel' | 'save' = 'save';

  constructor(
    private formBuilder: FormBuilder,
    private locationService: LocationService,
    private dialogService: DialogService,
    private wpLocationService: WpLocationService,
    private localization: LocalizationService,
    @Inject(DIALOG_DATA)
    public data: { organizationId: string; location: LocationModel },
    rendererFactory: RendererFactory2,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.formBuilder.group({
      name: [
        '',
        [
          Validators.required,
          WpCustomValidators.maxLength(100, this.localization),
        ],
      ],
      organizationId: [this.data.organizationId, [Validators.required]],
      radius: [100, [Validators.required]],
      address: ['', [Validators.required]],
    });

    this.renderer = rendererFactory.createRenderer(null, null);
  }

  ngOnInit(): void {
    this.readCurrentLocationFromBrower();
    this.wpLocationService.handlePermission();

    this.form.get('radius').valueChanges.subscribe((value) => {
      const roundedValue = Math.floor(value);

      if (!Number.isFinite(value) || value < this.minLocationSize) {
        this.form
          .get('radius')
          .setValue(this.minLocationSize, { emitEvent: false });
      } else if (roundedValue !== value) {
        this.form.get('radius').setValue(roundedValue, { emitEvent: false });
      }
    });
  }

  ngAfterViewInit() {
    const inputElement = this.dxTextBox.instance
      .element()
      .querySelector('input');
    this.wpLocationService.initAutocomplete(inputElement, (place) => {
      this.latitude = place.geometry.location.lat();
      this.longitude = place.geometry.location.lng();
      this.cdr.markForCheck();
    });
  }

  updateMap(): void {
    if (this.latitude !== null && this.longitude !== null) {
      this.initMapAndMarker();
    }
  }

  initMapAndMarker() {
    if (
      typeof this.latitude !== 'number' ||
      isNaN(this.latitude) ||
      typeof this.longitude !== 'number' ||
      isNaN(this.longitude)
    ) {
      return;
    }

    from(google.maps.importLibrary('maps'))
      .pipe(
        switchMap((mapsLibrary: any) => {
          const { Map } = mapsLibrary as google.maps.MapsLibrary;
          const map = new Map(this.mapContainer.nativeElement, {
            center: { lat: this.latitude, lng: this.longitude },
            zoom: this.zoom,
            mapId: '419b683553aa4efa',
          });

          return from(google.maps.importLibrary('marker')).pipe(
            switchMap((markerLibrary: any) => {
              const { AdvancedMarkerElement } = markerLibrary;

              const markerIcon = this.renderer.createElement('img');
              this.renderer.setAttribute(
                markerIcon,
                'src',
                'assets/image/google-map/green-marker.svg'
              );

              const circle = new google.maps.Circle({
                strokeColor: '#39BF5E',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#39BF5E',
                fillOpacity: 0.35,
                map,
                center: { lat: this.latitude, lng: this.longitude },
                radius: this.form.get('radius').value,
              });

              this.circle = circle;

              const marker = new AdvancedMarkerElement({
                map,
                position: { lat: this.latitude, lng: this.longitude },
                content: markerIcon,
                gmpDraggable: true,
              });

              marker.addListener('dragend', (event) => {
                this.markerDragEnd(event);
              });

              this.setupRadiusChangeSubscription();
              return from([]);
            })
          );
        })
      )
      .subscribe();
  }

  setupRadiusChangeSubscription() {
    this.form.get('radius').valueChanges.subscribe((newRadius) => {
      if (this.circle) {
        this.circle.setRadius(newRadius);
      }
    });
  }

  markerDragEnd($event: google.maps.MapMouseEvent): void {
    this.latitude = $event.latLng.lat();
    this.longitude = $event.latLng.lng();
    this.getAddress(this.latitude, this.longitude);
  }

  getAddress(latitude: number, longitude: number): void {
    this.wpLocationService.getAddress(latitude, longitude);
  }

  searchByCoordinates() {
    const input = this.dxTextBox.instance.option('value').trim();
    const parts = input.split(',').map((part) => part.trim());

    if (parts.length === 2) {
      const [latitude, longitude] = parts.map(parseFloat);

      if (latitude !== this.latitude || longitude !== this.longitude) {
        this.latitude = latitude;
        this.longitude = longitude;

        this.wpLocationService.searchByCoordinates(input);

        this.wpLocationService.locationSubjectObservable
          .pipe(untilDestroyed(this))
          .subscribe((location) => {
            const { latitude, longitude } = location;
            this.latitude = latitude;
            this.longitude = longitude;
          });
      }
    }
  }

  private readCurrentLocationFromBrower(): void {
    this.wpLocationService.readCurrentLocation().subscribe({
      next: (location) => {
        this.latitude = location.latitude;
        this.longitude = location.longitude;
        this.form.controls['address'].clearValidators();
        this.form.controls['address'].updateValueAndValidity();
      },
      error: (error) => {
        this.form.controls['address'].setValidators(Validators.required);
      },
    });
  }

  createLocation(): void {
    if (this.latitude === null || this.longitude === null) {
      this.form.controls['address'].setValue('');
      this.form.controls['address'].setValidators([Validators.required]);
      this.form.controls['address'].updateValueAndValidity();

      this.form.markAllAsTouched();

      return;
    }

    if (this.form.invalid) {
      return;
    }

    const form = this.form.getRawValue();
    const body: LocationModel = {
      name: form.name,
      organizationId: form.organizationId,
      radius: form.radius,
      coordinates: {
        longitude: this.longitude,
        latitude: this.latitude,
      },
    };

    this.locationService
      .addLocation(body)
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.dialogService.close(AddLocationComponent, { saved: true });
      });
  }

  closeDialog(): void {
    this.dialogService.close(AddLocationComponent);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
        this.activeButton === 'save'
          ? this.createLocation()
          : this.closeDialog();
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
