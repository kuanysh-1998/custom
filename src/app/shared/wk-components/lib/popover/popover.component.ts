import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import { DxPopoverModule } from 'devextreme-angular';

import { PositionConfig } from 'devextreme/animation/position';
import { MenuAlignment } from '../menu/menu.types';
import { getPositionMenu } from '../menu/menu.utils';

@Component({
  selector: 'wk-popover',
  standalone: true,
  imports: [CommonModule, DxPopoverModule],
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopoverComponent {
  @Input() public for: Element | string | number;
  @Input() public template: TemplateRef<any>;
  @Input() public alignment: MenuAlignment = 'left bottom';

  @Input() public minWidth: number;
  @Input() public isOpen = false;

  @Output() public closed = new EventEmitter<void>();

  public get target(): Element | string {
    if (typeof this.for === 'string' || typeof this.for === 'number')
      return `#${this.for}`;
    return this.for;
  }

  public get position(): PositionConfig {
    return getPositionMenu(this.alignment);
  }

  constructor(private readonly _cdr: ChangeDetectorRef) {}

  public toggle(): void {
    this.isOpen = !this.isOpen;
    this._cdr.detectChanges();
  }

  public close(): void {
    this.isOpen = false;
    this._cdr.detectChanges();
    this.closed.emit();
  }
}
