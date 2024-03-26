import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Optional,
  Output,
  Self,
  ViewEncapsulation,
} from '@angular/core';

import {
  ControlValueAccessor,
  FormControl,
  NgControl,
  Validators,
} from '@angular/forms';
import { Icons } from '../../assets/svg.types';
import { Links } from '../link/link.types';

@Component({
  selector: 'wk-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxComponent implements ControlValueAccessor {
  @Input() public label = '';
  @Input() public disabled = false;
  @Input() public error = false;
  @Input() public tabIndex = 0;

  @Input() public required?: boolean;
  @Input() public token?: string;
  @Input() public links?: Links;

  @Input()
  public set value(value: boolean) {
    if (value !== this._value) {
      this._value = value;
      this._onChange?.(value);
    }
  }

  public get value(): boolean {
    return this._value;
  }

  @Output() public changed = new EventEmitter<boolean>();

  public readonly filledCheckboxIcon = Icons.CheckboxFilled;
  public readonly emptyCheckboxIcon = Icons.CheckboxEmpty;

  private _isDisabled = false;
  private _value = false;

  private _onTouched: () => void;
  private _onChange: (value: boolean) => void;

  public get isDisabled(): boolean {
    return this.disabled || this._isDisabled;
  }

  public get control(): FormControl | undefined {
    return <FormControl<unknown>>this._ngControl?.control;
  }

  public get isRequired(): boolean {
    const hasRequiredValidator = !!(
      this.control?.hasValidator(Validators.required) && this.required !== false
    );
    return this.required || hasRequiredValidator;
  }

  constructor(
    private readonly _cdr: ChangeDetectorRef,
    @Self() @Optional() private readonly _ngControl?: NgControl
  ) {
    if (this._ngControl) {
      this._ngControl.valueAccessor = this;
    }
  }

  public writeValue(value: boolean): void {
    this.value = value;
  }

  public registerOnChange(fn: (value: boolean) => void): void {
    this._onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this._isDisabled = isDisabled;
    this._cdr.detectChanges();
  }

  public toggleCheckbox(): void {
    if (this.isDisabled) return;
    this._onTouched?.();
    this.value = !this.value;
    this.changed.emit(this.value);
  }
}
