import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DxDataGridComponent, DxDataGridModule } from 'devextreme-angular';
import CustomStore from 'devextreme/data/custom_store';
import { SelectionChangedEvent } from 'devextreme/ui/data_grid';
import { Icons } from '../../assets/svg.types';
import { ButtonPopoverComponent } from '../button-popover/button-popover.component';
import { ButtonComponent } from '../button/button.component';
import { MenuComponent } from '../menu/menu.component';
import { ListItem } from '../menu/menu.types';
import { PaginationComponent } from '../pagination/pagination.component';
import { ScrollComponent } from '../scroll/scroll.component';
import { SvgComponent } from '../svg/svg.component';
import { TextFieldComponent } from '../text-field/text-field.component';
import { TooltipComponent } from '../tooltip/tooltip.component';
import {
  CellFormat,
  CustomTemplates,
  MenuTableItem,
  RefreshActions,
  TableAction,
  TableColumn,
} from './table.types';

@Component({
  selector: 'wk-table',
  standalone: true,
  imports: [
    CommonModule,
    DxDataGridModule,
    ButtonComponent,
    PaginationComponent,
    SvgComponent,
    MenuComponent,
    TextFieldComponent,
    ReactiveFormsModule,
    FormsModule,
    TooltipComponent,
    ButtonPopoverComponent,
    ScrollComponent,
  ],
  templateUrl: './table.component.html',
  styleUrls: ['./styles/table.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent {
  /**
   * Шаблон для настройки пользовательского тулбара. Принимает Angular TemplateRef,
   * который можно использовать для добавления настраиваемых элементов и кнопок в тулбар.
   */
  @Input() public customToolbarTemplate: TemplateRef<unknown>;

  /**
   * Пользовательские шаблоны для отдельных ячеек таблицы.
   * Ключи в этом объекте должны соответствовать полям 'dataField' из конфигурации столбцов.
   * Так же в конфигурации столбца должен быть включен флаг 'isCustom'.
   * Позволяет настраивать отображение содержимого в ячейках, используя Angular TemplateRef.
   */
  @Input() public customTemplates: CustomTemplates = {};

  /**
   * Включает или отключает пагинацию в таблице.
   * При включении добавляет элементы управления пагинацией в нижней части таблицы.
   */
  @Input() public enablePagination = false;

  /**
   * Включает или отключает отображение общего количества элементов в пацигании.
   */
  @Input() public enableTotalCount = true;

  /**
   * Включает или отключает отображение кнопки рефреша.
   */
  @Input() public enableReloadButton = true;

  /**
   * Тип действия обновления:
   * 'default' - базовое обновление,
   * 'resetAll' - сброс всего,
   * 'resetCheckboxes' - сброс выбранных чекбоксов,
   * 'resetPage' - сброс страницы.
   */
  @Input() public refreshAction: RefreshActions = 'default';

  /**
   * Включает или отключает отображение количества выбранных строк.
   */
  @Input() public enableRowsCounter = true;

  /**
   * Включает или отключает отображение кнопки фильтров.
   */
  @Input() public enableFilters = true;

  /**
   * Включает или отключает активное состояние фильтров.
   */
  @Input() public activeFilters = false;

  /**
   * Включает или отключает отображение поиска.
   */
  @Input() public enableSearch = true;

  /**
   * Плейсхолдер для инпута поиска.
   */
  @Input() public searchPlaceholder = 'Поиск по наименованию';

  /**
   * Включает или отключает возможность выбора строк в таблице.
   * При включении позволяет пользователю выбирать одну или несколько строк.
   */
  @Input() public enableSelection = false;

  /**
   * Включает или отключает тулбар в таблице.
   */
  @Input() public enableToolbar = false;

  /**
   * Включает или отключает перенос слов в ячейках таблицы.
   */
  @Input() public enableWordWrap = false;

  /**
   * Включает или отключает индикатор загрузки (спиннер).
   */
  @Input() public enableSpinner = false;

  /**
   * Включает или отключает контекстное меню в таблице.
   */
  @Input() public enableContextMenu = false;

  /**
   * Определяет размер страницы для пагинации.
   */
  @Input() public pageSize = 10;
  /**
   * Данные, отображаемые в таблице.
   * Может быть массивом объектов или CustomStore для динамической загрузки данных.
   */
  @Input() public data: unknown[] | CustomStore = [];

  /**
   * `predefinedSelectedRowKeys`: Массив ключей или объектов, определяющих строки,
   * которые должны быть выделены при инициализации компонента таблицы.
   * Тип ключа (идентификатор строки или объект строки) зависит от значения свойства `key`.
   */
  @Input()
  public set predefinedSelectedRowKeys(value: unknown[]) {
    this._predefinedSelectedRowKeys = value;
  }

  public get predefinedSelectedRowKeys(): unknown[] {
    return this._predefinedSelectedRowKeys;
  }

  /**
   * `key`: Имя поля в данных строки, используемое в качестве уникального идентификатора для выделения.
   * Если не определено, в качестве ключа для выделения используется весь объект строки.
   * Это свойство влияет на выбор ключей в `predefinedSelectedRowKeys`.
   */
  @Input() public key: string;

  /**
   * Элементы меню для контекстного меню в таблице.
   * Представляет собой массив объектов MenuTableItem, каждый из которых определяет пункт меню.
   */
  @Input() public menuItems: MenuTableItem[] = [];

  /**
   * Элементы экшн баттонов для тулбара в таблице.
   * Представляет собой массив объектов TableAction, каждый из которых определяет экшн.
   */
  @Input() public actions: TableAction[] = [];

  /**
   * Определяет, будет ли таблица реагировать на клики по строкам.
   * При включении строки становятся "кликабельными" для дополнительных действий.
   */
  @Input() public clickable = false;

  /**
   * Добавляет строку с итоговой суммой и отобображает ее.
   */
  @Input() public totalSummary?: number;

  /**
   * Добавляет строку с количеством позиции и отобображает ее.
   */
  @Input() public totalPosition?: number;

  /**
   * Добавляет инпут и кнопку для перехода на определенную страницу
   */
  @Input() public pageNavigation = false;

  /**
   * Конфигурация столбцов таблицы.
   * Принимает массив объектов Column, определяющих настройки каждого столбца.
   */
  @Input()
  public set columns(value) {
    this._columns = this._processColumns(value);
  }

  public get columns(): TableColumn[] {
    return this._columns || [];
  }

  /**
   * Событие, возникающее при изменении выбора строк в таблице.
   * Передает выбранные строки как параметр события.
   */
  @Output() public selectionChanged = new EventEmitter<unknown>();

  /**
   * Событие, возникающее при двойном клике по строке таблицы.
   * Передает данные дважды кликнутой строки как параметр события.
   */
  @Output() public rowDblClicked = new EventEmitter<unknown>();

  /**
   * Событие, возникающее при клике по кнопке фильтров.
   */
  @Output() public clickedFilters = new EventEmitter<void>();

  /**
   * Событие, возникающее при изменении строки поиска.
   */
  @Output() public changedSearch = new EventEmitter<string>();

  public readonly icons = Icons;
  public items: ListItem[] = [];

  public totalPage = 1;
  public currentPage = 1;
  public totalCount = 0;
  public selectionCount = 0;

  @ViewChild('dataGrid') private readonly _dataGrid: DxDataGridComponent;

  private _columns: TableColumn[] = [];
  private _predefinedSelectedRowKeys: unknown[];

  public get isClickable(): boolean {
    return this.enableSelection || this.clickable;
  }

  public get clickableMode(): 'single' | 'multiple' {
    return this.clickable && !this.enableSelection ? 'single' : 'multiple';
  }

  public get refreshTooltip(): string {
    return this.refreshAction === 'resetAll' ||
      this.refreshAction === 'resetCheckboxes'
      ? 'Обновить и сбросить'
      : 'Обновить';
  }

  public refreshData(): void {
    switch (this.refreshAction) {
      case 'resetAll':
        this._dataGrid.instance.clearSelection();
        this._dataGrid.instance.pageIndex(0);
        break;

      case 'resetCheckboxes':
        this._dataGrid.instance.clearSelection();
        break;

      case 'resetPage':
        this._dataGrid.instance.pageIndex(0);
        break;

      default:
        break;
    }

    this._dataGrid.instance.refresh();
  }

  public setupOptions(): void {
    this.currentPage = this._dataGrid.instance.pageIndex() + 1 || 1;
    this.totalPage = this._dataGrid.instance.pageCount();
    this.totalCount = this._dataGrid.instance.totalCount();
  }

  public changeSelection(event: SelectionChangedEvent): void {
    this.selectionChanged.emit(event.selectedRowsData);
    this.selectionCount = event.selectedRowsData.length;
  }

  public onPageChange(newPage: number): void {
    this._dataGrid?.instance.pageIndex(newPage - 1);
  }

  public getCellNumberFormat(column: TableColumn): CellFormat {
    return {
      type: column.numericPrecision ? 'fixedPoint' : 'decimal',
      precision: column.numericPrecision,
    };
  }

  public getCurrencyFormat(value: string | null): string {
    return value?.replace(/,/g, ' ') ?? '';
  }

  public isCustomTemplate(column: TableColumn): boolean {
    return !!column.isCustom && !!this.customTemplates[column.dataField];
  }

  public openMenu(
    row: unknown,
    menu: MenuComponent,
    target: HTMLElement
  ): void {
    this.items = this.menuItems.map((item) => ({
      ...item,
      visible:
        typeof item.visible === 'function' ? item.visible?.(row) : item.visible,
      action: () => item.action?.(row),
    }));

    menu.for = target;
    menu.toggle();
  }

  public search(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.changedSearch.emit(input.value ?? '');
  }

  public getMoreActions(actions: TableAction[]): ListItem[] {
    const COUNT_FIRST_ELEMENTS = 3;
    return actions.slice(COUNT_FIRST_ELEMENTS).map((i) => ({
      icon: i.icon,
      action: () => i.action(this._dataGrid.instance.getSelectedRowsData()),
      text: i.label,
    }));
  }

  public refresh(): void {
    this._dataGrid.instance.refresh();
  }

  private _processColumns(columns: TableColumn[]): TableColumn[] {
    return columns.map((column) => ({
      ...column,
      calculateCellValue: this._calculateCellValue.bind(this, column),
      customizeText: column.customizeText ?? this._customizeTextFn.bind(this),
      alignment: column.alignment ?? 'left',
      verticalAlign: column.verticalAlign ?? 'middle',
    }));
  }

  private _customizeTextFn(cellInfo: any): string {
    if (typeof cellInfo.value === 'number') {
      return cellInfo.valueText.replace(/,/g, ' ');
    }

    return cellInfo.valueText;
  }

  private _calculateCellValue(column: TableColumn, data: any): string {
    let value = column.dataField ? data[column.dataField] : null;

    if (column.calculateCellValue) {
      value = column.calculateCellValue(data);
    }

    if (
      column.showDashIfEmpty &&
      (value === null || value === undefined || value === '')
    ) {
      return '-';
    }

    return value;
  }
}
