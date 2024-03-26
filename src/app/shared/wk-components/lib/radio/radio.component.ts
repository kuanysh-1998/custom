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
import { Icons } from '../../assets/svg.types';
import { LabelComponent } from '../label/label.component';
import { SvgComponent } from '../svg/svg.component';

@Component({
  selector: 'wk-radio',
  standalone: true,
  imports: [CommonModule, LabelComponent, SvgComponent],
  templateUrl: './radio.component.html',
  styleUrls: ['./radio.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioComponent implements OnInit, ControlValueAccessor {
  @Input() public value: string | number;
  @Input() public selectedValue: string | number;

  @Input() public label = '';
  @Input() public disabled = false;
  @Input() public token?: string;
  @Input() public tabIndex?: string | number = 0;

  @Output() public changed = new EventEmitter<string | number>();

  public readonly filledRadioIcon = Icons.RadioChecked;
  public readonly emptyRadioIcon = Icons.RadioEmpty;

  private _isDisabled = false;

  public get isDisabled(): boolean {
    return this.disabled || this._isDisabled;
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

  private _onChange?: (value: string | number) => void;
  private _onTouched?: () => void;

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
    this._onChange?.(value);
  }

  public registerOnChange(fn: (value: string | number) => void): void {
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
