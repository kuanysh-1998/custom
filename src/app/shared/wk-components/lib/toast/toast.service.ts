import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { Message } from './toast.types';

@Injectable()
export class ToastService {
  public messageSource = new Subject<Message>();

  public add(message: Message): void {
    if (message) {
      this.messageSource.next(message);
    }
  }
}
