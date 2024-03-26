import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DepartmentService } from '../../../../services/department.service';
import { DepartmentModel } from '../../../../models/department.model';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import { AuthorizeService } from 'src/app/auth/services/authorize.service';

@Component({
  selector: 'add-department',
  templateUrl: './add-department.component.html',
  styleUrls: ['./add-department.component.scss'],
})
export class AddDepartmentComponent implements OnInit {
  currentOrganizationId: string;
  form: FormGroup;
  activeButton: 'cancel' | 'save' = 'save';

  constructor(
    private service: DepartmentService,
    private fb: FormBuilder,
    public dialogService: DialogService,
    private auth: AuthorizeService
  ) {
    this.currentOrganizationId = this.auth.currentOrganizationId;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      organizationId: [this.currentOrganizationId, [Validators.required]],
    });
  }

  createDepartment(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const trimmedName = this.form.value.name.trim();
    this.form.patchValue({ name: trimmedName });

    const body: DepartmentModel = this.form.getRawValue();
    this.service.addDepartment(body).subscribe(() => {
      this.dialogService.close(AddDepartmentComponent, { saved: true });
      this.form.reset();
    });
  }

  preventLeadingSpace(event: any): void {
    const inputElement = event.target as HTMLInputElement;
    inputElement.value = inputElement.value.replace(/^\s+/, '');
  }

  resetForm(): void {
    this.form.reset({
      name: '',
      organizationId: this.currentOrganizationId,
    });
  }

  closeModal(): void {
    this.dialogService.close(AddDepartmentComponent);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
        this.activeButton === 'save'
          ? this.createDepartment()
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
