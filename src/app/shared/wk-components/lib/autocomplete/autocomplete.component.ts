import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
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

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  DxDropDownBoxModule,
  DxPopoverModule,
  DxScrollViewModule,
} from 'devextreme-angular';
import CustomStore from 'devextreme/data/custom_store';
import { Subject, debounceTime, delay, tap } from 'rxjs';

import { Icons } from '../../assets/svg.types';
import { ButtonComponent } from '../button/button.component';
import { FormErrorComponent } from '../form-error/form-error.component';
import { LabelComponent } from '../label/label.component';
import { ListItemComponent } from '../list-item/list-item.component';
import { ScrollComponent } from '../scroll/scroll.component';
import { SpinnerComponent } from '../spinner/spinner.component';
import { SvgComponent } from '../svg/svg.component';
import { TextFieldComponent } from '../text-field/text-field.component';
import { AutocompletePipe } from './autocomplete.pipe';
import { AutoCompleteOption } from './autocomplete.types';

@UntilDestroy()
@Component({
  selector: 'wk-autocomplete',
  standalone: true,
  imports: [
    CommonModule,
    DxDropDownBoxModule,
    ListItemComponent,
    DxScrollViewModule,
    LabelComponent,
    FormErrorComponent,
    SvgComponent,
    ButtonComponent,
    AutocompletePipe,
    TextFieldComponent,
    DxPopoverModule,
    SpinnerComponent,
    ScrollComponent,
  ],
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteComponent implements OnInit, ControlValueAccessor {
  @Input() public label = '';
  @Input() public labelLocation: 'top' | 'left' = 'top';
  @Input() public labelInfo = '';
  @Input() public placeholder = '';

  @Input() public dataSource: CustomStore<AutoCompleteOption[]>;
  @Input() public options: AutoCompleteOption[] = [];

  @Input() public debounceTime = 300;
  @Input() public displayExpr = 'name';
  @Input() public icon: Icons;
  @Input() public token?: string;

  @Input() public error?: boolean;
  @Input() public errorMessage?: string;
  @Input() public helperText?: string;
  @Input() public emptyMessage = 'Нет результатов';

  @Input() public buttonEnabled?: boolean;
  @Input() public buttonLabel = '';
  @Input() public buttonIcon?: Icons;

  @Input() public required?: boolean;
  @Input() public disabled?: boolean;
  @Input() public readOnly?: boolean;

  @Input() public showClearButton = true;
  @Input() public clearAfterSelect = false;
  @Input() public searchFields = ['name'];

  @Input() public customNameFormat?: (value: any) => string;

  @Input()
  public set value(value: string | number | null | undefined) {
    if (value === this._value) return;
    if (value === undefined || value === null || value === '') {
      this._value = null;
      this._onChange?.(null);
      this.changed.emit(null);
      this.selectedItem.emit(null);
      return;
    }

    this._onChange?.(value);
    this.changed.emit(value);
    const optionName = this.options.find((i) => i.id === value);

    this.searchValue = (optionName?.[this.displayExpr] as string) ?? '';

    this.selectedItem.emit(optionName);
    this._value = value;

    if (this.clearAfterSelect) {
      this._value = null;
      this.searchValue = '';
    }
  }

  public get value(): string | number | null {
    return this._value;
  }

  @Output() public buttonClicked = new EventEmitter<void>();
  @Output() public changed = new EventEmitter<string | number | null>();
  @Output() public selectedItem = new EventEmitter<any>();

  public readonly iconClear = Icons.Cross;
  public readonly iconChevron = Icons.ChevronDown;

  public isOpen = false;
  public loading = false;
  public searchValue = '';
  public popoverWidth: number;

  public spinner: Icons = Icons.Spinner;
  public searchField$$ = new Subject<string | number | null>();

  private _onTouched: () => void;
  private _onChange: (value: string | number | null) => void;

  private _value: string | number | null = '';

  @ViewChild('textfield') private readonly _textfield: TextFieldComponent;
  @ViewChild('textfieldWrapper') private readonly _textfieldWrapper: ElementRef;

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
      !!this.searchValue &&
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

  public ngOnInit(): void {
    if (this.dataSource) {
      this.searchField$$
        .pipe(
          tap(() => {
            this.loading = true;
          }),
          delay(300),
          untilDestroyed(this),
          debounceTime(this.debounceTime)
        )
        .subscribe((value) => {
          this.dataSource.load({ filter: value }).then((data) => {
            const typedData = data as { data: AutoCompleteOption[] };
            this.options = typedData.data;
            this.loading = false;
            this._cdr.detectChanges();
          });
        });
    }
  }

  public writeValue(value: string | number): void {
    this.value = value;
    if (value && value !== 0 && this.dataSource) {
      this.loading = true;
      this._cdr.detectChanges();

      this.dataSource.load({ filter: null }).then((data) => {
        const typedData = data as { data: AutoCompleteOption[] };
        this.options = typedData.data;
        const optionName = this.options.find((i) => i.id === this.value);
        this.searchValue = (optionName?.[this.displayExpr] as string) ?? '';
        this.loading = false;
        this._cdr.detectChanges();
      });
    }
  }

  public registerOnChange(fn: (value: string | number | null) => void): void {
    this._onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this._isDisabled = isDisabled;
    this._cdr.detectChanges();
  }

  public getText(option: AutoCompleteOption): string {
    return this.customNameFormat
      ? this.customNameFormat(option)
      : (option[this.displayExpr] as string) ?? '';
  }

  public searchChange(event: Event): void {
    this._setupMinWidth();
    const input = event.target as HTMLInputElement;
    this.searchValue = input.value ?? '';
    this.searchField$$.next(input.value ?? '');
    this.isOpen = true;
  }

  public closeHandler(): void {
    this._onTouched?.();
    const optionName = this.options.find((i) => i.id === this.value);
    if (this.searchValue !== (optionName?.[this.displayExpr] as string) ?? '') {
      this.searchField$$.next('');
      this.searchValue = '';

      this.value = null;
    }
  }

  public valueChange(event: AutoCompleteOption): void {
    this.searchValue = (event?.[this.displayExpr] as string) ?? '';
    this.searchField$$.next((event?.[this.displayExpr] as string) ?? '');

    this.value = event.id;

    this.isOpen = false;
    this._cdr.detectChanges();
  }

  public clearValue(): void {
    this._onTouched?.();
    this.searchValue = '';
    this.searchField$$.next(null);

    this.value = null;
    this._cdr.detectChanges();
  }

  public open(): void {
    if (this.isOpen) {
      this.isOpen = false;
      return;
    }
    this._setupMinWidth();
    this._textfield.focus();
    this.isOpen = !this.isOpen;
    this.searchField$$.next(null);
    this._cdr.detectChanges();
  }

  public close(): void {
    this.isOpen = false;
    this.closeHandler();
  }

  private _setupMinWidth(): void {
    this.popoverWidth = this._textfieldWrapper.nativeElement.offsetWidth;
  }
}
