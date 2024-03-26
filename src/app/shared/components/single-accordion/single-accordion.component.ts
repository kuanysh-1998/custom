import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-single-accordion',
  templateUrl: './single-accordion.component.html',
  styleUrls: ['./single-accordion.component.scss'],
})
export class SingleAccordionComponent {
  @Input()
  opened: boolean = false;
  @Output()
  openedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input()
  headerOnTop: boolean = true;

  @Input()
  showTitleIcon: boolean = false;

  @Input()
  headerTitle: string = '';

  @Input()
  containerMode: boolean = false;

  @Input()
  formError: boolean;

  toggleOpened() {
    this.opened = !this.opened;
    this.openedChange.emit(this.opened);
  }
}
