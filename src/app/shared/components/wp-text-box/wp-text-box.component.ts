import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IValidatableDxComponent } from '../../directives/dx-validator.directive';

@Component({
  selector: 'wp-text-box',
  templateUrl: './wp-text-box.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => WpTextBoxComponent),
      multi: true,
    },
  ],
})
export class WpTextBoxComponent
  implements ControlValueAccessor, IValidatableDxComponent
{
  @Input() label: string;
  @Input() width: string;
  isValid: boolean = true;
  validationErrors: any = null;
  @Output() onBlur = new EventEmitter<void>(); 

  private _value: string = '';

  get value(): string {
    return this._value;
  }

  set value(val: string) {
    this._value = val;
    this.onChange(val);
    this.onTouched();
  }

  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    if (value !== undefined) {
      this.value = value;
    }
  }

  onBlurHandler(): void {
    this.onBlur.emit(); 
  }
  

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  handleInput(event: KeyboardEvent): void {
    const allowedKeys = ['ArrowLeft', 'ArrowRight', 'Backspace', 'Delete'];

    if (!/[0-9]/.test(event.key) && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  onValueChange(value: any): void {
    if (this.value !== value) {
      this.value = value;
    }
  }
}
