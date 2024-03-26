import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ScreenSizeService {
  private isLargeScreenSubject = new BehaviorSubject<boolean>(true);

  constructor() {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  private checkScreenSize(): void {
    this.isLargeScreenSubject.next(window.innerWidth >= 850);
  }

  get isLargeScreen$(): Observable<boolean> {
    return this.isLargeScreenSubject.asObservable();
  }
}
