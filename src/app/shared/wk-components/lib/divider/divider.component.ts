import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { Icons } from '../../assets/svg.types';
import { SvgComponent } from '../svg/svg.component';

@Component({
  selector: 'wk-divider',
  standalone: true,
  imports: [CommonModule, SvgComponent],
  templateUrl: './divider.component.html',
  styleUrls: ['./divider.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DividerComponent {
  @Input() public margin: 'small' | 'medium' | 'large' | 'none' = 'small';
  @Input() public position: 'left' | 'center' | 'right' = 'left';

  @Input() public icon?: Icons;
  @Input() public text?: string;

  public get isLeftContent(): boolean {
    return this.position === 'left' && (!!this.icon || !!this.text);
  }

  public get isCenterContent(): boolean {
    return this.position === 'center' && (!!this.icon || !!this.text);
  }

  public get isRightContent(): boolean {
    return this.position === 'right' && (!!this.icon || !!this.text);
  }
}
