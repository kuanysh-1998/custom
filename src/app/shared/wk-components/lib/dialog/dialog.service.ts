import {
  ComponentRef,
  Injectable,
  Injector,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { DialogRef } from './dialog-ref.service';
import { DialogComponent } from './dialog.component';
import { DIALOG_DATA, DialogConfig } from './dialog.types';

@Injectable()
export class DialogService {
  private readonly _modals: ComponentRef<DialogComponent>[] = [];

  private _vcr: ViewContainerRef;

  public setViewContainerRef(vcr: ViewContainerRef): void {
    this._vcr = vcr;
  }

  public open<T = unknown>(
    componentType: Type<T> | null = null,
    config?: DialogConfig
  ): DialogComponent {
    const dialogRef = new DialogRef();
    const modalComponentRef = this._createComponent(dialogRef, config);

    dialogRef.componentRef = modalComponentRef;

    this._modals.push(modalComponentRef);

    modalComponentRef.instance.componentType = componentType;
    modalComponentRef.instance.size = config?.size ?? 'medium';
    modalComponentRef.instance.header = config?.header ?? '';
    modalComponentRef.instance.text = config?.text;
    modalComponentRef.instance.submitButton = config?.submitButton;
    modalComponentRef.instance.cancelButton = config?.cancelButton;
    modalComponentRef.instance.additionalActionButton =
      config?.additionalButton;
    modalComponentRef.instance.closed.subscribe(() => {
      this._close(modalComponentRef);
    });
    modalComponentRef.instance.open();
    return modalComponentRef.instance;
  }

  public closeAll(): void {
    while (this._modals.length) {
      const componentRef = this._modals.pop();

      if (componentRef) {
        this._close(componentRef);
      }
    }
  }

  private _close(componentRef: ComponentRef<DialogComponent>): void {
    const index = this._modals.indexOf(componentRef);
    if (index !== -1) {
      componentRef.destroy();
      this._modals.splice(index, 1);
    }

    componentRef.instance.submitted.complete();
  }

  private _createComponent(
    dialogRef: DialogRef,
    config?: DialogConfig
  ): ComponentRef<DialogComponent> {
    const modalInjector = Injector.create({
      providers: [
        { provide: DialogRef, useValue: dialogRef },
        {
          provide: DIALOG_DATA,
          useValue: config?.data,
        },
        ...(config?.context?.tokens.map((token) => ({
          provide: token,
          useValue: config?.context?.injector.get(token, null, {
            optional: true,
          }),
        })) ?? []),
      ],
    });

    return this._vcr.createComponent(DialogComponent, {
      injector: modalInjector,
    });
  }
}
