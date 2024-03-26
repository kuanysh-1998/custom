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
import { DxAccordionModule } from 'devextreme-angular';
import { Icons } from '../../assets/svg.types';
import { SvgComponent } from '../svg/svg.component';

@Component({
  selector: 'wk-accordion',
  standalone: true,
  imports: [CommonModule, DxAccordionModule, SvgComponent],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionComponent {
  @Input() public title = '';
  @Input() public chevronPosition: 'left' | 'right' = 'right';
  @Input() public padding = true;

  @Input() public icon?: Icons;

  @Output() contentReady = new EventEmitter<void>();

  public iconChevron = Icons.ChevronRight;
  public selectedIndex = -1;

  public get isOpen(): boolean {
    return this.selectedIndex === 0;
  }

  public get isLeftChevron(): boolean {
    return this.chevronPosition === 'left';
  }

  public get accordionTitleClasses(): Record<string, boolean> {
    return {
      'dx-custom-accordion-header-wrapper': true,
      'dx-custom-accordion-chevron-left': this.isLeftChevron,
      'dx-custom-accordion-open': this.isOpen,
    };
  }

  constructor(private readonly _cdr: ChangeDetectorRef) {}

  public open(): void {
    this.selectedIndex = 0;
    this._cdr.detectChanges();
  }

  public close(): void {
    this.selectedIndex = -1;
    this._cdr.detectChanges();
  }
}
