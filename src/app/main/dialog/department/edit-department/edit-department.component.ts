import {
  Component,
  OnChanges,
  OnInit,
  SimpleChanges,
  ChangeDetectionStrategy,
  Inject,
  HostListener,
} from '@angular/core';
import { DepartmentModel } from '../../../../models/department.model';
import { DepartmentService } from '../../../../services/department.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import { DIALOG_DATA } from 'src/app/shared/tokens/dialog-data.token';

@Component({
  selector: 'edit-department',
  templateUrl: './edit-department.component.html',
  styleUrls: ['./edit-department.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditDepartmentComponent implements OnInit, OnChanges {
  department: DepartmentModel;
  form: FormGroup;
  activeButton: 'cancel' | 'save' = 'save';

  constructor(
    private service: DepartmentService,
    private fb: FormBuilder,
    public dialogService: DialogService,
    @Inject(DIALOG_DATA) public departmentData: DepartmentModel
  ) {
    this.form = this.fb.group({
      id: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.maxLength(100)]],
    });
  }

  ngOnInit(): void {
    this.department = this.departmentData;
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.department && changes.department.currentValue) {
      this.initForm();
    }
  }

  initForm() {
    if (this.department) {
      this.form.patchValue({
        id: this.department.id,
        name: this.department.name,
      });
    }
  }

  updateDepartment(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const trimmedName = this.form.value.name.trim();
    this.form.patchValue({ name: trimmedName });

    const body: DepartmentModel = this.form.getRawValue();
    this.service.updateDepartment(body).subscribe(() => {
      this.dialogService.close(EditDepartmentComponent, { saved: true });
      this.form.reset();
    });
  }

  preventLeadingSpace(event: any): void {
    const inputElement = event.target as HTMLInputElement;
    inputElement.value = inputElement.value.replace(/^\s+/, '');
  }

  closeModal(): void {
    this.dialogService.close(EditDepartmentComponent);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
        this.activeButton === 'save'
          ? this.updateDepartment()
          : this.closeModal();
        break;
      case 'ArrowLeft':
        this.activeButton = 'cancel';
        break;
      case 'ArrowRight':
        this.activeButton = 'save';
        break;
      default:
        break;
    }
  }
}
