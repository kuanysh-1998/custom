import { Icons } from '../../assets/svg.types';

export type ListItem = {
  text: string;
  visible?: boolean;
  action?: () => void;
  icon?: Icons;
  iconRight?: Icons;
  active?: boolean;
  withGap?: boolean;
  link?: string;
};

export type MenuAlignment =
  | 'left bottom'
  | 'center bottom'
  | 'right bottom'
  | 'left'
  | 'right';
