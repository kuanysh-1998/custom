import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DxSwitchModule } from 'devextreme-angular';
import { ValueChangedEvent } from 'devextreme/ui/switch';
import { LabelComponent } from '../label/label.component';
import { SvgComponent } from '../svg/svg.component';

@Component({
  selector: 'wk-switch',
  standalone: true,
  imports: [CommonModule, LabelComponent, SvgComponent, DxSwitchModule],
  templateUrl: './switch.component.html',
  styleUrls: ['./switch.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SwitchComponent),
      multi: true,
    },
  ],
})
export class SwitchComponent implements ControlValueAccessor {
  @Input() public label = '';
  @Input() public position: 'left' | 'right' | 'top' = 'right';
  @Input() public disabled = false;

  @Input() public required?: boolean;
  @Input() public token?: string;

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

  private _isDisabled = false;
  private _value = false;

  private _onTouched: () => void;
  private _onChange: (value: boolean) => void;

  public get isDisabled(): boolean {
    return this.disabled || this._isDisabled;
  }

  constructor(private readonly _cdr: ChangeDetectorRef) {}

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

  public switchToggle(): void {
    if (this.isDisabled) return;
    this.value = !this.value;
  }

  public switchChanged(event: ValueChangedEvent): void {
    this._onTouched?.();
    this.value = event.value;
    this.changed.emit(this.value);
  }
}
