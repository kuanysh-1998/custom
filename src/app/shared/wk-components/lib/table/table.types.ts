import { TemplateRef } from '@angular/core';
import { Icons } from '../../assets/svg.types';
import { ListItem } from '../menu/menu.types';

export type TableColumn<T = any> = {
  /**
   * Заголовок столбца, отображаемый в шапке таблицы.
   */
  caption: string;

  /**
   * Имя поля данных, соответствующего этому столбцу.
   */
  dataField: string;

  /**
   * Функция для расчета значения ячейки, может использоваться для кастомного отображения данных.
   */
  calculateCellValue?: (data: T) => any;

  /**
   * Функция для расчета значения сортировки, может использоваться для кастомной сортировки данных.
   */
  calculateSortValue?: (data: T) => any;

  /**
   * Флаг, указывающий, используется ли пользовательский шаблон для ячеек этого столбца.
   */
  isCustom?: boolean;

  /**
   * Если true, в пустых ячейках будет отображаться тире (-).
   */
  showDashIfEmpty?: boolean;

  /**
   * Ширина столбца. Может быть задана в пикселях или процентах.
   */
  width?: string;

  /**
   * Минимальная ширина столбца. Может быть задана в пикселях или процентах.
   */
  minWidth?: number;

  /**
   * Флаг, указывающий, разрешена ли сортировка по этому столбцу.
   */
  allowSorting?: boolean;

  /**
   * Функция для кастомизации текста ячейки, может использоваться для форматирования отображаемых данных.
   */
  customizeText?: (cellInfo: { value: T[keyof T] }) => any;

  /**
   * Выравнивание текста в ячейке: 'left', 'center', или 'right'.
   */
  alignment?: 'left' | 'center' | 'right';

  /**
   * Вертикальное выравнивание содержимого ячейки: 'top', 'middle', или 'bottom'.
   */
  verticalAlign?: 'top' | 'middle' | 'bottom';

  /**
   * Точность отображения числовых данных (количество десятичных знаков).
   */
  numericPrecision?: number;
};

export type CustomTemplates = {
  [dataField: string]: TemplateRef<any>;
};

export type MenuTableItem = Omit<ListItem, 'visible' | 'action'> & {
  action?: (row?: any) => void;
  visible?: boolean | ((row?: unknown) => boolean);
};

export type CellFormat = {
  type?: 'fixedPoint' | 'decimal';
  precision?: number;
};

export type TableAction = {
  icon: Icons;
  label: string;
  action: (rows: any[]) => void;
};

export type Scrolling = {
  columnRenderingMode?: 'standard' | 'virtual';
  mode?: 'infinite' | 'standard' | 'virtual';
  preloadEnabled?: boolean;
  renderAsync?: boolean | undefined;
  rowRenderingMode?: 'standard' | 'virtual';
  scrollByContent?: boolean;
  scrollByThumb?: boolean;
  showScrollbar?: 'always' | 'never' | 'onHover' | 'onScroll';
  useNative?: boolean;
};

export type RefreshActions =
  | 'default'
  | 'resetAll'
  | 'resetCheckboxes'
  | 'resetPage';
