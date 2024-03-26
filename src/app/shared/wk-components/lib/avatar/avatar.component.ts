import { CommonModule } from '@angular/common';

import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { Icons } from '../../assets/svg.types';
import { AccordionComponent } from '../accordion/accordion.component';
import { SvgComponent } from '../svg/svg.component';

@Component({
  selector: 'wk-avatar',
  standalone: true,
  imports: [CommonModule, SvgComponent, AccordionComponent],
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarComponent implements OnInit {
  @Input() public name = '';
  @Input() public size: 'medium' | 'large' = 'medium';
  @Input() public variant: 'default' | 'secondary' | 'alternative' = 'default';

  public avatarIcon = Icons.Avatar;
  public initials = '';

  public get svgSize(): 'default' | 'large' {
    return this.size === 'medium' ? 'default' : 'large';
  }

  public get avatarClasses(): Record<string, boolean> {
    return {
      avatar: true,
      [this.size]: true,
      [this.variant]: true,
    };
  }

  public ngOnInit(): void {
    this.initials = this._getInitials();
  }

  private _getInitials(): string {
    const words = this.name.split(' ');

    if (words.length === 0) return '';
    if (words.length === 1) return words[0].charAt(0);

    return words[0].charAt(0) + words[1].charAt(0);
  }
}
