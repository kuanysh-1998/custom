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

import {
  AsyncValidatorFn,
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  FormsModule,
  NgControl,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { take } from 'rxjs';
import { Icons } from '../../assets/svg.types';
import { BadgeComponent } from '../badge/badge.component';
import { FormErrorComponent } from '../form-error/form-error.component';
import { LabelComponent } from '../label/label.component';
import { SvgComponent } from '../svg/svg.component';
import { TextFieldComponent } from '../text-field/text-field.component';

@Component({
  selector: 'wk-tag-field',
  standalone: true,
  imports: [
    CommonModule,
    TextFieldComponent,
    BadgeComponent,
    FormsModule,
    SvgComponent,
    ReactiveFormsModule,
    LabelComponent,
    FormErrorComponent,
  ],
  templateUrl: './tag-field.component.html',
  styleUrls: ['./tag-field.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagFieldComponent implements OnInit, ControlValueAccessor {
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

  @Input() public prefix?: string;
  @Input() public postfix?: string;

  @Input() public validators: ValidatorFn | ValidatorFn[] = [];
  @Input() public asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[];
  @Input() public firstFixed = false;
  @Input() public onlyNumbers = true;

  @Input()
  public set value(value: string[]) {
    this._value = value;
    this.onChange?.(value);
  }

  public get value(): string[] {
    return this._value;
  }

  @Output() public changed = new EventEmitter<string[]>();

  public readonly iconClose = Icons.Cross;

  public onChange: (value: string[]) => void;
  public onTouched: () => void;

  public formControl: FormControl<string> = this._fb.nonNullable.control(
    '',
    this.validators
  );

  private _isDisabled = false;
  private _value: string[] = [];

  public get isDisabled(): boolean {
    return this._isDisabled || !!this.disabled;
  }

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
    private readonly _fb: FormBuilder,
    private readonly _cdr: ChangeDetectorRef,
    @Self() @Optional() private readonly _ngControl: NgControl
  ) {
    if (this._ngControl) {
      this._ngControl.valueAccessor = this;
    }
  }

  public writeValue(value: string[]): void {
    this.value = value;
  }

  public registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this._isDisabled = isDisabled;
    this._cdr.detectChanges();
  }

  public ngOnInit(): void {
    this.formControl.addValidators(this.validators);
    if (this.asyncValidators) {
      this.formControl.addAsyncValidators(this.asyncValidators);
    }
  }

  public changeInput(event: TextFieldComponent): void {
    if (this.onlyNumbers) {
      event.value = event.value.replace(/[^0-9]*/g, '');
    }
  }

  public addTag(text: string): void {
    this.formControl.markAsTouched();
    if (!text) return;

    const currentStatus = this.formControl.status;

    if (currentStatus === 'VALID') {
      this.addTagToList(text);
    } else if (currentStatus === 'PENDING') {
      this.formControl.statusChanges.pipe(take(1)).subscribe((status) => {
        if (status === 'VALID') {
          this.addTagToList(text);
        }
      });
    }
  }

  public addTagToList(text: string): void {
    this.value = [...this.value, text];
    this.formControl.clearAsyncValidators();
    this.formControl.setValue('');
    if (this.asyncValidators) {
      this.formControl.addAsyncValidators(this.asyncValidators);
    }
    this.changed.emit(this.value);
  }

  public deleteTag(index: number): void {
    if (this.firstFixed && index === 0) return;
    this.value = this.value.filter((_, idx) => idx !== index);
    this.changed.emit(this.value);
  }
}
