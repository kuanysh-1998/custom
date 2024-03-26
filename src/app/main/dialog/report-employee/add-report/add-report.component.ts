import { Component, HostListener, Inject, OnInit } from '@angular/core';
import {
  FormGroup,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { EmployeeService } from '../../../../services/employee.service';
import {
  EventModel,
  EventType,
} from '../../../../models/report-employee.model';
import { LocationService } from '../../../../services/location.service';
import { ReportEmployeeService } from '../../../../services/report-employee.service';
import { HttpCustom } from '../../../../shared/http';
import DataSource from 'devextreme/data/data_source';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { DIALOG_DATA } from 'src/app/shared/tokens/dialog-data.token';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import { WpSnackBar } from 'src/app/shared/services/wp-snackbar.service';

@Component({
  selector: 'app-add-report',
  templateUrl: './add-report.component.html',
  styleUrls: ['./add-report.component.scss'],
})
export class AddReportComponent implements OnInit {
  form: FormGroup;
  employees: DataSource;
  locationsDataSource: DataSource;
  eventType = EventType;
  eventTypes: Array<{ id: EventType; text: string }>;
  activeButton: 'cancel' | 'save' = 'save';

  constructor(
    @Inject(DIALOG_DATA) public data: any,
    private dialogService: DialogService,
    private locationService: LocationService,
    private employeeService: EmployeeService,
    private service: ReportEmployeeService,
    private http: HttpCustom,
    private snackBar: WpSnackBar,
    private localization: LocalizationService
  ) {
    this.eventTypes = [
      { id: EventType.IN, text: this.localization.getSync('Приход') },
      { id: EventType.OUT, text: this.localization.getSync('Уход') },
    ];
  }

  ngOnInit(): void {
    this.form = new UntypedFormGroup({
      employeeId: new UntypedFormControl(null, [Validators.required]),
      locationId: new UntypedFormControl(null, [Validators.required]),
      eventDate: new UntypedFormControl(null, [Validators.required]),
      eventType: new UntypedFormControl(null, [Validators.required]),
      organizationId: new UntypedFormControl(this.data.currentOrganizationId, [
        Validators.required,
      ]),
    });

    this.initDataSource();
  }

  initDataSource() {
    this.locationsDataSource = new DataSource({
      store: this.http.createStore(
        'id',
        this.locationService.getAllLocationDxUrl(
          this.data.currentOrganizationId
        )
      ),
      sort: [{ selector: 'name', desc: false }],
      pageSize: 20,
    });

    this.employees = new DataSource({
      store: this.http.createStore(
        'id',
        this.employeeService.getAllEmployeeUrl()
      ),
      pageSize: 20,
      filter: ['isDeleted', '=', false],
      sort: [{ selector: 'fullName', desc: false }],
    });
  }

  addEvent(): void {
    this.form.markAllAsTouched();
    if (!this.form.valid) {
      this.snackBar.open(
        this.localization.getSync('Заполните все обязательные поля'),
        5000
      );
      return null;
    }
    const body: EventModel = this.form.value;
    this.service.addEvent(body).subscribe(
      () => {
        this.dialogService.close(AddReportComponent, { saved: true });
      },
      (error) => {
        console.log(error);
      }
    );
  }

  closeModal(): void {
    this.dialogService.close(AddReportComponent);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
        this.activeButton === 'save' ? this.addEvent() : this.closeModal();
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
