import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { ScrollEvent } from 'devextreme/ui/scroll_view';

@Component({
  selector: 'wk-scroll',
  templateUrl: './scroll.component.html',
  styleUrls: ['./scroll.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ScrollComponent {
  @Output() public atTop = new EventEmitter<boolean>();

  public onScroll(event: ScrollEvent): void {
    const scrollTop = event.scrollOffset.top;
    const atTop = scrollTop === 0;
    this.atTop.emit(atTop);
  }
}
