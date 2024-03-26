import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ColorPicker } from '../../models/color-picker.model';
import { WP_COLOR_PICKER_DEFAULT_COLORS } from '../../consts/wp-color-picker.const';

@Component({
  selector: 'wp-color-picker',
  templateUrl: './wp-color-picker.component.html',
  styleUrls: ['./wp-color-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WpColorPickerComponent implements OnInit {
  @Input() color: string;
  @Output() valueColorChanged = new EventEmitter();
  @Input() allowedColors: ColorPicker[] = WP_COLOR_PICKER_DEFAULT_COLORS;

  ngOnInit(): void {}

  onSelectionChanged(e: any) {
    this.valueColorChanged.emit(e.selectedItem.color);
  }
}
