import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icons } from '../../assets/svg.types';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { SvgComponent } from '../svg/svg.component';

@Component({
  selector: 'wk-list-item',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListItemComponent {
  @Input() public text? = '';

  @Input() public icon?: Icons;
  @Input() public iconRight?: Icons;
  @Input() public selectionMode = false;
  @Input() public checked = true;
  @Input() public enableWrapTwoRows = true;

  @Input() public active?: boolean = false;
  @Input() public link?: string;
  @Input() public withGap?: boolean = false;

  @Output() public clicked = new EventEmitter<boolean | void>();

  public click(): void {
    if (!this.selectionMode) {
      this.clicked.emit();
      return;
    }
    this.checked = !this.checked;
    this.clicked.emit(this.checked);
  }

  public clickCheckbox(event: Event, item: HTMLDivElement): void {
    event.stopPropagation();
    item.focus();
  }

  public changeCheckbox(event: boolean): void {
    this.checked = event;
    this.clicked.emit(event);
  }
}
