import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { OrganizationService } from '../../../../services/organization.service';
import { BillingService } from '../../../../services/billing.service';
import { Observable } from 'rxjs';
import { OrganizationModel } from '../../../../models/organization.model';
import {
  BalanceManagementModel,
  BalanceModel,
  OverdraftModel,
} from '../../../../models/billing.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DIALOG_DATA } from 'src/app/shared/tokens/dialog-data.token';
import { DialogService } from 'src/app/shared/services/wp-dialog.service';

@Component({
  selector: 'app-balance-management',
  templateUrl: './balance-management.component.html',
  styleUrls: ['./balance-management.component.scss'],
})
export class BalanceManagementComponent implements OnInit {
  organization$: Observable<OrganizationModel>;
  data: BalanceModel;
  error: any;
  form: FormGroup;
  activeButton: 'cancel' | 'save' = 'save';

  constructor(
    @Inject(DIALOG_DATA) public balance: BalanceManagementModel,
    private organizationService: OrganizationService,
    private service: BillingService,
    private dialogService: DialogService,
    private fb: FormBuilder
  ) {}

  private readonly actionChooser = {
    toUpBalance: () => {
      const dataBalance: BalanceModel = {
        ownerId: this.balance.organizationId,
        sum: this.form.get('sum').value,
        comment: this.form.get('comment').value,
        initiator: this.balance.initiator,
      };
      return this.service.topUpBalance(dataBalance);
    },
    addOverdraft: () => {
      const dataOverdraft: OverdraftModel = {
        owner: this.balance.organizationId,
        overdraft: this.form.get('sum').value,
        comment: this.form.get('comment').value,
        initiator: this.balance.initiator,
      };
      return this.service.addOverdraft(dataOverdraft);
    },
  };

  ngOnInit(): void {
    this.form = this.fb.group({
      sum: ['', [Validators.required]],
      comment: ['', [Validators.required]],
    });
    this.organization$ = this.organizationService.getOrganizationById(
      this.balance.organizationId
    );
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const action = this.actionChooser[this.balance.component];
    action().subscribe(
      () => {
        this.dialogService.close(BalanceManagementComponent, { saved: true });
      },
      (err) => {
        this.error = err;
      }
    );
  }

  handleInput(event: KeyboardEvent): void {
    const inputElement = event.target as HTMLInputElement;
    const allowedKeys = ['ArrowLeft', 'ArrowRight', 'Backspace', 'Delete'];

    const isDot = event.key === '.';
    const containsDot = inputElement.value.includes('.');

    if (
      !/[0-9]/.test(event.key) &&
      !allowedKeys.includes(event.key) &&
      !(isDot && !containsDot)
    ) {
      event.preventDefault();
    }
  }

  closeDialog() {
    this.dialogService.close(BalanceManagementComponent);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
        this.activeButton === 'save' ? this.save() : this.closeDialog();
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
