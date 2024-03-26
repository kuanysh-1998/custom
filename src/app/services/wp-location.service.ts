import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { WpSnackBar } from '../shared/services/wp-snackbar.service';

@Injectable()
export class WpLocationService {
  private locationSubject: Subject<{ latitude: number; longitude: number }> =
    new Subject<{ latitude: number; longitude: number }>();
  locationSubjectObservable = this.locationSubject.asObservable();
  private geoCoder: google.maps.Geocoder = new google.maps.Geocoder();
  static readonly DEFAULT_MARKER_OPTIONS: google.maps.MarkerOptions = {
    draggable: true,
    crossOnDrag: true,
    icon: {
      url: 'assets/image/google-map/green-marker.svg',
      scaledSize: new google.maps.Size(32, 32),
    },
  };

  address: string;

  constructor(
    private snackBar: WpSnackBar,
    private localization: LocalizationService
  ) {}

  initAutocomplete(
    inputElement: HTMLInputElement,
    onPlaceChanged: (place: google.maps.places.PlaceResult) => void
  ): void {
    inputElement.placeholder = this.localization.getSync('Поиск');
    const autocomplete = new google.maps.places.Autocomplete(inputElement);

    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      const place = autocomplete.getPlace();

      if (place.geometry === undefined || place.geometry === null) {
        return;
      }
      onPlaceChanged(place);
    });
  }

  getAddress(latitude: number, longitude: number): void {
    this.geoCoder.geocode(
      { location: { lat: latitude, lng: longitude } },
      (results, status) => {
        switch (status) {
          case 'OK':
            if (results[0]) {
              this.address = results[0].formatted_address;
            }
            break;
          case 'ZERO_RESULTS':
            this.sendNotification('Убедитесь в корректности координат локации');
            break;
          default:
            this.sendNotification(
              'Ошибка поиска локации по координатам: ' + status
            );
            break;
        }
      }
    );
  }

  searchByCoordinates(input: string): void {
    const parts = input.split(',').map((part) => part.trim());

    if (parts.length === 2) {
      const [latitude, longitude] = parts.map(parseFloat);

      if (!isNaN(latitude) && !isNaN(longitude)) {
        this.locationSubject.next({ latitude, longitude });
        this.getAddress(latitude, longitude);
      } else if (parts[0].length > 0 && parts[1].length === 0) {
      } else {
        this.sendNotification(
          this.localization.getSync('Введите правильные координаты')
        );
      }
    }
  }
  
  readCurrentLocation(): Observable<{ latitude: number; longitude: number }> {
    return new Observable((observer) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          observer.next({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          observer.complete();
        },
        (error) => {
          observer.error(error);
        }
      );
    });
  }

  handlePermission() {
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'granted') {
      } else if (result.state === 'prompt') {
      } else if (result.state === 'denied') {
      }
      result.addEventListener('change', () => {});
    });
  }

  sendNotification(message: string): void {
    this.snackBar.open(message, 5000);
  }
}
