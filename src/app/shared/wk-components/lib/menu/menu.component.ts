import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { DxContextMenuModule, DxPopoverModule } from 'devextreme-angular';

import { PositionConfig } from 'devextreme/animation/position';
import { ListItemComponent } from '../list-item/list-item.component';
import { SvgComponent } from '../svg/svg.component';
import { ListItem, MenuAlignment } from './menu.types';
import { getPositionMenu } from './menu.utils';

@Component({
  selector: 'wk-menu',
  standalone: true,
  imports: [
    CommonModule,
    DxContextMenuModule,
    SvgComponent,
    DxPopoverModule,
    ListItemComponent,
  ],
  templateUrl: './menu.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
  @Input() public for: Element | string | number;
  @Input() public items: ListItem[] = [];
  @Input() public padding: 'xxs' | 'snudge' | 'l' = 'snudge';
  @Input() public alignment: MenuAlignment = 'left bottom';
  @Input() public header: string;

  @Input() public minWidth: number;
  @Input() public isOpen = false;

  @Output() public closed = new EventEmitter<void>();

  public get isAllItemsInvisible(): boolean {
    return !this.items.every((i) => i.visible === true);
  }

  public get target(): Element | string {
    if (typeof this.for === 'string' || typeof this.for === 'number')
      return `#${this.for}`;
    return this.for;
  }

  public get position(): PositionConfig {
    return getPositionMenu(this.alignment);
  }

  constructor(private readonly _cdr: ChangeDetectorRef) {}

  public clickItem(item: ListItem): void {
    if (item.action) item.action();
    this.close();
  }

  public toggle(): void {
    this.isOpen = !this.isOpen;
    this._cdr.detectChanges();
  }

  public close(): void {
    this.isOpen = false;
    this._cdr.detectChanges();
    this.closed.emit();
  }

  public trackByFn(index: number): number {
    return index;
  }
}
