import { Component, Input } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { ValidationMessagesService } from '../../services/validation-messages.service';

@Component({
  selector: 'error-messages',
  template: `
  <ng-container *ngIf='errorMessage'>
  <i title='{{errorMessage}}' *ngIf="type=='icon'" class="bi bi-exclamation-circle-fill text-danger"></i>
  <small *ngIf="type == 'text'" class="text-danger">{{errorMessage}}</small>
  </ng-container>
  `,

})
export class ControlMessagesComponent {
  @Input() control!: AbstractControl | null | FormControl;
  @Input() type: string = 'icon';

  constructor(private vms: ValidationMessagesService) { }

  public get errorMessage(): string | null {
    for (const propertyName in this.control.errors) {
      if (this.control.errors.hasOwnProperty(propertyName) && this.control.touched) {
        return this.vms.getValidatorErrorMessage(propertyName, this.control.errors[propertyName]);
      }
    }
    return null;
  }
}
