import {
  ChangeDetectorRef,
  Component,
  ElementRef,
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
  NgControl,
  Validators,
} from '@angular/forms';
import { Icons } from '../../assets/svg.types';

@Component({
  selector: 'wk-text-field',
  templateUrl: './text-field.component.html',
  styleUrls: ['./text-field.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TextFieldComponent implements ControlValueAccessor {
  @Input() public label?: string;
  @Input() public labelLocation: 'top' | 'left' = 'top';
  @Input() public labelInfo = '';

  @Input() public required?: boolean;
  @Input() public placeholder = '';
  @Input() public disabled?: boolean;
  @Input() public readOnly?: boolean;

  @Input() public icon: Icons;
  @Input() public iconRight: Icons;
  @Input() public token?: string;

  @Input() public error: boolean;
  @Input() public errorMessage: string;
  @Input() public helperText?: string;
  @Input() public size: 'default' | 'small' = 'default';

  @Input() public prefix?: string;
  @Input() public postfix?: string;

  @Input()
  public set value(value: string | number | undefined | null) {
    if (value === undefined || value === null) {
      this._value = '';
      this._onChange?.('');
      return;
    }
    if (value !== this._value) {
      this._value = `${value}`;
      this._onChange?.(`${value}`);
    }
  }

  public get value(): string {
    return this._value;
  }

  @Output() public changed = new EventEmitter<Event>();
  @Output() public blurred = new EventEmitter<void>();

  private _onTouched: () => void;
  private _onChange: (value: string) => void;

  @ViewChild('inputEl') private readonly _inputEl: ElementRef<HTMLInputElement>;

  public get inputClasses(): Record<string, boolean> {
    return {
      input: true,
      invalid: this.isError,
      [this.size]: true,
      'with-prefix': !!this.prefix,
      'with-postfix': !!this.postfix,
      'with-icon': !!this.icon,
      'with-icon-right': !!this.iconRight,
    };
  }

  public get isDisabled(): boolean {
    return this._isDisabled || !!this.disabled;
  }

  private _value = '';
  private _isDisabled = false;

  public get control(): FormControl | undefined {
    return <FormControl<unknown>>this._ngControl?.control;
  }

  public get isSmall(): boolean {
    return this.size === 'small';
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

  public focus(): void {
    this._inputEl.nativeElement.focus();
  }

  public onValueChange(event: Event): void {
    this.value = (event.target as HTMLInputElement).value ?? '';
    this.changed.emit(event);
  }

  public writeValue(value: string): void {
    this.value = value;
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

  public blur(): void {
    this._onTouched?.();
    this.blurred.emit();
  }
}
