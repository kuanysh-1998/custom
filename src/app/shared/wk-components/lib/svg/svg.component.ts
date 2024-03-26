import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  ViewEncapsulation,
} from '@angular/core';

import { ICON_SIZES } from '../../assets/svg.config';
import { Icons } from '../../assets/svg.types';

@Component({
  selector: 'wk-svg',
  templateUrl: './svg.component.html',
  styleUrls: ['./svg.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SvgComponent {
  @Input() public icon: Icons;

  @Input() public size: 'small' | 'default' | 'large' = 'default';
  @Input() public color?: string;

  @Input() public wrapperWidth?: string | null;
  @Input() public wrapperHeight?: string | null;

  @HostBinding('style.width')
  public get width(): string {
    return (
      ICON_SIZES[this.icon][this.size]?.width ??
      ICON_SIZES[this.icon].default.width
    );
  }

  @HostBinding('style.height')
  public get height(): string {
    return (
      ICON_SIZES[this.icon][this.size]?.height ??
      ICON_SIZES[this.icon].default.height
    );
  }

  @HostBinding('style.width')
  public get containerWidth(): string | null | undefined {
    return this.wrapperWidth;
  }

  @HostBinding('style.height')
  public get containerHeight(): string | null | undefined {
    return this.wrapperHeight;
  }
}
