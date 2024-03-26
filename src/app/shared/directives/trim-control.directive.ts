import { Directive } from '@angular/core';
import { NgControl, ControlValueAccessor } from '@angular/forms';

@Directive({ selector: '[trimControl]' })
export class TrimControlValueDirective {
  constructor(private ngControl: NgControl) {
    trimValueAccessor(ngControl.valueAccessor)
  }
}

function trimValueAccessor(valueAccessor: ControlValueAccessor) {
  const original = valueAccessor.registerOnChange;

  valueAccessor.registerOnChange = (fn: (_: unknown) => void) => {
    return original.call(valueAccessor, (value: unknown) => {
      return fn(typeof value === 'string' ? value.trim() : value);
    });
  };
}
