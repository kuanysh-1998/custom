import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Optional,
  Output,
  Self,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NgControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { Icons } from '../../assets/svg.types';
import { ButtonComponent } from '../button/button.component';
import { DialogComponent } from '../dialog/dialog.component';
import { FormErrorComponent } from '../form-error/form-error.component';
import { LabelComponent } from '../label/label.component';
import { SvgComponent } from '../svg/svg.component';
import { TextFieldComponent } from '../text-field/text-field.component';

@Component({
  selector: 'wk-file-upload',
  standalone: true,
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    DialogComponent,
    ButtonComponent,
    SvgComponent,
    TextFieldComponent,
    ReactiveFormsModule,
    LabelComponent,
    FormErrorComponent,
  ],
})
export class FileUploadComponent
  implements ControlValueAccessor, OnInit, DoCheck
{
  @Input() public label = 'Загрузите файл с компьютера';
  @Input() public labelLocation: 'top' | 'left' = 'top';
  @Input() public required?: boolean;
  @Input() public disabled?: boolean;
  @Input() public token?: string;
  @Input() public error: boolean;
  @Input() public errorMessage: string;
  @Input() public helperText?: string;
  @Input() public labelInfo = '';
  @Output() public changed = new EventEmitter<File | null>();

  public readonly folderIcon = Icons.FolderShape;
  public readonly documentIcon = Icons.Document;
  public readonly crossIcon = Icons.Cross;

  public fileExtension = '';
  public fileControl = new FormControl<File | null>(null);

  public get isDisabled(): boolean {
    return this._isDisabled || !!this.disabled;
  }

  public get control(): FormControl | undefined {
    return <FormControl<unknown>>this._ngControl?.control;
  }

  private _isDisabled = false;
  @ViewChild('fileInputElement')
  private readonly _fileInputElement: ElementRef<HTMLInputElement>;

  public get isError(): boolean {
    return (this.control?.invalid && this.control?.touched) || this.error;
  }

  public get isRequired(): boolean {
    const hasRequiredValidator = !!(
      this.control?.hasValidator(Validators.required) && this.required !== false
    );
    return this.required || hasRequiredValidator;
  }

  private _onTouched: () => void;
  private _onChange: (value: File | null) => void;

  constructor(
    private readonly _cdr: ChangeDetectorRef,
    @Self() @Optional() private readonly _ngControl?: NgControl
  ) {
    if (this._ngControl) {
      this._ngControl.valueAccessor = this;
    }
  }

  public ngOnInit(): void {
    if (this.control) {
      this.control.valueChanges.subscribe((value) => {
        if (value == null) {
          this.fileControl.reset();
          this.fileExtension = '';
          this.changed.emit(null);
        }
      });
    }
  }

  public ngDoCheck(): void {
    this._cdr.markForCheck();
  }

  public writeValue(value: File | null): void {
    this._onChange?.(value);
  }

  public registerOnChange(fn: (value: File | null) => void): void {
    this._onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this._isDisabled = isDisabled;
    this._cdr.detectChanges();
  }

  public fileUploaded(event: Event): void {
    const fileInput = event.target as HTMLInputElement;

    if (fileInput.files && fileInput.files.length > 0) {
      this.fileExtension =
        fileInput.files[0].name.match(/\.([^.]+)$/)?.[1] ?? '';
      this.fileControl.setValue(fileInput.files[0]);
      this._onTouched?.();
      this._onChange?.(fileInput.files[0]);
      this.changed.emit(fileInput.files[0]);
      this._resetFileInput();
    }
  }

  public resetFile(): void {
    if (this.control) this.control.reset();
    this.fileExtension = '';
    this.fileControl.reset();
    this._onTouched?.();
    this._onChange?.(null);
    this.changed.emit(null);
  }

  public getFilename(value: File | null): string {
    if (!value) return '';
    return value?.name.replace(new RegExp(`\\.${this.fileExtension}$`), '');
  }

  public triggerFileInputClick(): void {
    if (this.isDisabled) return;
    this._fileInputElement.nativeElement.click();
  }

  private _resetFileInput(): void {
    const newFileInput = document.createElement('input');
    newFileInput.type = 'file';
    newFileInput.style.display = 'none';
    newFileInput.addEventListener('change', (event) =>
      this.fileUploaded(event)
    );
    this._cdr.detectChanges();
    const parent = this._fileInputElement.nativeElement.parentElement;
    parent?.replaceChild(newFileInput, this._fileInputElement.nativeElement);
    this._fileInputElement.nativeElement = newFileInput;
    this._cdr.detectChanges();
  }
}
