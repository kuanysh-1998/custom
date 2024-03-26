import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  EventEmitter,
  Input,
  OnInit,
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

import { MaskitoModule } from '@maskito/angular';
import { MaskitoOptions } from '@maskito/core';
import {
  maskitoNumberOptionsGenerator,
  maskitoParseNumber,
} from '@maskito/kit';
import { DxNumberBoxModule, DxTextBoxModule } from 'devextreme-angular';
import { Icons } from '../../assets/svg.types';
import { FormErrorComponent } from '../form-error/form-error.component';
import { LabelComponent } from '../label/label.component';
import { SvgComponent } from '../svg/svg.component';
import { TextFieldComponent } from '../text-field/text-field.component';

@Component({
  selector: 'wk-number-input',
  standalone: true,
  imports: [
    CommonModule,
    DxTextBoxModule,
    LabelComponent,
    FormErrorComponent,
    SvgComponent,
    DxNumberBoxModule,
    TextFieldComponent,
    MaskitoModule,
  ],
  templateUrl: './number-input.component.html',
  styleUrls: ['./number-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberInputComponent
  implements ControlValueAccessor, OnInit, DoCheck
{
  @Input() public label?: string;
  @Input() public labelLocation: 'top' | 'left' = 'top';
  @Input() public labelInfo = '';

  @Input() public required?: boolean;
  @Input() public placeholder = '';
  @Input() public disabled: boolean;
  @Input() public readOnly: boolean;

  @Input() public icon: Icons;
  @Input() public token?: string;

  @Input() public error?: boolean;
  @Input() public errorMessage: string;
  @Input() public helperText?: string;
  @Input() public size: 'default' | 'small' = 'default';

  @Input() public prefix?: string;
  @Input() public postfix?: string;

  @Input()
  public set min(value: number) {
    this._min = value;
    this.maskOptions = this._setupMaskOptions();
  }

  @Input()
  public set max(value: number) {
    this._max = value;
    this.maskOptions = this._setupMaskOptions();
  }

  @Input() public precision = 0;
  @Input() public showControlButtons = true;

  @Input()
  public set value(value: number | undefined | null) {
    if (value !== undefined && value !== this._value) {
      this._value = value;
      this._onChange?.(value);
    }

    this._cdr.markForCheck();
  }

  public get value(): number | undefined | null {
    return this._value;
  }

  @Output() public changed = new EventEmitter<number | null>();

  public readonly arrowUpIcon = Icons.ArrowMiniUp;
  public readonly arrowDownIcon = Icons.ArrowMiniDown;

  public maskOptions: MaskitoOptions;

  public onTouched: () => void;
  private _onChange: (value: number | undefined | null) => void;

  private _value: number | undefined | null;
  private _isDisabled = false;

  private _min = 0;
  private _max = 1_000_000_000_000_000;

  public get isDisabled(): boolean {
    return this._isDisabled || this.disabled;
  }

  public get control(): FormControl | undefined {
    return <FormControl<unknown>>this._ngControl?.control;
  }

  public get isError(): boolean {
    return (this.control?.invalid && this.control?.touched) || !!this.error;
  }

  public get isRequired(): boolean {
    const hasRequiredValidator = !!(
      this.control?.hasValidator(Validators.required) && this.required !== false
    );
    return this.required || hasRequiredValidator;
  }

  public get shouldBeControls(): boolean {
    return (
      !this.isDisabled &&
      !this.readOnly &&
      this.showControlButtons &&
      !this.postfix &&
      this.size !== 'small'
    );
  }

  constructor(
    private readonly _cdr: ChangeDetectorRef,
    @Self() @Optional() private readonly _ngControl?: NgControl
  ) {
    if (this._ngControl) {
      this._ngControl.valueAccessor = this;
    }
  }

  public ngOnInit(): void {
    this.maskOptions = this._setupMaskOptions();
  }

  public ngDoCheck(): void {
    this._cdr.markForCheck();
  }

  public increase(): void {
    const newValue = (this.value ?? 0) + 1;
    if (newValue <= this._max) {
      this.value = newValue;
    }
  }

  public decrease(): void {
    const newValue = (this.value ?? 0) - 1;
    if (newValue >= this._min) {
      this.value = newValue;
      return;
    }
  }

  public onChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const inputValue = input.value;

    if (`${this.value}` === inputValue) return;

    if (inputValue === '') {
      this.value = null;
      this.changed.emit(null);
      return;
    }

    if (inputValue === '−' || inputValue === '-') {
      return;
    }

    let parsedNumber = maskitoParseNumber(inputValue);

    if (parsedNumber > this._max) {
      parsedNumber = this._max;
      input.value = `${this._max}`;
    }

    if (parsedNumber < this._min) {
      parsedNumber = this._min;
      input.value = `${this._min}`;
    }

    if (!isNaN(parsedNumber)) {
      this.value = parsedNumber;
      this.changed.emit(parsedNumber);
    }
  }

  public writeValue(value: number | undefined): void {
    this.value = value;
  }

  public registerOnChange(
    fn: (value: number | undefined | null) => void
  ): void {
    this._onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this._isDisabled = isDisabled;
    this._cdr.detectChanges();
  }

  private _setupMaskOptions(): MaskitoOptions {
    return {
      ...maskitoNumberOptionsGenerator({
        decimalSeparator: '.',
        thousandSeparator: ' ',
        precision: this.precision,
        min: this._min ?? undefined,
        max: this._max ?? undefined,
      }),
      postprocessors: [
        ({
          value,
          selection,
        }): { selection: [number, number]; value: string } => {
          const [from, to] = selection;
          const noRepeatedLeadingZeroesValue = value.replace(/^0+/, '0');
          const removedCharacters =
            value.length - noRepeatedLeadingZeroesValue.length;

          return {
            value: noRepeatedLeadingZeroesValue,
            selection: [
              Math.max(from - removedCharacters, 0),
              Math.max(to - removedCharacters, 0),
            ],
          };
        },
        ({
          value,
          selection,
        }): {
          selection: readonly [from: number, to: number];
          value: string;
        } => {
          const MIN_LENGTH = 2;

          if (
            value.length >= MIN_LENGTH &&
            value.startsWith('0') &&
            value[1] !== '.'
          ) {
            value = value.replace(/^0/, '');
            selection = [selection[0] - 1, selection[1] - 1];
          }
          return {
            value,
            selection,
          };
        },
      ],
    };
  }
}
