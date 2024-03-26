import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs/operators';
import { EmployeeDetail, EmployeePhoto } from 'src/app/models/employee.model';
import { EmployeeService } from 'src/app/services/employee.service';
import { PhotosService } from 'src/app/services/photos.service';
import { WpMessageComponent } from 'src/app/shared/components/wp-message/wp-message.component';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import { WpSnackBar } from 'src/app/shared/services/wp-snackbar.service';

@UntilDestroy()
@Component({
  selector: 'app-employee-identification-edit',
  templateUrl: './identification.component.html',
  styleUrls: ['./identification.component.scss'],
})
export class EmployeeIdentificationComponent implements OnChanges {
  @Input() currentEmployee: EmployeeDetail;
  isPopupVisible = false;
  selectedPhotoUrl: string;
  employeePhotos: EmployeePhoto[] = [];
  fileToUpload: File | null = null;
  fileSizeError: boolean = false;
  private readonly MAX_FILE_SIZE = 6 * 1024 * 1024;
  isUploading = false;

  constructor(
    private photosService: PhotosService,
    private router: Router,
    private employeeService: EmployeeService,
    private snackBar: WpSnackBar,
    private dialogService: DialogService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.currentEmployee && changes.currentEmployee.currentValue) {
      this.currentEmployee = changes.currentEmployee.currentValue;
      this.loadPhotos(this.currentEmployee.photos);
    }
  }

  removePhotoByIndex(index: number): void {
    this.dialogService.show('Удаление фотографии', {
      componentType: WpMessageComponent,
      componentData: {
        message: 'Вы действительно хотите удалить фотографию?',
      },
      onClose: (result) => {
        if (result.saved) {
          const photo = this.employeePhotos[index];
          if (photo.isServerLoaded) {
            this.isUploading = true;
            this.employeeService
              .removePhotoEmployee(this.currentEmployee.id, photo.id)
              .pipe(
                finalize(() => (this.isUploading = false)),
                untilDestroyed(this)
              )
              .subscribe(() => {
                this.employeePhotos.splice(index, 1);
              });
          } else {
            this.employeePhotos.splice(index, 1);
          }
        }
      },
    });
  }

  loadPhotos(fileIds: string[]): void {
    if (fileIds.length === 0) {
      return;
    }

    this.employeePhotos = fileIds.map((fileId) => ({
      id: fileId,
      url: null,
      isLoading: true,
      isServerLoaded: true,
    }));

    this.employeePhotos.forEach((photo) => {
      if (photo.isServerLoaded) {
        this.photosService
          .getPhotoUrl(photo.id)
          .pipe(untilDestroyed(this))
          .subscribe((url) => {
            photo.url = url;
            photo.isLoading = false;
          });
      }
    });
  }

  savePhotos() {
    this.isUploading = true;

    const formData = new FormData();
    this.employeePhotos.forEach((photo) => {
      if (!photo.isServerLoaded && photo.file) {
        formData.append('photos', photo.file);
      }
    });

    if (formData.has('photos')) {
      this.employeeService
        .uploadEmployeePhotos(formData, this.currentEmployee.id)
        .pipe(finalize(() => (this.isUploading = false)))
        .subscribe(() => {
          this.snackBar.open('Данные успешно сохранены', 4000, 'success');
          this.updateEmployeePhotos();
          this.employeePhotos.forEach((photo) => {
            if (photo.file) {
              photo.isServerLoaded = true;
            }
          });
          this.navigateToEmployeeList();
        });
    } else {
      this.isUploading = false;
      this.snackBar.open('Данные успешно сохранены', 4000, 'success');
      this.navigateToEmployeeList();
    }
  }

  updateEmployeePhotos() {
    if (this.currentEmployee) {
      this.employeeService
        .getEmployeeById(this.currentEmployee.id)
        .pipe(untilDestroyed(this))
        .subscribe((updatedEmployee) => {
          this.currentEmployee = updatedEmployee;
          this.loadPhotos(this.currentEmployee.photos);
        });
    }
  }

  handleFileInput(e: Event): void {
    const input = e.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.size > this.MAX_FILE_SIZE) {
        this.handleFileSizeError();
        return;
      }

      this.readFile(file);
    }
  }

  private handleFileSizeError(): void {
    this.fileSizeError = true;
    this.fileToUpload = null;
    this.snackBar.open(
      'Размер фотографии не должен превышать 6 Мб',
      5000,
      'error'
    );
  }

  private readFile(file: File): void {
    const validImageTypes = ['image/jpeg', 'image/png'];

    if (!validImageTypes.includes(file.type)) {
      this.fileSizeError = true;
      this.snackBar.open('Выберите файл в формате JPG/JPEG/PNG', 4000, 'error');
      return;
    }

    this.fileSizeError = false;
    this.fileToUpload = file;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event: any) => {
      this.addPhotoToEmployee(event.target.result, file);
    };
  }

  private addPhotoToEmployee(dataUrl: string, file: File): void {
    this.employeePhotos.push({
      id: 'temp-' + this.employeePhotos.length,
      url: dataUrl,
      isLoading: false,
      isServerLoaded: false,
      file: file,
    });
  }

  openPhotoModal(photoUrl: string): void {
    this.selectedPhotoUrl = photoUrl;
    this.isPopupVisible = true;
  }

  handleModalClose() {
    this.isPopupVisible = false;
  }

  navigateToEmployeeList(): void {
    this.router.navigate(['/employee']);
  }
}
