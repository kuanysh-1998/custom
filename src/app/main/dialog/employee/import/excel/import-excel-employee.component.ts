import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AuthorizeService } from 'src/app/auth/services/authorize.service';
import { DepartmentModel } from 'src/app/models/department.model';
import { DepartmentService } from 'src/app/services/department.service';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { WpSnackBar } from 'src/app/shared/services/wp-snackbar.service';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'wp-import-excel-employee',
  templateUrl: './import-excel-employee.component.html',
  styleUrls: ['./import-excel-employee.component.scss'],
})
export class ImportExcelEmployeeComponent implements OnInit {
  @ViewChild('fileInput') fileInput: ElementRef;
  departments: DepartmentModel[];
  selectedFile: File | null = null;
  selectedFileName: string | null = null;
  selectedFileSize: string | null = null;
  hasUploadError: boolean = false;
  isUploading: boolean = false;

  constructor(
    private authorizeService: AuthorizeService,
    private departmentService: DepartmentService,
    private snackBar: WpSnackBar,
    private dialogService: DialogService,
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.departmentService
      .getAllDepartment(this.authorizeService.currentOrganizationId)
      .pipe(untilDestroyed(this))
      .subscribe((departments) => {
        this.departments = departments;
      });
  }

  onFileChange(event) {
    const file = event.target.files[0];
    if (file) {
      const validExtensions = ['.xls', '.xlsx'];
      const fileExtension = file.name
        .slice(file.name.lastIndexOf('.'))
        .toLowerCase();

      this.hasUploadError = !validExtensions.includes(fileExtension);

      if (this.hasUploadError) {
        this.snackBar.open('Загрузите файл в формате xls/xlsx', 5000, 'error');
        this.resetSelectedFile(false);
      } else {
        this.selectedFile = file;
        this.selectedFileName = file.name;
        this.selectedFileSize = this.formatFileSize(file.size);
        this.hasUploadError = false;
      }
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
    if (bytes < 1024) return bytes + ' Bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    return (bytes / 1073741824).toFixed(1) + ' GB';
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
    if (this.isUploading || !this.selectedFile) {
      if (!this.selectedFile) {
        this.snackBar.open('Пожалуйста, выберите файл', 5000, 'error');
        this.hasUploadError = true;
      }
      return;
    }

    this.isUploading = true;
    this.employeeService
      .uploadExcelFile(this.selectedFile)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.hasUploadError = true;
          this.isUploading = false;
          this.cdr.markForCheck();

          this.snackBar.open(err.error, 5000, 'error');
          return of(err);
        }),
        untilDestroyed(this)
      )
      .subscribe((res) => {
        this.isUploading = false;
        if (!(res instanceof HttpErrorResponse)) {
          this.dialogService.close(ImportExcelEmployeeComponent, {
            saved: true,
          });
          this.snackBar.open('Сотрудники добавлены успешно', 4000, 'success');
        }
      });
  }

  exportEmployeeTemplate() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Сотрудники');

    const headers = [
      'Отдел',
      'Фамилия',
      'Имя',
      'Отчество',
      'ИИН',
      'Email',
      'Дата рождения',
    ];

    headers.forEach((header, index) => {
      worksheet.getColumn(index + 1).width = 20;
    });

    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true };

    this.departments.forEach((dept) => {
      worksheet.addRow([dept.name, '', '', '', '', '', '']);
    });

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, 'Шаблон импорта сотрудников.xlsx');
    });
  }

  closeDialog() {
    this.dialogService.close(ImportExcelEmployeeComponent);
  }
}
