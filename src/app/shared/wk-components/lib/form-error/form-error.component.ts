import { CommonModule } from '@angular/common';
import { Component, Input, ViewEncapsulation } from '@angular/core';
import { AbstractControl } from '@angular/forms';

// Todo: Добавить onPush, подумать как сделать без мутации control
@Component({
  selector: 'wk-error-message',
  templateUrl: './form-error.component.html',
  styleUrls: ['./form-error.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FormErrorComponent {
  @Input() public control?: AbstractControl;
  @Input() public isCalendarControl = false;
  @Input() public shortLabel = false;
  @Input() public isWeight = false;
}
