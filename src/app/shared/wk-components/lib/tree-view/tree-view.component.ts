import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DxTreeViewComponent, DxTreeViewModule } from 'devextreme-angular';
import {
  ContentReadyEvent,
  ItemClickEvent,
  ItemSelectionChangedEvent,
} from 'devextreme/ui/tree_view';

import { Icons } from '../../assets/svg.types';
import { TextFieldComponent } from '../text-field/text-field.component';

import { TreeViewItems, TreeViewValue } from './tree-view.types';

@Component({
  selector: 'wk-tree-view',
  standalone: true,
  imports: [CommonModule, DxTreeViewModule, TextFieldComponent],
  templateUrl: './tree-view.component.html',
  styleUrls: ['./tree-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TreeViewComponent),
      multi: true,
    },
  ],
})
export class TreeViewComponent implements ControlValueAccessor {
  @ViewChild('treeViewWrapper', { static: false })
  public dxTreeView: DxTreeViewComponent;

  @Input() public multiple = false;
  @Input() public disabled = false;
  @Input() public searchInput = false;
  @Input() public options: TreeViewItems[] = [];

  @Input()
  public set selectedItems(selectedItems: TreeViewValue) {
    this._selectedItems = selectedItems;

    this._markSelected(this.options, selectedItems);
    this._onChange?.(selectedItems);
  }

  public get selectedItems(): TreeViewValue {
    return this._selectedItems;
  }

  @Output() public changed = new EventEmitter<
    string | number | (string | number)[]
  >();
  @Output() public contentReady = new EventEmitter<ContentReadyEvent>();

  public readonly iconSearch = Icons.Search;
  public searchValue = '';

  private _onTouched: () => void;
  private _onChange: (selectedItems: TreeViewValue) => void;

  private _selectedItems: TreeViewValue = [];
  private _isDisabled = false;

  public get isDisabled(): boolean {
    return this._isDisabled || this.disabled;
  }

  constructor(private readonly _cdr: ChangeDetectorRef) {}

  public writeValue(value: TreeViewValue): void {
    this.selectedItems = value;
  }

  public registerOnChange(fn: (value: TreeViewValue) => void): void {
    this._onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this._isDisabled = isDisabled;
    this._cdr.detectChanges();
  }

  public changeMultiple(e: ItemSelectionChangedEvent): void {
    if (!this.multiple || !e.node) {
      return;
    }

    this._onTouched?.();

    const nodeKey = e.node.key as string | number;

    let newSelectedItems: (string | number)[];

    if (
      e.node.selected &&
      !(this.selectedItems as (string | number)[]).includes(nodeKey)
    ) {
      newSelectedItems = [
        ...(this.selectedItems as (string | number)[]),
        nodeKey,
      ];
    } else if (!e.node.selected) {
      const index = (this.selectedItems as (string | number)[]).indexOf(
        nodeKey
      );
      if (index > -1) {
        newSelectedItems = [
          ...(this.selectedItems as (string | number)[]).slice(0, index),
          ...(this.selectedItems as (string | number)[]).slice(index + 1),
        ];
      } else {
        newSelectedItems = this.selectedItems as (string | number)[];
      }
    } else {
      newSelectedItems = this.selectedItems as (string | number)[];
    }

    this.selectedItems = newSelectedItems;

    this.changed.emit(this.selectedItems);
    this._cdr.detectChanges();
  }

  public changeSingle(event: ItemClickEvent): void {
    event.event?.stopPropagation();

    if (this.multiple) return;
    this._onTouched?.();

    this.changed.emit(event.itemData?.id);
    this.selectedItems = event.itemData?.id;
  }

  public unselectAll(): void {
    this.dxTreeView.instance.unselectAll();
  }

  public changeSearch(event: Event): void {
    this.searchValue = (event.target as HTMLInputElement).value;
    this._cdr.detectChanges();
  }

  private _markSelected(
    items: TreeViewItems[],
    selectedIds: TreeViewValue
  ): void {
    if (typeof selectedIds === 'string' || typeof selectedIds === 'number')
      return;

    for (const item of items) {
      item.selected = !!selectedIds?.includes(item.id);

      if (item.items) {
        this._markSelected(item.items, selectedIds);
      }
    }
  }
}
