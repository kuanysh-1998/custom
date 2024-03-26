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
import { MenuComponent } from './menu.component';
import { ListItem, MenuAlignment } from './menu.types';

@UntilDestroy()
@Directive({
  selector: '[wkMenu]',
  standalone: true,
})
export class MenuDirective implements OnInit, OnDestroy {
  @Input('wkMenu') public items: ListItem[];
  @Input('wkMenuPosition') public position: MenuAlignment = 'right';
  @Input('wkMenuHeader') public header: string;

  private _menuComponentRef: ComponentRef<MenuComponent> | null;
  private _embeddedViewRef: EmbeddedViewRef<unknown> | null;

  constructor(
    private readonly _templateRef: TemplateRef<unknown>,
    private readonly _viewContainerRef: ViewContainerRef
  ) {}

  public ngOnInit(): void {
    this._createContextMenu(this.items);
  }

  public ngOnDestroy(): void {
    this._destroyContextMenu();
  }

  private _createContextMenu(items: ListItem[]): void {
    this._destroyContextMenu();

    this._embeddedViewRef = this._viewContainerRef.createEmbeddedView(
      this._templateRef
    );
    this._menuComponentRef =
      this._viewContainerRef.createComponent(MenuComponent);

    const element = this._embeddedViewRef.rootNodes[0];

    this._menuComponentRef.instance.items = items;
    this._menuComponentRef.instance.alignment = this.position;
    this._menuComponentRef.instance.for = element;

    fromEvent(element, 'click')
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        if (!this._menuComponentRef) return;
        this._menuComponentRef.instance.toggle();
      });
  }

  private _destroyContextMenu(): void {
    if (this._menuComponentRef) {
      this._menuComponentRef.destroy();
      this._menuComponentRef = null;
    }
    if (this._embeddedViewRef) {
      this._embeddedViewRef.destroy();
      this._embeddedViewRef = null;
    }
  }
}
