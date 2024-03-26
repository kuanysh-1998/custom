import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { DxButtonModule } from 'devextreme-angular';
import { ClickEvent as DxClickEvent } from 'devextreme/ui/button';

import { Icons } from '../../assets/svg.types';
import { SvgComponent } from '../svg/svg.component';
import { StilingModeButton, VariantButton } from './button.types';

@Component({
  selector: 'wk-button',
  templateUrl: './button.component.html',
  styleUrls: ['./styles/button.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  @Input() public label: string | number = '';
  @Input() public token?: string;

  @Input() public variant: VariantButton = 'default';
  @Input() public stylingMode: StilingModeButton = 'contained';
  @Input() public fullWidth = false;
  @Input() public isIcon?: boolean = false;

  @Input() public icon?: Icons;
  @Input() public iconRight?: Icons;

  @Input() public disabled = false;

  @Output() public clicked = new EventEmitter<PointerEvent | MouseEvent>();

  @HostBinding('style.width')
  public get width(): string | null {
    return this.fullWidth ? '100%' : null;
  }

  public get isIconButton(): boolean {
    return (
      this.isIcon ||
      (!!this.icon && !this.label && !this.iconRight) ||
      (!!this.iconRight && !this.label && !this.icon) ||
      typeof this.label === 'number'
    );
  }

  public get buttonClasses(): Record<string, boolean> {
    return {
      [`dx-custom-button-${this.variant}`]: true,
      [`dx-custom-button-${this.stylingMode}`]: true,
      ['dx-custom-button-with-icon']: !!this.icon || !!this.iconRight,
      ['dx-custom-button-without-label']: !this.label,
      ['dx-custom-button-icon-button']: this.isIconButton,
    };
  }

  public click(event: DxClickEvent): void {
    this.clicked.emit(event.event as PointerEvent | MouseEvent);
  }
}
