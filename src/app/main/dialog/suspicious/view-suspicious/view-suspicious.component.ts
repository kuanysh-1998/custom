import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  HostListener,
} from '@angular/core';
import {
  SuspiciousCauses,
  SuspiciousModel,
} from '../../../../models/suspicious.model';
import { SuspiciousService } from '../../../../services/suspicious.service';
import {
  EventType,
  EventTypesProvider,
} from '../../../../models/report-employee.model';
import { EmployeeService } from '../../../../services/employee.service';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { DisplayValueModel } from '../../../../shared/models/display-value.model';

import {
  UntypedFormGroup,
  UntypedFormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { EMPTY, Observable, Subject, of } from 'rxjs';
import { LocationModel } from '../../../../models/location.model';
import { LocationService } from '../../../../services/location.service';
import { AuthorizeService } from '../../../../auth/services/authorize.service';
import { switchMap, delay, first } from 'rxjs/operators';
import { TimeTableList } from '../../../../models/suspicious.model';
import { PhotosService } from '../../../../services/photos.service';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import { WpMessageComponent } from 'src/app/shared/components/wp-message/wp-message.component';
import { WpSnackBar } from 'src/app/shared/services/wp-snackbar.service';
import { EmployeeDetail } from 'src/app/models/employee.model';

@Component({
  selector: 'app-view-suspicious',
  templateUrl: './view-suspicious.component.html',
  styleUrls: ['./view-suspicious.component.scss'],
})
export class ViewSuspiciousComponent implements OnInit, AfterViewInit {
  PhotosBaseUrl = this.photosService.PhotosBaseUrl;
  suspicious: SuspiciousModel[];
  eventTypes = this.eventTypesProvider.getEventTypes();
  eventType: DisplayValueModel<EventType> = this.eventTypes[0];
  employeePhotos = [];
  currentItem: SuspiciousModel | null = null;
  suspiciousCauses = SuspiciousCauses;
  checkRecognition = false;
  form: FormGroup;
  location$: Observable<LocationModel[]>;
  dataTimeTableList: TimeTableList[];
  delayTime = 400;
  timer$ = of(true);
  @ViewChild('modalContent') modalContentRef!: ElementRef;
  showContent: boolean = false;
  timetableSpanId: string;
  isConfirmationModalOpen: boolean = false;
  noDataText = `<p>${this.localization.getSync(
    'Подходящее расписание не найдено. Пожалуйста, создайте расписание для <br> данного сотрудника или отклоните отметку'
  )}</p>`;

  timeOptions: Array<{ text: string; value: boolean }> = [
    { text: this.localization.getSync('Время на устройстве'), value: false },
    { text: this.localization.getSync('Время в системе'), value: true },
  ];

  constructor(
    private service: SuspiciousService,
    private employeeService: EmployeeService,
    private localization: LocalizationService,
    private eventTypesProvider: EventTypesProvider,
    private locationService: LocationService,
    private auth: AuthorizeService,
    private snackBar: WpSnackBar,
    private photosService: PhotosService,
    private dialogService: DialogService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getCurrentItem();
    this.form = new UntypedFormGroup({
      locationId: new UntypedFormControl(null, []),
      recognition: new UntypedFormControl(false, []),
      timetableSpanId: new UntypedFormControl(null, []),
      useProvenLocalTime: new UntypedFormControl(false, []),
    });
    this.location$ = this.locationService.getAllLocation(
      this.auth.currentOrganizationId
    );

    this.getTimeTableList();
    this.setEvenType();
  }

  getTimeTableList() {
    if (this.currentItem?.id) {
      this.service
        .getTimeTableList(this.currentItem.id)
        .pipe(first())
        .subscribe((res) => {
          this.dataTimeTableList = res.data;

          if (this.dataTimeTableList.length > 0) {
            this.form.controls.timetableSpanId.setValue(
              this.dataTimeTableList[0].id
            );
          } else {
            this.form.controls.timetableSpanId.setValue(null);
          }
        });
    }
  }

  ngAfterViewInit(): void {
    this.timer$.pipe(delay(400), first()).subscribe(() => {
      const modalContent = this.modalContentRef.nativeElement as HTMLElement;
      modalContent.scrollTo({ top: 0, behavior: 'auto' });
      this.showContent = true;
      this.cdr.markForCheck();
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (!this.isConfirmationModalOpen) {
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

  setEvenType(): void {
    this.eventType = this.eventTypes.find(
      (x) => x.value === this.currentItem?.markType
    );
  }

  loadDataWithAnswer(): void {
    this.showContent = false;
    this.employeePhotos = [];

    this.timer$.pipe(delay(this.delayTime)).subscribe(() => {
      this.getCurrentItem();

      if (this.currentItem) {
        this.getPhotosEmployeeById(this.currentItem);
        this.setEvenType();
        this.showContent = true;
      }

      this.cdr.markForCheck();
    });
  }

  getCurrentItem() {
    this.suspicious = this.service.suspicious.items();
    this.currentItem = this.suspicious[this.service.currentIndex];

    this.getTimeTableList();
    if (this.currentItem) {
      this.getPhotosEmployeeById(this.currentItem);
    }
  }

  next(): void {
    this.showContent = false;
    this.form.reset({
      locationId: null,
      recognition: false,
      timetableSpanId: null,
      useProvenLocalTime: false,
    });

    if (this.service.currentIndex < this.suspicious.length - 1) {
      this.service.currentIndex++;
      this.loadDataWithAnswer();
    } else {
      let nextPage = this.service.suspicious.pageIndex() + 1;

      if (nextPage >= this.service.suspiciousPageCount) {
        this.dialogService.close(ViewSuspiciousComponent);
      } else {
        if (this.service.areDataLoadedForPage(nextPage)) {
          this.service.changeData(nextPage);
          this.service.currentIndex = 0;
          this.loadDataWithAnswer();
        } else {
          this.service.changeData(nextPage);
          this.service.dataLoaded$.pipe(first()).subscribe(() => {
            this.service.currentIndex = 0;
            this.loadDataWithAnswer();
          });
        }
      }
    }

    this.cdr.markForCheck();
  }

  prev(): void {
    this.showContent = false;
    this.form.reset({
      locationId: null,
      recognition: false,
      timetableSpanId: null,
      useProvenLocalTime: false,
    });

    if (this.service.currentIndex > 0) {
      this.service.currentIndex--;
      this.loadDataWithAnswer();
    } else {
      let prevPage = this.service.suspicious.pageIndex() - 1;

      if (prevPage >= 0) {
        if (!this.service.areDataLoadedForPage(prevPage)) {
          this.service.changeData(prevPage);
          this.service.dataLoaded$.pipe(first()).subscribe(() => {
            const itemsCount = this.service.getItemsCountOnPage(prevPage);
            this.service.currentIndex = itemsCount - 1;
            this.loadDataWithAnswer();
          });
        } else {
          this.service.changeData(prevPage);
          const itemsCount = this.service.getItemsCountOnPage(prevPage);
          this.service.currentIndex = itemsCount - 1;
          this.loadDataWithAnswer();
        }
      } else {
        this.showContent = true;
        this.dialogService.close(ViewSuspiciousComponent);
      }
    }

    this.cdr.markForCheck();
  }

  causeExist(cause: SuspiciousCauses): boolean {
    if (this.currentItem == null) {
      return false;
    }
    return this.currentItem.suspiciousCauses.includes(cause);
  }

  causeIsFirst(cause: SuspiciousCauses): boolean {
    if (
      this.currentItem == null ||
      this.currentItem.suspiciousCauses.length === 0
    ) {
      return false;
    }

    const priorityOrder = [
      SuspiciousCauses.PhotoNotRecognized,
      SuspiciousCauses.PhotoSpoofDetected,
      SuspiciousCauses.LocationNotDefined,
      SuspiciousCauses.TimeSpoofing,
      SuspiciousCauses.TimetableSpanNotDefined,
    ];

    const firstCauseInPriorityOrder = this.currentItem.suspiciousCauses
      .sort((a, b) => priorityOrder.indexOf(a) - priorityOrder.indexOf(b))
      .find((causeCode) => priorityOrder.includes(causeCode));

    return cause === firstCauseInPriorityOrder;
  }

  solution(isAccepted: boolean): void {
    if (!isAccepted) {
      this.handleDecline();
    } else {
      if (this.causeExist(this.suspiciousCauses.LocationNotDefined)) {
        this.form.get('locationId').setValidators([Validators.required]);
        this.form.get('locationId').updateValueAndValidity();
      }
      if (this.causeExist(this.suspiciousCauses.TimetableSpanNotDefined)) {
        this.form.get('timetableSpanId').setValidators([Validators.required]);
        this.form.get('timetableSpanId').updateValueAndValidity();
        if (this.form.get('timetableSpanId').invalid) {
          this.snackBar.open(
            'Не выбрано расписание сотрудника. Пожалуйста, укажите расписание, к которому требуется привязать отметку',
            2000
          );
          return;
        }
      }

      if (this.form.invalid) {
        this.form.markAllAsTouched();
        return;
      }

      this.showContent = false;
      const params = {
        locationId: this.form.get('locationId').value
          ? this.form.get('locationId').value
          : this.currentItem.locationId,
        addPhotoForRecognition: !!this.form.get('recognition').value,
        useProvenLocalTime: !!this.form.get('useProvenLocalTime').value,
      };
      if (this.causeExist(this.suspiciousCauses.TimetableSpanNotDefined)) {
        params['timetableSpanId'] = this.form.get('timetableSpanId').value;
      }

      this.service.accepted(this.currentItem.id, params).subscribe({
        next: () => {
          this.service.suspicious.reload().then(() => {
            const items = this.service.suspicious.items();
            if (items.length === 0) {
              this.dialogService.close(ViewSuspiciousComponent, {
                saved: true,
              });
            } else {
              const currentIndexInNewList = items.findIndex(
                (item) => item.id === this.currentItem.id
              );

              if (currentIndexInNewList === -1) {
                if (
                  this.service.currentIndex >= items.length &&
                  this.service.suspicious.pageIndex() ===
                    this.service.suspiciousPageCount - 1
                ) {
                  this.service.changeData(0);
                  this.service.dataLoaded$.pipe(first()).subscribe(() => {
                    this.service.currentIndex = 0;
                    this.loadDataWithAnswer();
                  });
                } else if (this.service.currentIndex >= items.length) {
                  this.service.currentIndex = 0;
                }
              } else {
                this.service.currentIndex = currentIndexInNewList;
              }
              this.loadDataWithAnswer();
            }
          });
        },
        error: (error) => {
          this.snackBar.open(error, 2000);
        },
        complete: () => {
          this.showContent = true;
        },
      });
    }
    this.form.get('timetableSpanId').clearValidators();
    this.form.get('timetableSpanId').updateValueAndValidity();
    this.form.reset({
      locationId: null,
      recognition: false,
      timetableSpanId: null,
      useProvenLocalTime: false,
    });
    this.checkRecognition = false;
  }

  private handleDecline(): void {
    this.showContent = false;
    this.confirmRejection()
      .pipe(
        switchMap((value) => {
          if (!value) {
            this.showContent = true;
            this.cdr.markForCheck();
            return EMPTY;
          }
          return this.service.decline(this.currentItem.id);
        })
      )
      .subscribe({
        next: () => {
          this.service.suspicious.reload().then(() => {
            const items = this.service.suspicious.items();
            if (items.length === 0) {
              this.dialogService.close(ViewSuspiciousComponent);
            } else {
              const currentIndexInNewList = items.findIndex(
                (item) => item.id === this.currentItem.id
              );

              if (currentIndexInNewList === -1) {
                if (
                  this.service.currentIndex >= items.length &&
                  this.service.suspicious.pageIndex() ===
                    this.service.suspiciousPageCount - 1
                ) {
                  this.service.changeData(0);
                  this.service.dataLoaded$.pipe(first()).subscribe(() => {
                    this.service.currentIndex = 0;
                    this.loadDataWithAnswer();
                  });
                } else if (this.service.currentIndex >= items.length) {
                  this.service.currentIndex = 0;
                }
              } else {
                this.service.currentIndex = currentIndexInNewList;
              }
              this.loadDataWithAnswer();
            }
          });
        },
        complete: () => {
          this.showContent = true;
        },
      });
  }

  confirmRejection(rejection = true): Observable<boolean> {
    const confirmationSubject = new Subject<boolean>();
    this.isConfirmationModalOpen = true;

    const message = rejection
      ? 'Вы действительно хотите отклонить отметку? Отклоненные отметки удаляется и не учитываются в отчетах по данному пользователю'
      : 'Вы действительно хотите закрыть оно просмотра отметки? Данные не будут сохранены.';

    this.dialogService.show('Подтверждение', {
      componentType: WpMessageComponent,
      componentData: { title: 'Подтверждение', message: message },
      onClose: (result) => {
        this.isConfirmationModalOpen = false;
        confirmationSubject.next(result.saved);
        confirmationSubject.complete();
      },
    });

    return confirmationSubject.asObservable();
  }

  getPhotosEmployeeById(suspicious: SuspiciousModel) {
    if (suspicious?.employeeId) {
      this.employeeService
        .getEmployeeById(suspicious.employeeId)
        .toPromise()
        .then((data: EmployeeDetail) => {
          this.employeePhotos = data.photos;
        });
    }
  }
}
