export interface TreeViewItems {
  id: string;
  title: string;
  expanded?: boolean;
  selected?: boolean;
  parentId?: string;
  items?: TreeViewItems[];
}

export type TreeViewValue = null | undefined | string | number | (string | number)[];
