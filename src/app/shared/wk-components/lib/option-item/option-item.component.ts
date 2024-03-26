import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Optional,
  Output,
  Self,
  ViewEncapsulation,
} from '@angular/core';

import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { LabelComponent } from '../label/label.component';
import { RadioComponent } from '../radio/radio.component';
import { SvgComponent } from '../svg/svg.component';

@Component({
  selector: 'wk-option-item',
  standalone: true,
  imports: [CommonModule, LabelComponent, SvgComponent, RadioComponent],
  templateUrl: './option-item.component.html',
  styleUrls: ['./option-item.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionItemComponent implements OnInit, ControlValueAccessor {
  @Input() public value: string;
  @Input() public header: string;
  @Input() public subtext: string;
  @Input() public shortHeader = true;
  @Input() public shortSubtext = true;
  @Input() public externalSubtextClass: string;
  @Input() public enableRadio = true;

  @Input()
  public set selectedValue(value: string | number) {
    if (value === null || value === undefined) return;
    this._selectedValue = value;
  }

  @Input() public disabled = false;
  @Input() public token?: string;

  @Output() public changed = new EventEmitter<string>();

  private _isDisabled = false;

  public get isDisabled(): boolean {
    return this.disabled || this._isDisabled;
  }

  public get selectedValue(): string | number {
    return (this.control?.value || this._selectedValue) ?? '';
  }

  public get checked(): boolean {
    return (
      this.value === this.selectedValue ||
      (this.control?.value && this.value === this.control.value)
    );
  }

  public get control(): FormControl | undefined {
    return <FormControl<unknown>>this._ngControl?.control;
  }

  private _onChange?: (value: string) => void;
  private _onTouched?: () => void;

  private _selectedValue: string | number = '';

  constructor(
    private readonly _cdr: ChangeDetectorRef,
    @Self() @Optional() private readonly _ngControl?: NgControl
  ) {
    if (this._ngControl) {
      this._ngControl.valueAccessor = this;
    }
  }

  public ngOnInit(): void {
    if (this.control) {
      this.control.valueChanges.subscribe(() => {
        this._cdr.markForCheck();
      });
    }
  }

  public writeValue(value: string): void {
    this.selectedValue = value;
    this._onChange?.(value);
  }

  public registerOnChange(fn: (value: string) => void): void {
    this._onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this._isDisabled = isDisabled;
    this._cdr.detectChanges();
  }

  public selectRadio(): void {
    if (this.isDisabled) return;
    this._onTouched?.();
    this._onChange?.(this.value);
    this.changed.emit(this.value);
  }
}
