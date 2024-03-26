import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import DataSource from 'devextreme/data/data_source';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { AuthorizeService } from 'src/app/auth/services/authorize.service';
import { DepartmentService } from 'src/app/services/department.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { HttpCustom } from 'src/app/shared/http';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import { WpSnackBar } from 'src/app/shared/services/wp-snackbar.service';

@UntilDestroy()
@Component({
  selector: 'wp-import-zip-employee',
  templateUrl: './import-zip-employee.component.html',
  styleUrls: ['./import-zip-employee.component.scss'],
})
export class ImportZipEmployeeComponent implements OnInit {
  @ViewChild('fileInput') fileInput: ElementRef;
  departmentsDataSource: DataSource;
  selectedFile: File | null = null;
  selectedFileName: string | null = null;
  selectedFileSize: string | null = null;
  hasUploadError: boolean = false;
  isUploading: boolean = false;

  importForm = this.fb.group({
    departmentId: ['', [Validators.required]],
  });

  constructor(
    private authorizeService: AuthorizeService,
    private departmentService: DepartmentService,
    private snackBar: WpSnackBar,
    private dialogService: DialogService,
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef,
    private httpCustom: HttpCustom,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initDepartmentsDataSource();
  }

  initDepartmentsDataSource() {
    this.departmentsDataSource = new DataSource({
      store: this.httpCustom.createStore(
        'id',
        this.departmentService.getAllDepartmentUrl(
          this.authorizeService.currentOrganizationId
        )
      ),
      sort: [{ selector: 'name', desc: false }],
    });
  }

  onFileChange(event) {
    const file = event.target.files[0];
    if (file) {
      const maxFileSize = 20 * 1024 * 1024;
      const validExtensions = ['.zip', '.rar', '.7z', '.tar'];
      const fileExtension = file.name
        .slice(file.name.lastIndexOf('.'))
        .toLowerCase();

      if (!validExtensions.includes(fileExtension)) {
        this.snackBar.open('Архив не соответствует формату zip', 5000, 'error');
        this.resetSelectedFile(false);
        return;
      }

      if (file.size > maxFileSize) {
        this.snackBar.open('Размер архива превышает 20 Мб', 5000, 'error');
        this.resetSelectedFile(false);
        return;
      }

      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.selectedFileSize = this.formatFileSize(file.size);
      this.hasUploadError = false;
    }
  }

  resetSelectedFile(resetError: boolean = true) {
    this.selectedFile = null;
    this.selectedFileName = null;
    this.selectedFileSize = null;

    if (resetError) {
      this.hasUploadError = false;
    }

    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return bytes + ' Bytes';
    } else if (bytes < 1048576) {
      return (bytes / 1024).toFixed(1) + ' KB';
    } else {
      return (bytes / 1048576).toFixed(1) + ' MB';
    }
  }

  formatFileName(fileName: string): string {
    const maxDisplayLength = 47;
    if (fileName.length > maxDisplayLength) {
      const fileExtension = fileName.slice(-5);
      const shortened = fileName.slice(0, maxDisplayLength);
      return `${shortened}...${fileExtension}`;
    }
    return fileName;
  }

  importFile() {
    if (this.isUploading || !this.selectedFile || !this.importForm.valid) {
      if (!this.selectedFile) {
        this.snackBar.open('Пожалуйста, выберите файл', 5000, 'error');
        this.hasUploadError = true;
        this.importForm.markAllAsTouched();
      }
      return;
    }

    const departmentId = this.importForm.get('departmentId').value;

    this.isUploading = true;

    this.employeeService
      .uploadZipFile(this.selectedFile, departmentId)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.hasUploadError = true;
          this.snackBar.open(err.error, 5000, 'error');
          return of(err);
        }),
        finalize(() => {
          this.isUploading = false;
          this.cdr.markForCheck();
        }),
        untilDestroyed(this)
      )
      .subscribe((res) => {
        if (!(res instanceof HttpErrorResponse)) {
          this.dialogService.close(ImportZipEmployeeComponent, { saved: true });
          this.snackBar.open(
            'Фотографии загружены успешно. Запущено распознавание лица. Внимание! Фотографии, на которых не будет обнаружено лицо, будут удалены',
            4000,
            'success'
          );
        }
      });
  }

  closeDialog() {
    this.dialogService.close(ImportZipEmployeeComponent);
  }
}
