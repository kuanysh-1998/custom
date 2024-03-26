import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import DataSource from 'devextreme/data/data_source';
import { IValidatableDxComponent } from '../../directives/dx-validator.directive';

@Component({
  selector: 'combo-dropdown-list',
  templateUrl: './combo-dropdown-list.component.html',
  styleUrls: ['./combo-dropdown-list.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ComboDropdownListComponent),
      multi: true,
    },
  ],
})
export class ComboDropdownListComponent
  implements OnInit, ControlValueAccessor, IValidatableDxComponent
{
  isValid: boolean = true;
  validationErrors: any = null;

  _dataSource: DataSource | any[];

  @Input() get dataSource(): DataSource | any[] {
    return this._dataSource;
  }

  set dataSource(value: DataSource | any[]) {
    this._dataSource = value;
    this.updateDisplayedText();
  }

  @Input() searchExpression: string;
  @Input() isShowPopup: boolean = false;
  @Input() tooltip = [];
  @Input() placeholder: string;
  @Input() valueExpr: string;
  @Input() width: number | string = 250;

  maxLength: number = 22;
  isDropDownBoxOpened: boolean = false;
  selectedItemIndexForPopup: number;
  displayedText: string;

  selectedIds: any[] = [];
  private onChange: (value: any) => void;
  private onTouched: () => void;

  isDeletedPopupVisible: boolean = false;
  selectedItemIndexForDeletedPopup: number | null = null;

  constructor(private localization: LocalizationService) {}

  ngOnInit(): void {
    this.displayedText = this.placeholder;
  }

  selectedItemsChange(selectedItems: any[]) {
    this.triggerValueChange(selectedItems.map((x) => x.id));
    this.setDisplayTextBy(selectedItems);
  }

  setDisplayTextBy(selectedItems: any[]) {
    if (selectedItems.length === 0) {
      this.displayedText = this.placeholder;
    }
    if (selectedItems.length === 1) {
      this.displayedText = selectedItems[0][this.searchExpression];
    }
    if (selectedItems.length > 1) {
      this.displayedText =
        this.localization.getSync('Выбрано') + `: ${selectedItems.length}`;
    }
  }

  updateDisplayedText() {
    let items = [];
    if (this.dataSource instanceof DataSource) {
      items = this.dataSource.items();
    } else {
      items = <any[]>this.dataSource;
    }
    this.setDisplayTextBy(items.filter((x) => this.selectedIds.includes(x.id)));
  }

  triggerTouched(e: any) {
    if (this.onTouched) {
      this.onTouched();
    }
  }

  triggerValueChange(selectedIds: any[]) {
    if (this.onChange) {
      this.onChange(selectedIds);
    }
  }

  writeValue(value: any): void {
    this.selectedIds = value ?? [];
    this.updateDisplayedText();
  }

  registerOnChange(fn: (value: any) => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }

  showPopup(data: any) {
    if (!data.isDeleted) {
      this.selectedItemIndexForPopup = data.id;
      this.isShowPopup = true;
    }
  }

  hidePopup() {
    this.isShowPopup = false;
    this.selectedItemIndexForPopup = null;
  }

  showDeletedPopup(data: any) {
    this.selectedItemIndexForDeletedPopup = data.id;
    this.isDeletedPopupVisible = true;
  }

  hideDeletedPopup() {
    this.isDeletedPopupVisible = false;
    this.selectedItemIndexForDeletedPopup = null;
  }

  showTooltip(id: number) {
    const tooltipItem = this.tooltip.find((i) => i.id === id);
    return tooltipItem.text;
  }
}
