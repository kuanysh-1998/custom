import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'wp-custom-switch',
  templateUrl: './wp-switch.component.html',
  styleUrls: ['./wp-switch.component.scss'],
})
export class WpSwitchComponent {
  @Input() isChecked: boolean = false;
  @Output() isCheckedChange = new EventEmitter<boolean>();

  toggleSwitch() {
    this.isChecked = !this.isChecked;
    this.isCheckedChange.emit(this.isChecked);
  }
}
