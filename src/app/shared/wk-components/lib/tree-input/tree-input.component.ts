import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
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

import { DxDropDownBoxModule, DxScrollViewModule } from 'devextreme-angular';

import { Icons } from '../../assets/svg.types';
import { FormErrorComponent } from '../form-error/form-error.component';
import { LabelComponent } from '../label/label.component';
import { SvgComponent } from '../svg/svg.component';
import { TextFieldComponent } from '../text-field/text-field.component';
import { TreeViewComponent } from '../tree-view/tree-view.component';

import { ButtonComponent } from '../button/button.component';
import { TreeViewItems, TreeViewValue } from '../tree-view/tree-view.types';
import { TreeInputValue } from './tree-input.types';

@Component({
  selector: 'wk-tree-input',
  standalone: true,
  imports: [
    CommonModule,
    TreeViewComponent,
    DxDropDownBoxModule,
    SvgComponent,
    LabelComponent,
    FormErrorComponent,
    TextFieldComponent,
    DxScrollViewModule,
    ButtonComponent,
  ],
  templateUrl: './tree-input.component.html',
  styleUrls: ['./tree-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TreeInputComponent implements ControlValueAccessor {
  @Input() public label = '';
  @Input() public labelLocation: 'top' | 'left' = 'top';
  @Input() public labelInfo = '';

  @Input() public options: TreeViewItems[] = [];

  @Input() public buttonEnabled?: boolean = true;
  @Input() public buttonLabel = 'Добавить товар';
  @Input() public buttonIcon?: Icons;

  @Input() public icon?: Icons;
  @Input() public required?: boolean;
  @Input() public disabled?: boolean;
  @Input() public readOnly?: boolean;

  @Input() public token?: string;

  @Input() public error?: boolean;
  @Input() public errorMessage?: string;
  @Input() public helperText?: string;

  @Input() public multiple = true;
  @Input() public searchInput = false;
  @Input() public showClearButton = true;

  @Input()
  public set value(value: TreeInputValue) {
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

  public get value(): TreeInputValue {
    return this._value;
  }

  @Output() public changed = new EventEmitter<
    (number | string)[] | number | string | null
  >();
  @Output() public buttonClicked = new EventEmitter<void>();

  public readonly iconClear = Icons.Cross;

  public optionsForInput: TreeViewItems[] = [];
  public isOpen = false;

  public onTouched: () => void;
  private _onChange: (value: TreeInputValue) => void;

  private _isDisabled = false;
  private _value: (string | number)[] = [];

  @ViewChild('treeViewWrapper') private readonly _dxTreeView: TreeViewComponent;

  public get hasValue(): boolean {
    return (
      Array.isArray(this.value) &&
      !!this.value.length &&
      this.showClearButton &&
      !this.disabled &&
      !this.readOnly
    );
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

  public get isDisabled(): boolean {
    return this._isDisabled || !!this.disabled;
  }

  constructor(
    private readonly _cdr: ChangeDetectorRef,
    @Self() @Optional() private readonly _ngControl: NgControl
  ) {
    if (this._ngControl) {
      this._ngControl.valueAccessor = this;
    }
  }

  public writeValue(value: TreeInputValue): void {
    this.value = value;
  }

  public registerOnChange(fn: (value: TreeInputValue) => void): void {
    this._onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this._isDisabled = isDisabled;
    this._cdr.detectChanges();
  }

  public selectItem(event: TreeViewValue): void {
    if (event === undefined || event === null) {
      this.value = [];
      this.changed.emit(null);
      this._cdr.detectChanges();
      return;
    }

    if (!this.multiple && !Array.isArray(event)) {
      this.value = [event];
      this.changed.emit(event);
      this.isOpen = false;
      this._cdr.detectChanges();
      return;
    }

    this.value = event;
    this.changed.emit(event);
    this._cdr.detectChanges();
  }

  public covertOptionsArray(items = this.options): void {
    for (const item of items) {
      const { items: subItems, ...rest } = item;
      this.optionsForInput.push(rest);
      if (subItems) {
        this.covertOptionsArray(subItems);
      }
    }

    this._cdr.detectChanges();
  }

  public clearValue(): void {
    this._dxTreeView.unselectAll();

    if (this.multiple) {
      this.changed.emit([]);
    } else {
      this.changed.emit(null);
    }
    this.value = [];
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
}
