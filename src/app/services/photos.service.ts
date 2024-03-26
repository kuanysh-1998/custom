import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PhotosService {
  PhotosBaseUrl = 'api/photo/download/';
  personalDeviceEmployeeImageUrl: string = 'api/device/personal/photo/';

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

  getPhotoUrl(fileId: string): Observable<string> {
    return this.http
      .get(`${this.PhotosBaseUrl}${fileId}`, { responseType: 'blob' })
      .pipe(
        map(
          (blob) =>
            this.sanitizer.bypassSecurityTrustUrl(
              URL.createObjectURL(blob)
            ) as string
        )
      );
  }

  getPersonalDeviceEmployeePhotoUrl(fileId: string): Observable<string> {
    return this.http
      .get(`${this.personalDeviceEmployeeImageUrl}${fileId}`, { responseType: 'blob' })
      .pipe(
        map(
          (blob) =>
            this.sanitizer.bypassSecurityTrustUrl(
              URL.createObjectURL(blob)
            ) as string
        )
      );
  }
}
