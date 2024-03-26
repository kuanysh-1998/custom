import {
  Component,
  ViewChild,
  ElementRef,
  HostListener,
  Input,
  forwardRef,
  Injector,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  NgControl,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { Time } from 'src/app/main/feature-modules/schedule/models/schedule-models';
import { ValidationMessagesService } from '../../services/validation-messages.service';

@Component({
  selector: 'wp-time-picker',
  templateUrl: './wp-time-picker.component.html',
  styleUrls: ['./wp-time-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: WpTimePickerComponent,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => WpTimePickerComponent),
      multi: true,
    },
  ],
})
export class WpTimePickerComponent implements ControlValueAccessor, Validator {
  @ViewChild('dropdown', { static: false }) dropdownElement: ElementRef;
  @ViewChild('toggleIcon', { static: false }) toggleIcon: ElementRef;
  @ViewChild('inputElement') inputElement: ElementRef;

  @Input() upTo24: boolean = false;
  ngControl: NgControl | null = null;

  get timeOptions(): string[] {
    return this.generateTimeOptions(this.upTo24);
  }

  get invalid(): boolean {
    return this.ngControl ? this.ngControl.invalid : false;
  }

  selectedTime = '00:00';
  showDropdown = false;
  isInputFocused = false;
  dropdownPosition: 'top' | 'bottom' = 'bottom';

  constructor(
    private injector: Injector,
    private vms: ValidationMessagesService
  ) {}

  ngOnInit() {
    this.ngControl = this.injector.get(NgControl, null);
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  public get errorMessage(): string | null {
    for (const propertyName in this.ngControl.errors) {
      if (this.ngControl.errors.hasOwnProperty(propertyName)) {
        return this.vms.getValidatorErrorMessage(
          propertyName,
          this.ngControl.errors[propertyName]
        );
      }
    }
    return null;
  }

  private onChange: (value: Time) => void = () => {};

  private onTouched: () => void = () => {};

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (
      this.dropdownElement &&
      !this.dropdownElement.nativeElement.contains(event.target) &&
      this.toggleIcon &&
      !this.toggleIcon.nativeElement.contains(event.target)
    ) {
      this.showDropdown = false;
    }
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    let filteredValue = value.replace(/[^0-9:]/g, '').replace(/:(?=.*:)/g, '');

    let parts = filteredValue.split(':');
    let hoursPart = parts[0].substring(0, 2);
    let minutesPart = parts[1] ? parts[1].substring(0, 2) : '';

    filteredValue =
      hoursPart +
      (filteredValue.includes(':') && parts[1] !== undefined ? ':' : '') +
      minutesPart;
    input.value = filteredValue;

    const hours = parseInt(hoursPart, 10);
    const minutes = minutesPart ? parseInt(minutesPart, 10) : 0;

    if (hours >= 0 && minutes >= 0 && minutes < 60) {
      this.onChange({ hour: hours, minute: minutes });
    } else {
      this.onChange(null);
    }

    this.isInputFocused = false;
    this.onTouched();
  }

  validate(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (
      value &&
      typeof value === 'object' &&
      'hour' in value &&
      'minute' in value
    ) {
      const { hour, minute } = value;
      const hourIsValid =
        Number.isInteger(hour) && hour >= 0 && hour <= (this.upTo24 ? 24 : 23);
      const minuteIsValid =
        Number.isInteger(minute) && minute >= 0 && minute <= 59;

      if (hourIsValid && minuteIsValid) {
        return null;
      } else {
        return { invalidTime: true };
      }
    }

    return null;
  }

  writeValue(value: Time): void {
    if (
      value &&
      value.hasOwnProperty('hour') &&
      value.hasOwnProperty('minute')
    ) {
      this.selectedTime = `${value.hour
        .toString()
        .padStart(2, '0')}:${value.minute.toString().padStart(2, '0')}`;
    } else {
      this.selectedTime = '';
    }
  }

  selectTime(time: string): void {
    this.selectedTime = time;
    this.showDropdown = false;
    const [hour, minute] = time.split(':').map(Number);
    this.onChange({ hour, minute });
  }

  registerOnChange(fn: (value: Time) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onFocus(): void {
    this.isInputFocused = true;
    this.inputElement.nativeElement.focus();
  }

  onBlur(): void {
    if (this.inputElement && this.inputElement.nativeElement) {
      let value = this.inputElement.nativeElement.value;
      const parts = value.split(':');

      if (parts.length === 2) {
        const hours = parts[0];
        let minutes = parts[1];

        if (minutes.length === 1) {
          minutes = minutes.padStart(2, '0');
        }

        value = `${hours}:${minutes}`;
        this.inputElement.nativeElement.value = value;
        this.onChange({
          hour: parseInt(hours, 10),
          minute: parseInt(minutes, 10),
        });
      } else if (parts.length === 1) {
        const hours = parts[0];
        if (hours !== '') {
          this.onChange({
            hour: parseInt(hours, 10),
            minute: null,
          });
        }
      }
    }

    this.isInputFocused = false;
    this.onTouched();
  }

  toggleDropdown(): void {
    if (this.upTo24) {
      this.dropdownPosition = 'top';
    } else {
      this.dropdownPosition = 'bottom';
    }
    this.showDropdown = !this.showDropdown;
  }

  generateTimeOptions(include24: boolean = false): string[] {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        times.push(
          `${hour.toString().padStart(2, '0')}:${minute
            .toString()
            .padStart(2, '0')}`
        );
      }
    }
    if (include24) {
      times.push('24:00');
    }
    return times;
  }
}
