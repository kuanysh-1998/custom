import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  Type,
  ViewEncapsulation,
} from '@angular/core';

import { DxDrawerModule } from 'devextreme-angular';
import { Icons } from '../../assets/svg.types';
import { ButtonComponent } from '../button/button.component';
import { DividerComponent } from '../divider/divider.component';
import { DrawerRef } from './drawer-ref.service';
import { ButtonConfig } from './drawer.types';

@Component({
  selector: 'wk-drawer',
  standalone: true,
  imports: [CommonModule, DxDrawerModule, DividerComponent, ButtonComponent],
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawerComponent {
  @Input() public componentType: Type<unknown> | null = null;
  @Input() public header = '';
  @Input() public subheader = '';

  @Input()
  public set additionalActionButton(value: ButtonConfig | string | undefined) {
    if (!value) return;
    if (typeof value === 'string') {
      this._additionalActionButton = {
        label: value,
        variant: 'secondary',
        stylingMode: 'outlined',
      };
    } else {
      this._additionalActionButton = {
        variant: 'secondary',
        stylingMode: 'outlined',
        ...value,
      };
    }
  }

  @Input()
  public set submitButton(value: ButtonConfig | string | undefined) {
    if (!value) return;
    if (typeof value === 'string') {
      this._submitButton = {
        label: value,
        variant: 'default',
        stylingMode: 'contained',
      };
    } else {
      this._submitButton = {
        variant: 'default',
        stylingMode: 'contained',
        ...value,
      };
    }
  }

  @Input()
  public set cancelButton(value: ButtonConfig | string | undefined) {
    if (!value) return;
    if (typeof value === 'string') {
      this._cancelButton = {
        label: value,
        variant: 'secondary',
        stylingMode: 'outlined',
      };
    } else {
      this._cancelButton = {
        variant: 'secondary',
        stylingMode: 'outlined',
        ...value,
      };
    }
  }

  @Output() public closed = new EventEmitter<void>();
  @Output() public submitted = new EventEmitter<void | unknown>();
  @Output() public canceled = new EventEmitter<void>();
  @Output() public additionalAction = new EventEmitter<void>();

  public readonly iconsCross: Icons = Icons.Cross;

  public isDrawerOpen = false;
  public filters?: unknown;

  private _additionalActionButton?: ButtonConfig;
  private _submitButton?: ButtonConfig;
  private _cancelButton?: ButtonConfig;

  public get additionalActionButtonConfig(): ButtonConfig | undefined {
    return this._additionalActionButton;
  }

  public get submitButtonConfig(): ButtonConfig | undefined {
    return this._submitButton;
  }

  public get cancelButtonConfig(): ButtonConfig | undefined {
    return this._cancelButton;
  }

  constructor(
    private readonly _cdr: ChangeDetectorRef,
    private readonly _drawerRef: DrawerRef
  ) {}

  @HostBinding('class.open')
  public get isOpen(): boolean {
    return this.isDrawerOpen;
  }

  public open(): void {
    this.isDrawerOpen = true;
    this._cdr.detectChanges();
  }

  public close(): void {
    this.isDrawerOpen = false;
    this._cdr.detectChanges();
    this.closed.emit();
  }

  public cancel(): void {
    this.canceled.emit();
  }

  public action(): void {
    this.additionalAction.emit();
  }

  public submit(): void {
    if (this._drawerRef?.instance) {
      this._drawerRef.submit();
      return;
    }
    this.submitted.emit();
  }
}
