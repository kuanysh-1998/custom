import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  Type,
  ViewEncapsulation,
} from '@angular/core';

import { UntilDestroy } from '@ngneat/until-destroy';
import { DxPopupModule } from 'devextreme-angular';
import { AnimationConfig } from 'devextreme/animation/fx';
import { Icons } from '../../assets/svg.types';
import { ButtonComponent } from '../button/button.component';
import { ButtonConfig } from '../drawer/drawer.types';
import { SvgComponent } from '../svg/svg.component';
import { DialogRef } from './dialog-ref.service';

@UntilDestroy()
@Component({
  selector: 'wk-dialog',
  standalone: true,
  imports: [CommonModule, DxPopupModule, ButtonComponent, SvgComponent],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent {
  @Input() public size: 'medium' | 'large' = 'medium';
  @Input() public header = '';

  @Input() public text?: string;

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

  @Input() public componentType: Type<unknown> | null = null;

  @Output() public closed = new EventEmitter<void>();
  @Output() public submitted = new EventEmitter<any>();
  @Output() public canceled = new EventEmitter<void>();
  @Output() public additionalAction = new EventEmitter<void>();

  @Output() public confirmClose = new EventEmitter<boolean>();
  public isVisible = false;
  public readonly closeIcon = Icons.Cross;

  private _submitButton?: ButtonConfig;
  private _cancelButton?: ButtonConfig;
  private _additionalActionButton?: ButtonConfig;

  public get submitButtonConfig(): ButtonConfig | undefined {
    return this._submitButton;
  }

  public get additionalActionButtonConfig(): ButtonConfig | undefined {
    return this._additionalActionButton;
  }

  public get cancelButtonConfig(): ButtonConfig | undefined {
    return this._cancelButton;
  }

  public get getDialogWidth(): string {
    return this.size === 'large' ? '900px' : '600px';
  }

  public get animationConfigs(): Record<'show' | 'hide', AnimationConfig> {
    return {
      show: {
        type: 'pop',
        duration: 200,
        from: {
          scale: 0.8,
        },
        to: {
          scale: 1,
        },
      },
      hide: {
        type: 'pop',
        duration: 100,
        from: {
          scale: 1,
          opacity: 1,
        },
        to: {
          scale: 0.8,
          opacity: 0,
        },
      },
    };
  }

  constructor(
    private readonly _dialogRef: DialogRef,
    private readonly _cdr: ChangeDetectorRef
  ) {}

  public open(): void {
    this.isVisible = true;
    this._cdr.detectChanges();
  }

  public close(): void {
    this.isVisible = false;
    this.confirmClose.emit(false);
    this._cdr.detectChanges();
  }

  public submit(): void {
    this.confirmClose.emit(true);
    if (this._dialogRef.instance) {
      this._dialogRef.submit();
      return;
    }
    this.submitted.emit();
  }

  public cancel(): void {
    this.canceled.emit();
    this.confirmClose.emit(false);
  }

  public action(): void {
    this.additionalAction.emit();
  }
}
