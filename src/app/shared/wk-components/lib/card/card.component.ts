import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
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
import { ButtonComponent } from '../button/button.component';
import { SvgComponent } from '../svg/svg.component';

@Component({
  selector: 'wk-card',
  standalone: true,
  imports: [CommonModule, ButtonComponent, SvgComponent],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  animations: [
    trigger('expandCollapse', [
      state('collapsed', style({ height: 0, overflow: 'hidden' })),
      state('expanded', style({ height: '*', overflow: 'hidden' })),
      transition('expanded <=> collapsed', animate(200)),
    ]),
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  @Input() public padding: 'none' | 'small' | 'large' = 'large';
  @Input() public direction: 'horizontal' | 'vertical' = 'vertical';
  @Input() public enableExpand = false;
  @Input() public clickable = false;
  @Input() public header = '';
  @Input() public stylingMode: 'default' | 'outline' | 'ghost' = 'default';
  @Input() public fullHeight = false;

  @Input() public icon?: Icons;
  @Input() public iconRight?: Icons;

  @Output() public clicked = new EventEmitter<void>();

  public readonly iconChevron = Icons.ChevronRight;
  public isExpanded = true;

  public get isClickableHeader(): boolean {
    return (
      this.enableExpand && this.direction === 'vertical' && !this.clickable
    );
  }

  public get cardClasses(): Record<string, boolean> {
    return {
      card: true,
      [this.direction]: true,
      [this.padding]: true,
      [this.stylingMode]: true,
      clickable: this.clickable,
      'full-height': this.fullHeight,
    };
  }

  public get headerClasses(): Record<string, boolean> {
    return {
      'header-wrapper': true,
      'clickable-header': this.isClickableHeader,
      open: this.isExpanded,
    };
  }

  public get contentClasses(): Record<string, boolean> {
    return {
      content: true,
      [this.direction]: true,
      [this.padding]: true,
      'with-header': !!this.header,
    };
  }

  public click(): void {
    if (!this.clickable) return;
    this.clicked.emit();
  }

  public toggleContent(): void {
    if (!this.isClickableHeader) return;
    this.isExpanded = !this.isExpanded;
  }
}
