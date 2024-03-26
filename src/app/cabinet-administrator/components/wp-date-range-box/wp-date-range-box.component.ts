import { Component, OnInit, Input, forwardRef, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { DxDateRangeBoxComponent } from 'devextreme-angular';

@Component({
  selector: 'wp-date-range-box',
  templateUrl: './wp-date-range-box.component.html',
  styleUrls: ['./wp-date-range-box.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => WpDateRangeBoxComponent),
      multi: true,
    },
  ],
})
export class WpDateRangeBoxComponent implements OnInit {
  @ViewChild(DxDateRangeBoxComponent) dateRangeBox: DxDateRangeBoxComponent;
  minDate: Date | any = null;
  maxDate: Date | any = null;
  @Input() limitDays: number;
  private onChange: (value: any) => void;
  private onTouched: () => void;

  constructor() {}

  ngOnInit(): void {}

  handleDataValueChange(data: any) {
    if (data.value) {
      const [startDate] = data.value;
      const currentDate = new Date(startDate);
      this.minDate = startDate;
      this.maxDate = new Date(
        currentDate.setDate(currentDate.getDate() + this.limitDays)
      );
    }
    if (this.onChange) {
      this.onChange(data.value);
    }
    if (this.onTouched) {
      this.onTouched();
    }
  }

  writeValue(value: any) {}

  registerOnChange(fn: (value: any) => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }

  reset() {
    this.dateRangeBox.instance.reset();
  }
}
