import {
  Injectable,
  ComponentRef,
  Type,
  Injector,
  ViewContainerRef,
} from '@angular/core';

import { Subject, Subscription, fromEvent } from 'rxjs';
import { WpPopupComponent } from '../components/wp-popup/wp-popup.component';
import { DIALOG_DATA } from '../tokens/dialog-data.token';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter, take } from 'rxjs/operators';
interface DialogResult {
  saved?: boolean;
  rejected?: boolean;
}

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private viewContainerRef!: ViewContainerRef;

  private dialogCloseSubject = new Subject<{
    componentType: Type<any>;
    result?: DialogResult;
  }>();

  private dialogRefs = new Map<Type<any>, ComponentRef<WpPopupComponent>>();
  private escapeSubscription: Subscription;

  constructor(private injector: Injector) {
    this.listenToEscape();
  }

  ngOnDestroy(): void {
    this.escapeSubscription.unsubscribe();
  }

  private listenToEscape(): void {
    if (this.escapeSubscription) {
      this.escapeSubscription.unsubscribe();
    }

    this.escapeSubscription = fromEvent(document, 'keydown')
      .pipe(filter((event: KeyboardEvent) => event.key === 'Escape'))
      .subscribe(() => {
        const lastOpenedDialogType = Array.from(this.dialogRefs.keys()).pop();

        if (lastOpenedDialogType) {
          this.close(lastOpenedDialogType);
        }
      });
  }

  public setViewContainerRef(vcr: ViewContainerRef) {
    this.viewContainerRef = vcr;
  }

  show(
    title: string,
    options?: {
      componentType: Type<any>;
      componentData?: any;
      width?: number;
      onClose?: (result: DialogResult & { componentType: Type<any> }) => void;
    }
  ): void {
    const { componentType, componentData, width, onClose } = options || {};

    if (this.dialogRefs.has(componentType)) {
      this.close(componentType);
    }

    const customInjector = Injector.create({
      providers: [{ provide: DIALOG_DATA, useValue: componentData }],
      parent: this.injector,
    });

    const componentRef = this.viewContainerRef.createComponent(
      WpPopupComponent,
      { injector: customInjector }
    );
    const instance = componentRef.instance;

    instance.title = title;
    instance.width = width ?? instance.width;

    instance.visible = true;
    instance.componentType = componentType;

    this.dialogRefs.set(componentType, componentRef);

    if (onClose) {
      this.dialogCloseSubject
        .pipe(
          filter(({ componentType: type }) => type === componentType),
          take(1),
          untilDestroyed(this)
        )
        .subscribe(({ result }) => {
          onClose({ ...result, componentType });
        });
    }

    this.listenToEscape();
  }

  close(componentType: Type<any>, result?: DialogResult): void {
    const dialogRef = this.dialogRefs.get(componentType);

    if (dialogRef) {
      dialogRef.destroy();
      this.dialogRefs.delete(componentType);
      this.dialogCloseSubject.next({ componentType, result });
    }
  }
}
