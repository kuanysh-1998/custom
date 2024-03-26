import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';

import { Icons } from '../../assets/svg.types';
import { SvgComponent } from '../svg/svg.component';

@Component({
  selector: 'wk-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  standalone: true,
  imports: [CommonModule, SvgComponent],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  @Input() public type: 'success' | 'info' | 'error' | 'warning' = 'success';
  @Input() public header = '';
  @Input() public message = '';

  @Output() public closed: EventEmitter<void> = new EventEmitter();

  public readonly iconClose = Icons.Cross;
  public icons: Record<typeof this.type, Icons> = {
    success: Icons.Success,
    info: Icons.InfoNotification,
    error: Icons.Error,
    warning: Icons.Warning,
  };
}
