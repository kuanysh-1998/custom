import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class DeviceModalService {
  private CorporativeModalClosedSubject = new Subject<void>();

  modalClosed$ = this.CorporativeModalClosedSubject.asObservable();

  notifyModalClosed() {
    this.CorporativeModalClosedSubject.next();
  }
}
