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
  ViewEncapsulation,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NgControl,
  Validators,
} from '@angular/forms';

import { DxTextAreaModule, DxTextBoxModule } from 'devextreme-angular';
import { InputEvent } from 'devextreme/ui/text_box';
import { FormErrorComponent } from '../form-error/form-error.component';
import { LabelComponent } from '../label/label.component';
import { SvgComponent } from '../svg/svg.component';

@Component({
  selector: 'wk-text-area',
  standalone: true,
  imports: [
    CommonModule,
    DxTextBoxModule,
    LabelComponent,
    FormErrorComponent,
    SvgComponent,
    DxTextAreaModule,
  ],
  templateUrl: './text-area.component.html',
  styleUrls: ['./text-area.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TextAreaComponent implements ControlValueAccessor, DoCheck {
  @Input() public label?: string;
  @Input() public labelLocation: 'top' | 'left' = 'top';
  @Input() public labelInfo = '';

  @Input() public required?: boolean;
  @Input() public disabled: boolean;
  @Input() public readOnly: boolean;

  @Input() public token?: string;

  @Input() public error: boolean;
  @Input() public errorMessage: string;
  @Input() public helperText?: string;

  @Input() public minHeight?: number;
  @Input() public maxHeight?: number;
  @Input() public autoResizeEnabled = true;

  @Input()
  public set value(value: string) {
    if (value !== this._value) {
      this._value = value;
      this._onChange?.(value);
    }
  }

  public get value(): string {
    return this._value;
  }

  @Output() public changed = new EventEmitter<InputEvent>();

  public onTouched: () => void;
  private _onChange: (value: string) => void;

  public get isDisabled(): boolean {
    return this._isDisabled || this.disabled;
  }

  private _value = '';
  private _isDisabled = false;

  public get control(): FormControl | undefined {
    return <FormControl<unknown>>this._ngControl?.control;
  }

  public get isError(): boolean {
    return (this.control?.invalid && this.control?.touched) || this.error;
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

  public ngDoCheck(): void {
    this._cdr.markForCheck();
  }

  public onValueChange(event: InputEvent): void {
    this.value = event.event?.target.value ?? '';
    this.changed.emit(event);
  }

  public writeValue(value: string): void {
    this.value = value;
  }

  public registerOnChange(fn: (value: string) => void): void {
    this._onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this._isDisabled = isDisabled;
    this._cdr.detectChanges();
  }
}
