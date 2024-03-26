import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { DxPopoverModule } from 'devextreme-angular';
import { PositionConfig } from 'devextreme/animation/position';
import { Icons } from '../../assets/svg.types';
import { ButtonComponent } from '../button/button.component';
import { StilingModeButton, VariantButton } from '../button/button.types';
import { MenuComponent } from '../menu/menu.component';
import { ListItem, MenuAlignment } from '../menu/menu.types';
import { getPositionMenu } from '../menu/menu.utils';
@Component({
  selector: 'wk-button-popover',
  templateUrl: './button-popover.component.html',
  standalone: true,
  imports: [CommonModule, ButtonComponent, DxPopoverModule, MenuComponent],
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./button-popover.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonPopoverComponent implements AfterViewInit {
  @Input() public stylingMode: StilingModeButton = 'contained';
  @Input() public variant: VariantButton = 'default';
  @Input() public disabled = false;
  @Input() public label = '';
  @Input() public alignment: MenuAlignment = 'left bottom';

  @Input() public type: 'menu' | 'content' = 'content';
  @Input() public menuItems: ListItem[];
  @Input() public menuHeader: string;

  @Input() public iconRight: Icons = Icons.ChevronDown;

  @Input() public token?: string;
  @Input() public icon?: Icons;

  @Output() public closed = new EventEmitter<void>();
  @Output() public opened = new EventEmitter<void>();

  public isOpen = false;
  public popoverWidth: number;

  @ViewChild('button') private readonly _button: ElementRef;

  public get isMenu(): boolean {
    return this.type === 'menu';
  }

  public get position(): PositionConfig {
    return getPositionMenu(this.alignment);
  }

  public ngAfterViewInit(): void {
    this._setupMinWidth();
  }

  public open(): void {
    this.isOpen = true;
    this.opened.emit();
  }

  public close(): void {
    this.isOpen = false;
    this.closed.emit();
  }

  public toggle(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) this.opened.emit();
  }

  private _setupMinWidth(): void {
    const BORDERS_WIDTH = 2;
    this.popoverWidth = this._button.nativeElement.offsetWidth + BORDERS_WIDTH;
  }
}
