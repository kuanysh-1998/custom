import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  EventEmitter,
  Input,
  Optional,
  Output,
  Self,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NgControl,
  Validators,
} from '@angular/forms';

import { MaskitoModule } from '@maskito/angular';
import {
  DxDateBoxComponent,
  DxDateBoxModule,
  DxDateRangeBoxComponent,
  DxDateRangeBoxModule,
} from 'devextreme-angular';
import { locale } from 'devextreme/localization';
import { ValueChangedEvent } from 'devextreme/ui/date_box';
import { ValueChangedEvent as RangeValueChangedEvent } from 'devextreme/ui/date_range_box';
import { FormErrorComponent } from '../form-error/form-error.component';
import { LabelComponent } from '../label/label.component';
import { DatePickerValue } from './date-picker.types';

locale('ru');

@Component({
  selector: 'wk-date-picker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DxDateRangeBoxModule,
    DxDateBoxModule,
    MaskitoModule,
    FormErrorComponent,
    LabelComponent,
  ],
  templateUrl: './date-picker.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./styles/date-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerComponent implements ControlValueAccessor, DoCheck {
  @Input() public type: 'default' | 'range' = 'default';
  @Input() public format: 'date' | 'datetime' = 'date';
  @Input() public label = '';
  @Input() public labelLocation: 'top' | 'left' = 'top';
  @Input() public startDatePlaceholder = '';
  @Input() public endDatePlaceholder = '';
  @Input() public disabled = false;
  @Input() public readOnly = false;
  @Input() public error = false;
  @Input() public labelInfo = '';
  @Input() public showClearButton = true;

  @Input() public required?: boolean;
  @Input() public token?: string;
  @Input() public errorMessage?: string;
  @Input() public helperText?: string;
  @Input() public minDate?: Date;
  @Input() public maxDate?: Date;

  @Input()
  public set value(val: DatePickerValue) {
    this._value = val;
    this._onChange?.(val);
  }

  public get value(): DatePickerValue {
    return this._value;
  }

  public get arrayValue(): (Date | number | string)[] {
    if (Array.isArray(this.value)) {
      return this.value as (Date | number | string)[];
    }
    return [];
  }

  public get onlyValue(): Date | number | string {
    if (!Array.isArray(this.value)) {
      return this.value ?? '';
    }
    return '';
  }

  @Output() public changed = new EventEmitter<DatePickerValue>();

  public onTouched: () => void;

  @ViewChild('dateBox', { static: false })
  private readonly _dateBox?: DxDateBoxComponent;
  @ViewChild('dateRangeBox', { static: false })
  private readonly _dateRangeBox?: DxDateRangeBoxComponent;

  private _onChange: (value: DatePickerValue) => void;

  private _value: DatePickerValue = null;
  private _isDisabled = false;

  public get isRange(): boolean {
    return this.type === 'range';
  }

  public get isDisabled(): boolean {
    return this._isDisabled || this.disabled;
  }

  public get isRequired(): boolean {
    const hasRequiredValidator = !!(
      this.control?.hasValidator(Validators.required) && this.required !== false
    );
    return this.required || hasRequiredValidator;
  }

  public get isError(): boolean {
    return (this.control?.invalid && this.control?.touched) || this.error;
  }

  public get control(): FormControl | undefined {
    return <FormControl<unknown>>this._ngControl?.control;
  }

  public get activeComponent():
    | DxDateBoxComponent
    | DxDateRangeBoxComponent
    | undefined {
    return this.isRange ? this._dateRangeBox : this._dateBox;
  }

  public get dateMask(): string {
    return this.format === 'date' ? 'dd.MM.yyyy' : 'dd.MM.yyyy HH:mm';
  }

  constructor(
    @Self() @Optional() private readonly _ngControl: NgControl,
    private readonly _cdr: ChangeDetectorRef
  ) {
    if (this._ngControl) {
      this._ngControl.valueAccessor = this;
    }
  }

  public ngDoCheck(): void {
    this._cdr.markForCheck();
  }

  public onDateChange(event: ValueChangedEvent | RangeValueChangedEvent): void {
    const newValue = event.value;

    if (this.isRange && newValue && Array.isArray(newValue) && newValue[1]) {
      newValue[1] = this._setEndOfDay(newValue[1]);
    }

    this.value = newValue;
    this.changed.emit(newValue);
  }

  public writeValue(value: DatePickerValue): void {
    this._value = value;
  }

  public registerOnChange(fn: (value: DatePickerValue) => void): void {
    this._onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this._isDisabled = isDisabled;
    this._cdr.detectChanges();
  }

  private _setEndOfDay(date: Date): Date {
    const endDate = new Date(date);

    const END_OF_DAY_HOURS = 23;
    const END_OF_DAY_MINUTES = 59;
    const END_OF_DAY_SECONDS = 59;
    const END_OF_DAY_MILLISECONDS = 999;

    endDate.setHours(
      END_OF_DAY_HOURS,
      END_OF_DAY_MINUTES,
      END_OF_DAY_SECONDS,
      END_OF_DAY_MILLISECONDS
    );
    return endDate;
  }
}
