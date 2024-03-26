import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  Inject,
  ChangeDetectorRef,
  HostListener,
} from '@angular/core';
import DataSource from 'devextreme/data/data_source';
import { of } from 'rxjs';
import { delay, finalize, first, switchMap, tap } from 'rxjs/operators';
import { EmployeeDetail } from 'src/app/models/employee.model';
import {
  EventType,
  EventTypesProvider,
  ReportEmployeeModel,
  UpdateMarkData,
} from 'src/app/models/report-employee.model';
import { TimeTableList } from 'src/app/models/suspicious.model';
import { EmployeeService } from 'src/app/services/employee.service';
import { PhotosService } from 'src/app/services/photos.service';
import { ReportEmployeeService } from 'src/app/services/report-employee.service';
import { SuspiciousService } from 'src/app/services/suspicious.service';
import { DisplayValueModel } from 'src/app/shared/models/display-value.model';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import { WpSnackBar } from 'src/app/shared/services/wp-snackbar.service';
import { DIALOG_DATA } from 'src/app/shared/tokens/dialog-data.token';

interface DialogData {
  reportEmployee: DataSource;
  marksPageCount: number;
  currentIndex: number;
}

@Component({
  selector: 'app-view-mark',
  templateUrl: './view-mark.component.html',
  styleUrls: ['./view-mark.component.scss'],
})
export class ViewMarkComponent implements OnInit, AfterViewInit {
  @ViewChild('modalContent') modalContentRef!: ElementRef;
  PhotosBaseUrl = this.photosService.PhotosBaseUrl;
  reportEmployee: DataSource;
  reportOfEmployee: ReportEmployeeModel[];
  marksPageCount: number;
  currentIndex: number;
  currentEmployee: ReportEmployeeModel = null;
  employeePhotos = [];
  eventTypes = this.eventTypesProvider.getEventTypes();
  eventType: DisplayValueModel<EventType> = this.eventTypes[0];
  showContent: boolean = false;
  delayTime = 300;
  timer$ = of(true);
  dataTimeTableList: TimeTableList[];
  isLoading: boolean = false;

  constructor(
    private eventTypesProvider: EventTypesProvider,
    private reportEmployeeService: ReportEmployeeService,
    private employeeService: EmployeeService,
    private photosService: PhotosService,
    @Inject(DIALOG_DATA) public data: DialogData,
    private dialogService: DialogService,
    private cdr: ChangeDetectorRef,
    private suspiciousService: SuspiciousService,
    private snackBar: WpSnackBar
  ) {
    if (data) {
      this.reportEmployee = this.data.reportEmployee;
      this.marksPageCount = this.data.marksPageCount;
      this.currentIndex = this.data.currentIndex;
    }
  }

  ngOnInit(): void {
    this.getCurrentEmployee();
    this.getTimeTableList();
    this.setEvenType();
  }

  ngAfterViewInit(): void {
    this.timer$.pipe(delay(this.delayTime), first()).subscribe(() => {
      const modalContent = this.modalContentRef.nativeElement as HTMLElement;
      modalContent.scrollTo({ top: 0, behavior: 'auto' });
      this.showContent = true;
      this.cdr.detectChanges();
    });
  }

  onMarkUpdate(data: UpdateMarkData) {
    if (!data.timetableSpanId) {
      return;
    }
    this.isLoading = true;
    this.reportEmployeeService
      .updateMark(data.markId, data.timetableSpanId)
      .pipe(
        switchMap(() => this.reportEmployee.reload()),
        tap(() => this.getCurrentEmployee()),
        switchMap(() => this.getPhotosEmployeeById(this.currentEmployee)),
        finalize(() => {
          this.isLoading = false;
          this.showContent = true;
          this.setEvenType();
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () =>
          this.snackBar.open('Данные успешно сохранены', 5000, 'success'),
      });
  }

  getTimeTableList() {
    if (this.currentEmployee?.id) {
      this.suspiciousService
        .getTimeTableList(this.currentEmployee.id)
        .pipe(first())
        .subscribe((res) => {
          this.dataTimeTableList = res.data;
        });
    }
  }

  getPhotosEmployeeById(reportEmployee: ReportEmployeeModel) {
    if (reportEmployee?.employeeId) {
      return this.employeeService
        .getEmployeeById(reportEmployee.employeeId)
        .pipe(
          tap((data: EmployeeDetail) => {
            this.employeePhotos = data.photos;
          })
        );
    } else {
      return of(null);
    }
  }

  next(): void {
    this.showContent = false;

    if (this.currentIndex < this.reportOfEmployee.length - 1) {
      this.currentIndex++;
      this.loadDataWithAnswer();
    } else {
      let nextPage = this.reportEmployee.pageIndex() + 1;

      if (nextPage >= this.marksPageCount) {
        this.dialogService.close(ViewMarkComponent);
      } else {
        if (this.reportEmployeeService.areDataLoadedForPage(nextPage)) {
          this.reportEmployeeService.changeData(nextPage);
          this.currentIndex = 0;
          this.loadDataWithAnswer();
        } else {
          this.reportEmployeeService.changeData(nextPage);
          this.reportEmployeeService.dataLoaded$.pipe(first()).subscribe(() => {
            this.currentIndex = 0;
            this.loadDataWithAnswer();
          });
        }
      }
    }
  }

  prev(): void {
    this.showContent = false;

    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.loadDataWithAnswer();
    } else {
      let prevPage = this.reportEmployee.pageIndex() - 1;

      if (prevPage >= 0) {
        if (!this.reportEmployeeService.areDataLoadedForPage(prevPage)) {
          this.reportEmployeeService.changeData(prevPage);
          this.reportEmployeeService.dataLoaded$.pipe(first()).subscribe(() => {
            const itemsCount =
              this.reportEmployeeService.getItemsCountOnPage(prevPage);
            this.currentIndex = itemsCount - 1;
            this.loadDataWithAnswer();
          });
        } else {
          this.reportEmployeeService.changeData(prevPage);
          const itemsCount =
            this.reportEmployeeService.getItemsCountOnPage(prevPage);
          this.currentIndex = itemsCount - 1;
          this.loadDataWithAnswer();
        }
      } else {
        this.showContent = true;
        this.dialogService.close(ViewMarkComponent);
      }
    }

    this.cdr.markForCheck();
  }

  getCurrentEmployee() {
    this.reportOfEmployee = this.reportEmployee.items();
    this.currentEmployee = this.reportOfEmployee[this.currentIndex];

    if (this.currentEmployee) {
      this.getPhotosEmployeeById(this.currentEmployee);
    }
  }

  loadDataWithAnswer(): void {
    this.showContent = false;
    this.employeePhotos = [];

    this.timer$.pipe(delay(this.delayTime)).subscribe(() => {
      this.getCurrentEmployee();

      if (this.currentEmployee) {
        this.setEvenType();
        this.getTimeTableList();
        this.showContent = true;
      }

      this.cdr.markForCheck();
    });
  }

  setEvenType(): void {
    if (!this.currentEmployee) return;

    this.eventType =
      this.eventTypes.find((x) => x.value === this.currentEmployee.eventType) ||
      this.eventTypes[0];
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowRight':
        this.next();
        break;
      case 'ArrowLeft':
        this.prev();
        break;
      default:
        break;
    }
  }
}
