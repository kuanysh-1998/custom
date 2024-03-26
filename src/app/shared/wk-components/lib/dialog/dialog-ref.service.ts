import { ComponentRef } from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { DialogComponent } from './dialog.component';

export class DialogRef {
  public submitData$$ = new BehaviorSubject<any>(undefined);

  private _componentRef: ComponentRef<DialogComponent>;

  public get instance(): DialogComponent | undefined {
    return this._componentRef?.instance;
  }

  public set componentRef(ref: ComponentRef<DialogComponent>) {
    if (this._componentRef) {
      throw new Error(
        'ComponentRef has already been set and cannot be modified.'
      );
    }
    this._componentRef = ref;
  }

  public submit(): void {
    this._componentRef.instance.submitted.next(this.submitData$$.value);
  }

  public cancel(): void {
    this._componentRef.instance.canceled.next();
  }

  public additionalAction(): void {
    this._componentRef.instance.additionalAction.next();
  }

  public close(): void {
    if (this._componentRef) {
      this._componentRef.instance.close();
    }
  }
}
