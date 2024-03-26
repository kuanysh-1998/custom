import {
  ComponentRef,
  Directive,
  EmbeddedViewRef,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { fromEvent } from 'rxjs';
import { MenuAlignment } from '../menu/menu.types';
import { PopoverComponent } from './popover.component';

@UntilDestroy()
@Directive({
  selector: '[wkPopover]',
  standalone: true,
})
export class PopoverDirective implements OnInit, OnDestroy {
  @Input('wkPopover') public templateRef: TemplateRef<any>;
  @Input('wkPopoverPosition') public position: MenuAlignment = 'right bottom';

  private _popoverComponentRef: ComponentRef<PopoverComponent> | null;
  private _embeddedViewRef: EmbeddedViewRef<unknown> | null;

  constructor(
    private readonly _templateRef: TemplateRef<unknown>,
    private readonly _viewContainerRef: ViewContainerRef
  ) {}

  public ngOnInit(): void {
    this._createContextMenu(this.templateRef);
  }

  public ngOnDestroy(): void {
    this._destroyContextMenu();
  }

  private _createContextMenu(template: TemplateRef<any>): void {
    this._destroyContextMenu();

    this._embeddedViewRef = this._viewContainerRef.createEmbeddedView(
      this._templateRef
    );
    this._popoverComponentRef =
      this._viewContainerRef.createComponent(PopoverComponent);

    const element = this._embeddedViewRef.rootNodes[0];

    this._popoverComponentRef.instance.template = template;
    this._popoverComponentRef.instance.alignment = this.position;
    this._popoverComponentRef.instance.for = element;

    fromEvent(element, 'click')
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        if (!this._popoverComponentRef) return;
        this._popoverComponentRef.instance.toggle();
      });
  }

  private _destroyContextMenu(): void {
    if (this._popoverComponentRef) {
      this._popoverComponentRef.destroy();
      this._popoverComponentRef = null;
    }
    if (this._embeddedViewRef) {
      this._embeddedViewRef.destroy();
      this._embeddedViewRef = null;
    }
  }
}
