import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrganizationService } from '../../../../services/organization.service';
import {
  AdministrationOrganizationCto,
  AdministrationOrganizationModel,
  AdministrationOrganizationWithLevel,
} from '../../../models/organization.model';
import { AdministrationOrganizationType } from '../../../models/organizationType';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { DisplayValueModel } from 'src/app/shared/models/display-value.model';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import { WpCustomValidators } from 'src/app/shared/validators/wp-custom-validators';
import DataSource from 'devextreme/data/data_source';
import { HttpCustom } from 'src/app/shared/http';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'administration-organization-add',
  templateUrl: './administration-organization-add.component.html',
  styleUrls: ['./administration-organization-add.component.scss'],
})
export class AdministrationOrganizationAddComponent implements OnInit {
  form: FormGroup;
  organizationsCtoDataSource: DataSource;
  public types = [
    {
      display: this.localization.getSync('ЦТО'),
      value: AdministrationOrganizationType.CTO,
    },
    {
      display: this.localization.getSync('ЦТО с уровнем'),
      value: AdministrationOrganizationType.CTOWithLevel,
    },
  ];
  OrganizationType = AdministrationOrganizationType;
  LevelTypes: DisplayValueModel<number>[];
  activeButton: 'cancel' | 'save' = 'save';
  disableSubmit = false;

  constructor(
    private service: OrganizationService,
    private localization: LocalizationService,
    private dialogService: DialogService,
    private httpCustom: HttpCustom,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.LevelTypes = [1, 2, 3, 4, 5].map((x) => {
      return {
        display: this.localization.getSync('Уровень __level__', { level: x }),
        value: x,
      };
    });
    this.form = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          WpCustomValidators.noWhitespaceValidator(),
          WpCustomValidators.maxLength(255, this.localization),
        ],
      ],
      servingOrganizationId: ['', Validators.required],
      level: [{ value: '', disabled: true }],
      scType: [null],
    });
    this.form.controls.scType.valueChanges.subscribe((scType) => {
      if (scType == AdministrationOrganizationType.CTOWithLevel) {
        this.form.controls.level.setValidators([Validators.required]);
      } else {
        this.form.controls.level.clearValidators();
      }
      this.form.controls.level.updateValueAndValidity();
      this.form.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.initOrganizationsCtoDataSource();

    this.form.get('scType').valueChanges.subscribe((scType) => {
      const levelControl = this.form.get('level');
      if (scType === this.OrganizationType.CTOWithLevel) {
        levelControl.enable({ emitEvent: false });
      } else {
        levelControl.disable({ emitEvent: false });
      }
    });
  }

  private initOrganizationsCtoDataSource(): void {
    const dataStore = this.httpCustom.createStore(
      'id',
      'api/Organization/dx?type=1'
    );

    this.organizationsCtoDataSource = new DataSource({
      store: dataStore,
      sort: [{ selector: 'name', desc: false }],
    });
  }

  create(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.disableSubmit = true;
    const formValue = this.form.value;

    const body: AdministrationOrganizationModel = {
      name: formValue.name,
      isPartner:
        formValue.scType == AdministrationOrganizationType.CTO ||
        formValue.scType == AdministrationOrganizationType.CTOWithLevel,
      servingOrganizationId: formValue.servingOrganizationId,
    };

    this.service
      .addOrganization(body)
      .pipe(
        finalize(() => {
          this.disableSubmit = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe((response) => {
        switch (formValue.scType) {
          case AdministrationOrganizationType.CTO:
            const organizationWithCto: AdministrationOrganizationCto = {
              ownerId: response,
            };
            this.service
              .addOrganizationCTO(organizationWithCto)
              .subscribe(() => {
                this.dialogService.close(
                  AdministrationOrganizationAddComponent,
                  { saved: true }
                );
              });
            break;

          case AdministrationOrganizationType.CTOWithLevel:
            const organizationWithLevel: AdministrationOrganizationWithLevel = {
              ownerId: response,
              level: formValue.level,
            };
            this.service
              .addOrganizationWithLevel(organizationWithLevel)
              .subscribe(() => {
                this.dialogService.close(
                  AdministrationOrganizationAddComponent,
                  { saved: true }
                );
              });
            break;

          default:
            this.dialogService.close(AdministrationOrganizationAddComponent, {
              saved: true,
            });
            break;
        }
      });
  }

  closeDialog() {
    this.dialogService.close(AdministrationOrganizationAddComponent);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
        this.activeButton === 'save' ? this.create() : this.closeDialog();
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
