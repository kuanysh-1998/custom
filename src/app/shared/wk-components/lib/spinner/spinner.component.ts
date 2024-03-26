import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';

import { Icons } from '../../assets/svg.types';

@Component({
  selector: 'wk-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerComponent {
  @Input() public size: 'small' | 'default' | 'large' = 'default';
  @Input() public fullScreen = false;

  public readonly icon = Icons.Spinner;
}
