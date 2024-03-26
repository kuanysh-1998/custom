import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdministrationOrganizationType } from '../../../models/organizationType';
import {
  AdministrationOrganizationCto,
  AdministrationOrganizationModel,
  AdministrationOrganizationWithLevel,
} from '../../../models/organization.model';
import { OrganizationService } from '../../../../services/organization.service';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { DisplayValueModel } from 'src/app/shared/models/display-value.model';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DIALOG_DATA } from 'src/app/shared/tokens/dialog-data.token';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import DataSource from 'devextreme/data/data_source';
import { HttpCustom } from 'src/app/shared/http';
import { of } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';
import { WpCustomValidators } from 'src/app/shared/validators/wp-custom-validators';

@UntilDestroy()
@Component({
  selector: 'administration-organization-edit',
  templateUrl: './administration-organization-edit.component.html',
  styleUrls: ['./administration-organization-edit.component.scss'],
})
export class AdministrationOrganizationEditComponent implements OnInit {
  form: FormGroup;
  organizationsCtoDataSource: DataSource;
  isSubmitting = false;
  userId: string;
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
  organization: AdministrationOrganizationModel;
  isLoadingResults = true;
  activeButton: 'cancel' | 'save' = 'save';

  constructor(
    @Inject(DIALOG_DATA) public data: string,
    private service: OrganizationService,
    private localization: LocalizationService,
    private dialogService: DialogService,
    private httpCustom: HttpCustom,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.LevelTypes = [1, 2, 3, 4, 5].map((x) => {
      return {
        display: this.localization.getSync('Уровень __level__', { level: x }),
        value: x,
      };
    });

    this.initForm();
  }

  ngOnInit(): void {
    this.initOrganizationsCtoDataSource();
    this.organizationsCtoDataSource.load().then(() => {
      this.service
        .getAdministrationOrganizationById(this.data)
        .pipe(untilDestroyed(this))
        .subscribe((res) => {
          this.organization = res;

          this.form.patchValue(res);
          if (res.isPartner) {
            this.service
              .getPersonalInformationCTO(this.organization.id)
              .subscribe((res) => {
                this.form.get('level').setValue(res.level);
              });
          }
          this.isLoadingResults = false;
          this.cdr.markForCheck();
        });
    });

    this.form.get('scType').valueChanges.subscribe((scType) => {
      this.updateLevelAccessibility(scType);
      this.updateLevelValidators(scType);
    });

    this.updateLevelAccessibility(this.form.get('scType').value);
    this.updateLevelValidators(this.form.get('scType').value);
  }

  private initForm(): void {
    this.form = this.fb.group({
      id: [''],
      name: [
        '',
        [
          Validators.required,
          WpCustomValidators.noWhitespaceValidator(),
          WpCustomValidators.maxLength(255, this.localization),
        ],
      ],
      servingOrganizationId: ['', [Validators.required]],
      level: [{ value: '', disabled: true }],
      scType: [null],
    });
  }

  private updateLevelAccessibility(scType: any): void {
    const levelControl = this.form.get('level');
    if (
      scType === this.OrganizationType.CTOWithLevel ||
      this.organization?.isPartner
    ) {
      levelControl?.enable({ emitEvent: false });
    } else {
      levelControl?.disable({ emitEvent: false });
    }
  }

  private updateLevelValidators(scType: any): void {
    const levelControl = this.form.get('level');
    if (scType == this.OrganizationType.CTOWithLevel) {
      levelControl.setValidators([Validators.required]);
    } else {
      levelControl.clearValidators();
    }
    levelControl.updateValueAndValidity({ emitEvent: false });
  }

  private initOrganizationsCtoDataSource(): void {
    const dataStore = this.httpCustom.createStore(
      'id',
      'api/Organization/dx?type=1'
    );

    this.organizationsCtoDataSource = new DataSource({
      store: dataStore,
      sort: [{ selector: 'name', desc: false }],
      pageSize: 0,
    });
  }

  update(): void {
    this.form.markAllAsTouched();
    if (!this.form.valid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    let formValue = this.form.value;

    const body: AdministrationOrganizationModel = {
      id: formValue.id,
      name: formValue.name,
      isPartner:
        formValue.scType == AdministrationOrganizationType.CTO ||
        formValue.scType == AdministrationOrganizationType.CTOWithLevel,
      servingOrganizationId: formValue.servingOrganizationId,
    };

    this.service
      .updateOrganization(body)
      .pipe(
        switchMap((updateResponse) => {
          if (
            formValue.scType == AdministrationOrganizationType.CTO.toString() &&
            !this.organization.isPartner
          ) {
            return this.service.addOrganizationCTO({ ownerId: body.id });
          } else if (
            formValue.scType ==
              AdministrationOrganizationType.CTOWithLevel.toString() &&
            !this.organization.isPartner
          ) {
            return this.service.addOrganizationWithLevel({
              ownerId: body.id,
              level: this.form.get('level').value,
            });
          } else if (this.organization.isPartner) {
            return this.service.changeLevel({
              ownerId: body.id,
              level: this.form.get('level').value,
            });
          } else {
            return of(null);
          }
        }),
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (result) => {
          this.dialogService.close(AdministrationOrganizationEditComponent, {
            saved: true,
          });
        },
      });
  }

  closeDialog() {
    this.dialogService.close(AdministrationOrganizationEditComponent);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
        this.activeButton === 'save' ? this.update() : this.closeDialog();
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
