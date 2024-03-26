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
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NgControl,
  Validators,
} from '@angular/forms';
import { DxScrollViewComponent } from 'devextreme-angular/ui/scroll-view';
import DataSource from 'devextreme/data/data_source';

import { Icons } from '../../assets/svg.types';
import {
  DropdownOption,
  DropdownOptions,
  DropdownValue,
} from './dropdown.types';

@Component({
  selector: 'wk-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class DropdownComponent implements ControlValueAccessor, DoCheck {
  @Output() requestLoadMoreData = new EventEmitter<void>();
  @ViewChild(DxScrollViewComponent, { static: false }) scrollView: DxScrollViewComponent;

  @Input() public label = '';
  @Input() public labelLocation: 'top' | 'left' = 'top';
  @Input() public labelInfo = '';
  @Input() public placeholder = '';
  @Input() public required?: boolean;
  @Input() public multiple = true;
  @Input() public displayFieldName = 'name';
  @Input() public disabled?: boolean;
  @Input() public readOnly?: boolean;
  @Input() public showClearButton = true;

  @Input() public buttonEnabled?: boolean = false;
  @Input() public buttonLabel = '';
  @Input() public buttonIcon?: Icons;

  @Input() public icon?: Icons;
  @Input() public token?: string;

  @Input() public error?: boolean;
  @Input() public errorMessage?: string;
  @Input() public helperText?: string;

  @Input() public customNameFormat?: (
    value: DropdownOption & Record<string, unknown>
  ) => string;

  @Input()
  public set value(value: DropdownValue) {
    if (
      value === null ||
      value === undefined ||
      (Array.isArray(value) && !value.length)
    ) {
      if (this.multiple) {
        this._value = [];
        this._onChange?.([]);
      } else {
        this._value = [];
        this._onChange?.(null);
      }
      return;
    }

    if (Array.isArray(value)) {
      this._value = value;
      if (this.multiple) {
        this._onChange?.(value);
      } else {
        this._onChange?.(value[0]);
      }
      return;
    }

    this._onChange?.(value);
    this._value = [value];
  }

  public get value(): (string | number)[] {
    return this._value;
  }

  // В DropdownComponent
  @Input() set options(opts: DropdownOptions | DataSource) {
    if (opts instanceof DataSource) {
      opts.load().then((data) => {
        this.updateOptions(data);
      });
    } else {
      this.updateOptions(opts);
    }
  }

  public get options(): DropdownOptions {
    return this._options;
  }

  loadMoreData() {
    this.requestLoadMoreData.emit();
  }

  @Output() public changed = new EventEmitter<
    (string | number)[] | number | string | null
  >();
  @Output() public buttonClicked = new EventEmitter<void>();

  public readonly iconClear = Icons.Cross;
  public isOpen = false;

  public onTouched: () => void;
  private _onChange: (value: DropdownValue) => void;

  private _options: DropdownOptions = [];
  private _value: (string | number)[] = [];

  private _isDisabled = false;

  public get isDisabled(): boolean {
    return this._isDisabled || !!this.disabled;
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

  public get hasValue(): boolean {
    return (
      Array.isArray(this.value) &&
      !!this.value.length &&
      this.showClearButton &&
      !this.disabled &&
      !this.readOnly
    );
  }

  constructor(
    private readonly _cdr: ChangeDetectorRef,
    @Self() @Optional() private readonly _ngControl: NgControl
  ) {
    if (this._ngControl) {
      this._ngControl.valueAccessor = this;
    }
  }

  public ngDoCheck(): void {
    this._cdr.markForCheck();
  }

  public writeValue(value: DropdownValue): void {
    this.value = value;
  }

  public registerOnChange(fn: (value: DropdownValue) => void): void {
    this._onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this._isDisabled = isDisabled;
    this._cdr.detectChanges();
  }

  public selectOption(event: boolean | void, option: DropdownOption): void {
    if (!this.multiple) {
      this.value = [option.id];
      this.changed.emit(option.id);

      this.isOpen = false;
      this._cdr.detectChanges();
      return;
    }

    if (!event) {
      this.value = this._value.filter((v: string | number) => v !== option.id);
    } else {
      this.value = [...this.value, option.id];
    }

    this.changed.emit(this.value);

    const foundOption = this.options.find((opt) => opt.id === option.id);

    if (foundOption && event) {
      foundOption.selected = event;
    }

    this._cdr.detectChanges();
  }

  public clearValue(): void {
    if (!this.multiple) {
      this.value = [];
      this.changed.emit(null);
      this._cdr.detectChanges();
      return;
    }

    this.value = [];
    this._options = this.options.map((option) => ({
      ...option,
      selected: false,
    }));

    this.changed.emit(this.value);
    this._cdr.detectChanges();
  }

  public formatDisplay(ids: string[]): string {
    const SINGLE_UNIT = 1;
    const START_TEENS = 11;
    const END_TEENS = 14;
    const TENS = 10;
    const HUNDREDS = 100;
    const MID_NUMBER_LIMIT = 5;

    function getWordEnding(count: number): string {
      if (count % TENS === SINGLE_UNIT && count % HUNDREDS !== START_TEENS) {
        return 'элемент';
      } else if (
        count % TENS > SINGLE_UNIT &&
        count % TENS < MID_NUMBER_LIMIT &&
        !(count % HUNDREDS >= START_TEENS && count % HUNDREDS <= END_TEENS)
      ) {
        return 'элемента';
      } else {
        return 'элементов';
      }
    }

    if (ids.length > SINGLE_UNIT) {
      return `Выбрано ${ids.length} ${getWordEnding(ids.length)}`;
    }
    return ids[0];
  }

  public getOptionText(
    option: DropdownOption & Record<string, unknown>,
    displayFieldName: string
  ): string {
    return (option?.[displayFieldName] as string) || '';
  }

  private _processOptions(options: DropdownOptions): DropdownOptions {
    if (!this.customNameFormat) {
      return options;
    }

    return options.map((option) => ({
      ...option,
      [this.displayFieldName]: this.customNameFormat?.(option),
    }));
  }

  public updateOptions(newOptions: any[]) {
    this._options = [...this._options, ...this._processOptions(newOptions)];
    
    this._cdr.markForCheck();
  }
}
