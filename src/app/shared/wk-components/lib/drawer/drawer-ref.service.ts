import { ComponentRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { DrawerComponent } from './drawer.component';

export class DrawerRef {
  public submitData$$ = new BehaviorSubject<any>(undefined);

  private _componentRef: ComponentRef<DrawerComponent>;

  public get instance(): DrawerComponent | undefined {
    return this._componentRef?.instance;
  }

  public set componentRef(ref: ComponentRef<DrawerComponent>) {
    if (this._componentRef) {
      throw new Error('ComponentRef has already been set and cannot be modified.');
    }
    this._componentRef = ref;
  }

  public submit(): void {
    this._componentRef.instance.submitted.next(this.submitData$$.value);
  }

  public additionalAction(): void {
    this._componentRef.instance.additionalAction.next();
  }

  public cancel(): void {
    this._componentRef.instance.canceled.next();
  }

  public close(): void {
    if (this._componentRef) {
      this._componentRef.instance.close();
    }
  }
}
