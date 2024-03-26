import {
  Component,
  Inject,
  ChangeDetectorRef,
  OnInit,
  HostListener,
} from '@angular/core';
import { LicenceService } from '../../../../services/licence.service';
import {
  TariffPrefix,
  OptimalTariff,
} from '../../../../models/licences/tariff.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import DataSource from 'devextreme/data/data_source';
import { DIALOG_DATA } from 'src/app/shared/tokens/dialog-data.token';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter } from 'rxjs/operators';

@UntilDestroy()
@Component({
  selector: 'app-add-license',
  templateUrl: './add-license.component.html',
  styleUrls: ['./add-license.component.scss'],
})
export class AddLicenseComponent implements OnInit {
  licenseForm: FormGroup;
  organizations: DataSource;

  readonly trialLicense: string = 'trial';
  readonly standardLicense: string = 'standard';
  licenseTypes: Array<{ name: string; value: string }> = [
    {
      name: this.localizationService.getSync('Стандартный'),
      value: this.standardLicense,
    },
    {
      name: this.localizationService.getSync('Пробный'),
      value: this.trialLicense,
    },
  ];

  licensePeriods: Array<{ name: string; value: number }> = [
    { name: this.localizationService.getSync('На месяц'), value: 30 },
    { name: this.localizationService.getSync('На год'), value: 365 },
  ];

  readonly employeeNumberMin: number = 1;
  readonly employeeNumberMax: number = 3000;

  licenseTariff: OptimalTariff = null;
  licenseTariffPrice: string;
  processingLicenseCreation: boolean = false;
  isSettingDefaults: boolean = false;
  activeButton: 'optimalTariff' | 'cancel' | 'save' = 'optimalTariff';
  previousOrganizationValue: string | null = null;

  private readonly trialTariff: OptimalTariff = {
    name: 'Пробный',
    clientPrice: 0,
    partnerPrice: 0,
    employeeMaxNumber: 1000,
    prefixes: [TariffPrefix.Trial],
    days: 30,
  };

  constructor(
    private currencyPipe: CurrencyPipe,
    private licenseService: LicenceService,
    @Inject(DIALOG_DATA) private data: any,
    private dialogService: DialogService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private localizationService: LocalizationService
  ) {
    this.organizations = new DataSource({
      store: this.data.organizations,
      sort: ['name'],
    });

    this.licenseForm = this.fb.group({
      organization: ['', [Validators.required]],
      licenseType: ['', [Validators.required]],
      licensePeriod: [null, [Validators.required]],
      employeeNumber: [
        1,
        [
          Validators.required,
          Validators.min(this.employeeNumberMin),
          Validators.max(this.employeeNumberMax),
        ],
      ],
    });

    this.licenseForm.controls['licenseType'].valueChanges
      .pipe(
        untilDestroyed(this),
        filter(() => !this.isSettingDefaults)
      )
      .subscribe((value) => this.setTrialTariffDefaultsIfSelected(value));

    this.licenseForm.controls['licensePeriod'].valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((value) => this.setTrialTariffDefaultsIfSelected(value));

    this.licenseForm.controls['employeeNumber'].valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.licenseTariff = null;
      });
  }

  ngOnInit(): void {
    this.licenseForm.get('employeeNumber').valueChanges.subscribe((value) => {
      const roundedValue = Math.floor(value);
      if (roundedValue !== value) {
        this.licenseForm
          .get('employeeNumber')
          .setValue(roundedValue, { emitEvent: false });
      }
    });

    this.licenseForm.get('organization').valueChanges.subscribe((newValue) => {
      if (
        this.previousOrganizationValue &&
        newValue &&
        this.licenseForm.get('licenseType').value !== this.trialLicense
      ) {
        this.resetOptimalTariff();
      } else if (
        newValue &&
        this.licenseForm.get('licenseType').value === this.trialLicense
      ) {
        this.getOptimalTariff();
      }

      this.previousOrganizationValue = newValue;
    });
  }

  onOrganizationChanged() {
    if (this.licenseForm.get('licenseType').value === this.trialLicense) {
      this.getOptimalTariff();
    } else {
      this.resetOptimalTariff();
    }
  }

  setTrialTariffDefaultsIfSelected(licenseType: string): void {
    if (this.isSettingDefaults) {
      return;
    }

    this.isSettingDefaults = true;

    if (licenseType === this.trialLicense) {
      this.licenseForm.controls['employeeNumber'].setValue(
        this.trialTariff.employeeMaxNumber
      );
      this.licenseForm.controls['licensePeriod'].setValue(
        this.trialTariff.days
      );
      this.getOptimalTariff();
    } else {
      this.resetOptimalTariff();
    }

    this.isSettingDefaults = false;
  }

  resetOptimalTariff(): void {
    this.licenseTariff = null;
  }

  getOptimalTariff(): void {
    if (this.licenseForm.invalid) {
      this.licenseForm.markAllAsTouched();
      return;
    }

    const licenseType = this.licenseForm.controls['licenseType'].value;

    if (licenseType === this.trialLicense) {
      this.licenseTariff = this.trialTariff;
      this.licenseTariffPrice = this.formatPrice(
        this.licenseTariff.partnerPrice
      );
      return;
    }

    if (
      !this.licenseForm.controls['licenseType'].valid ||
      !this.licenseForm.controls['licensePeriod'].valid
    ) {
      this.licenseForm.controls['licenseType'].markAsTouched();
      this.licenseForm.controls['licensePeriod'].markAsTouched();
      return;
    }

    const employeeNumber = this.licenseForm.controls['employeeNumber'].value;
    const licensePeriod = this.licenseForm.controls['licensePeriod'].value;
    const subject = this.licenseForm.controls['organization'].value;
    this.licenseService
      .getOptimalTariff(employeeNumber, licensePeriod, subject)
      .subscribe((licenseTariff) => {
        this.licenseTariff = licenseTariff;
        this.licenseTariffPrice = this.formatPrice(
          this.licenseTariff.partnerPrice
        );
        this.activeButton = 'save';
        this.cdr.detectChanges();
      });
  }

  formatPrice(price: number): string {
    return this.currencyPipe.transform(price, 'KZT', '', '1.0');
  }

  createLicense(): void {
    if (
      !this.licenseForm.valid ||
      !this.licenseTariff ||
      this.processingLicenseCreation
    ) {
      return;
    }

    this.processingLicenseCreation = true;
    const organization = this.licenseForm.controls['organization'].value;
    this.licenseService
      .create(organization, this.licenseTariff.prefixes)
      .subscribe({
        next: () => {
          this.dialogService.close(AddLicenseComponent, { saved: true });
        },
        complete: () => {
          this.processingLicenseCreation = false;
          this.cdr.markForCheck();
        },
      });
  }

  closeDialog(): void {
    this.dialogService.close(AddLicenseComponent);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    const buttons = this.licenseTariff
      ? ['cancel', 'save']
      : ['cancel', 'optimalTariff'];
    const currentIndex = buttons.indexOf(this.activeButton);

    switch (event.key) {
      case 'Enter':
        this.performAction();
        break;
      case 'ArrowLeft':
        this.activeButton = buttons[
          (currentIndex + buttons.length - 1) % buttons.length
        ] as 'cancel' | 'save' | 'optimalTariff';

        break;
      case 'ArrowRight':
        this.activeButton = buttons[(currentIndex + 1) % buttons.length] as
          | 'cancel'
          | 'save'
          | 'optimalTariff';

        break;
      default:
        break;
    }
  }

  performAction() {
    switch (this.activeButton) {
      case 'cancel':
        this.closeDialog();
        break;
      case 'optimalTariff':
        this.getOptimalTariff();
        break;
      case 'save':
        this.createLicense();
        break;
      default:
        break;
    }
  }
}
