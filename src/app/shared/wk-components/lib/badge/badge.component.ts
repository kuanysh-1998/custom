import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { Icons } from '../../assets/svg.types';
import { SvgComponent } from '../svg/svg.component';

@Component({
  selector: 'wk-badge',
  standalone: true,
  imports: [CommonModule, SvgComponent],
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  @Input() public text = '';
  @Input() public size: 'medium' | 'large' = 'medium';
  @Input() public stylingMode: 'contained' | 'outlined' | 'ghost' = 'contained';
  @Input() public variant: 'default' | 'warning' | 'secondary' = 'default';

  @Input() public icon?: Icons;
  @Input() public iconRight?: Icons;

  @Input() public iconClickable = false;
  @Input() public iconRightClickable = false;

  @Output() public clickedIcon = new EventEmitter<void>();
  @Output() public clickedIconRight = new EventEmitter<void>();

  public get badgeClasses(): Record<string, boolean> {
    return {
      badge: true,
      [this.size]: true,
      [this.stylingMode]: true,
      [this.variant]: true,
      'with-icon': !!this.icon,
      'with-icon-right': !!this.iconRight,
      'only-icon':
        ((!this.text && !!this.icon) || (!!this.iconRight && !this.text)) &&
        !(this.icon && this.iconRight),
    };
  }
}
