import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { formatDate } from 'devextreme/localization';

@Component({
  selector: 'date-range-box',
  templateUrl: './date-range-box.component.html',
  styleUrls: ['./date-range-box.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DateRangeBoxComponent),
    multi: true
  }]
})
export class DateRangeBoxComponent implements ControlValueAccessor {
  @Input() width: number | Function | string | undefined = '100%';
  @Input() placeholder: string;
  @Input() label: string;

  isPickerOpened = false;
  internalValue: DateRange | null = null;
  value: DateRange | null = null;
  private _onChange: (_: any) => void;
  private _onTouched: () => void;
  disabled: boolean = false;
  showStartComponent: boolean = true;
  start: Date | null;
  end: Date | null;

  constructor() {
    this.endCellTemplate = this.endCellTemplate.bind(this);
    this.startCellTemplate = this.startCellTemplate.bind(this);
  }

  startCellTemplate(data, index, container) {
    const startCellDay = data.date;
    if (
      this.internalValue != null &&
      startCellDay >= this.internalValue.start &&
      startCellDay <= this.internalValue.end) {
      container.classList.add("dx-calendar-selected-date");
    }

    return "cell";
  }
  endCellTemplate(data, index, container) {
    const endCellDay = <Date>data.date;
    if (endCellDay.getTime() == this.internalValue.start.getTime()) {
      container.classList.add("dx-calendar-selected-date");
    }

    return "cell";
  }

  formatDate(date: Date | null) {
    if (date == null) {
      return '';
    }
    return formatDate(date, 'shortDate');
  }


  onStartValueChanged(e) {
    this.triggerOnTouched();
    if (this.internalValue == null) {
      this.internalValue = new DateRange();
    }
    this.internalValue.start = e.value;
    this.internalValue.end = null;
    this.showStartComponent = false;
    this.triggerOnTouched();
  }
  onEndValueChanged(e) {
    this.internalValue.end = e.value;
    this.isPickerOpened = false;
  }

  onClosed(e) {
    if (this.internalValue == null) {
      this.value == null;
    } else {
      if (this.internalValue.start != null) {
        if (this.internalValue.end == null) {
          this.internalValue.end = new Date(this.internalValue.start);
        }
      }

      this.value = {
        ...this.internalValue
      };
      this.internalValue = {
        ...this.internalValue
      }
    }
    this.showStartComponent = true;
    this.triggerOnChanged();
  }

  triggerOnChanged() {
    if (this._onChange) {
      this._onChange(this.value);
    }
  }
  triggerOnTouched() {
    if (this._onTouched) {
      this._onTouched();
    }
  }

  writeValue(obj: any): void {
    if (obj == null) {
      this.value = this.internalValue = null;
      return;
    }
    const range = <DateRange>obj;
    this.value = {
      ...range
    };
    this.internalValue = {
      ...range
    };
  }

  registerOnChange(fn: (_: any) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

}

export class DateRange {
  start: Date;
  end: Date;
}
