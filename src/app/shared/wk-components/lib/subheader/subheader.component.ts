import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';

import { Icons } from '../../assets/svg.types';
import { ButtonComponent } from '../button/button.component';
import { DialogComponent } from '../dialog/dialog.component';
import { DividerComponent } from '../divider/divider.component';
import { SvgComponent } from '../svg/svg.component';

@Component({
  selector: 'wk-subheader',
  standalone: true,
  imports: [
    CommonModule,
    DialogComponent,
    ButtonComponent,
    SvgComponent,
    DividerComponent,
  ],
  templateUrl: './subheader.component.html',
  styleUrls: ['./subheader.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubheaderComponent {
  @Input() public showBackButton = true;
  @Input() public title = '';
  @Input() public subtext = '';
  @Input() public actionTemplate: TemplateRef<unknown>;

  @Output() public backButtonClicked = new EventEmitter<void>();

  public readonly iconArrow = Icons.ArrowLeft;
}
