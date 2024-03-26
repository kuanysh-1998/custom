import { PositionConfig } from 'devextreme/animation/position';
import { MenuAlignment } from './menu.types';

export function getPositionMenu(position: MenuAlignment): PositionConfig {
  if (position === 'center bottom') {
    return {
      my: 'top',
      at: 'bottom',
      offset: { y: -5, x: 0 },
    };
  }

  if (position === 'left bottom') {
    return {
      my: `left top`,
      at: `left bottom`,
      offset: { y: -5, x: 0 },
    };
  }

  if (position === 'right bottom') {
    return {
      my: `right top`,
      at: `right bottom`,
      offset: { y: -5, x: 0 },
    };
  }

  if (position === 'right') {
    return {
      my: `left top`,
      at: `right top`,
      offset: { y: 0, x: -5 },
    };
  }

  return {
    my: `right top`,
    at: `left top`,
    offset: { y: 0, x: 5 },
  };
}
