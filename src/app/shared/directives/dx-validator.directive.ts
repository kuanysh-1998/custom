import {
  Directive,
  Optional,
  Self,
  OnInit,
  Host,
  EventEmitter,
} from '@angular/core';
import { AbstractControl, NgControl } from '@angular/forms';
import {
  DxTextBoxComponent,
  DxSelectBoxComponent,
  DxTagBoxComponent,
  DxDateRangeBoxComponent,
  DxDropDownBoxComponent,
  DxRadioGroupComponent,
  DxDateBoxComponent,
  DxTextAreaComponent,
} from 'devextreme-angular';
import { LocalizationService } from '../services/localization.service';
import { ComboDropdownListComponent } from '../components/combo-dropdown-list/combo-dropdown-list.component';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { WpTextBoxComponent } from '../components/wp-text-box/wp-text-box.component';

export interface IValidatableDxComponent {
  isValid?: boolean;
  validationError?: string | null;
  validationErrors?: Array<{ editorSpecific: boolean; message: string }> | null;
  onBlur?: EventEmitter<any>;
}

@UntilDestroy()
@Directive({
  selector: '[appValidateControl]',
})
export class ValidateControlDirective implements OnInit {
  private dxControl: IValidatableDxComponent;

  constructor(
    @Optional() @Self() public ngControl: NgControl,
    @Optional() @Host() private dxTextBox: DxTextBoxComponent,
    @Optional() @Host() private dxSelectBox: DxSelectBoxComponent,
    @Optional() @Host() private dxComboDropDownList: ComboDropdownListComponent,
    @Optional() @Host() private dxRadioGroup: DxRadioGroupComponent,
    @Optional() @Host() private dxDateBox: DxDateBoxComponent,
    @Optional() @Host() private dxDateRangeBox: DxDateRangeBoxComponent,
    @Optional() @Host() private dxDropDownBox: DxDropDownBoxComponent,
    @Optional() @Host() private dxTagBox: DxTagBoxComponent,
    @Optional() @Host() private wpTextBox: WpTextBoxComponent,
    @Optional() @Host() private dxTextArea: DxTextAreaComponent,
    private localization: LocalizationService
  ) {
    this.dxControl =
      this.dxTextBox ||
      this.dxSelectBox ||
      this.dxComboDropDownList ||
      this.dxRadioGroup ||
      this.dxDateBox ||
      this.dxDateRangeBox ||
      this.dxDropDownBox ||
      this.dxTagBox ||
      this.wpTextBox ||
      this.dxTextArea;

    if (!this.ngControl) {
      console.error(
        'ValidateControlDirective must be used with a form control binding like formControlName.'
      );
      return;
    }
  }

  ngOnInit(): void {
    const originalMarkAsTouched =
      this.ngControl.control.markAsTouched.bind(this);
    this.ngControl.control.markAsTouched = (options) => {
      originalMarkAsTouched(options);
      this.applyValidationStatus();
    };

    this.ngControl.statusChanges
      .pipe(untilDestroyed(this))
      .subscribe((status) => {
        if (this.ngControl.control && this.ngControl.control.enabled) {
          this.applyValidationStatus();
        }
      });

    if (this.dxControl && this.dxControl.onBlur) {
      this.dxControl.onBlur.pipe(untilDestroyed(this)).subscribe(() => {
        this.validateControl();
      });
    }
  }

  applyValidationStatus() {
    const control = this.ngControl.control;

    const validationErrors = (this.dxControl.validationErrors || []).filter(
      (x) => x.editorSpecific
    );

    const hasEditorSpecificError = validationErrors.some(
      (x) => x.editorSpecific
    );

    if (!hasEditorSpecificError && control.invalid) {
      validationErrors.push({
        ...this.getValidationError(control),
        editorSpecific: false,
      });
    }

    this.dxControl.isValid = validationErrors.length == 0;
    this.dxControl.validationErrors = validationErrors;
  }

  private validateControl(): void {
    const control = this.ngControl.control;
    control.updateValueAndValidity();
  }

  getValidationError(control: AbstractControl): any {
    if (control.errors) {
      if (control.hasError('required')) {
        return {
          message: this.localization.getSync('Поле обязательно для заполнения'),
        };
      }
      if (control.hasError('pattern')) {
        return {
          message: this.localization.getSync(
            'Поле не должно содержать пробелов'
          ),
        };
      }
      if (control.hasError('dateRequired')) {
        return {
          message: this.localization.getSync('Выберите даты'),
        };
      }

      if (control.hasError('dateRangeRequired')) {
        return {
          message: this.localization.getSync('Выберите даты'),
        };
      }

      if (control.hasError('email')) {
        return {
          message: this.localization.getSync(
            'Пожалуйста, введите действительный адрес электронной почты'
          ),
        };
      }

      if (control.hasError('custom')) {
        return {
          message: this.localization.getSync(control.getError('message')),
        };
      }
    }
    return null;
  }
}
