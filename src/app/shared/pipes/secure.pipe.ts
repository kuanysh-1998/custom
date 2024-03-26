import { Pipe, PipeTransform } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Pipe({
  name: 'secure',
})
export class SecurePipe implements PipeTransform {
  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

  transform(url: string, photoId: string): Observable<SafeUrl> | null | any {
    if (!!!url) {
      return null;
    }

    const imgBase64 = url.includes('base64');
    if (imgBase64) {
      return of(url);
    }

    if (!!!photoId) {
      return null;
    }

    return this.http
      .get(url + photoId, { responseType: 'blob' })
      .pipe(
        map((val) =>
          this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(val))
        )
      );
  }
}
