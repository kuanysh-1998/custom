import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-schedule-basic-controls',
  templateUrl: './schedule-basic-controls.component.html',
  styleUrls: ['./schedule-basic-controls.component.scss'],
})
export class ScheduleBasicControlsComponent implements OnInit {
  @Input()
  name: string = '';

  @Input()
  color: string = '#EDE1FF';

  @Output()
  scheduleBasicFormChanged: EventEmitter<
    FormGroup<{
      name: FormControl<string>;
      color: FormControl<string>;
    }>
  > = new EventEmitter<
    FormGroup<{
      name: FormControl<string>;
      color: FormControl<string>;
    }>
  >();

  scheduleBaseForm: FormGroup<{
    name: FormControl<string>;
    color: FormControl<string>;
  }>;

  ngOnInit(): void {
    this.scheduleBaseForm = new FormGroup({
      name: new FormControl(this.name, [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
      ]),
      color: new FormControl(this.color, [Validators.required]),
    });

    this.scheduleBaseForm.valueChanges
      .pipe(debounceTime(300))
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.scheduleBasicFormChanged.emit(this.scheduleBaseForm);
      });

    this.scheduleBasicFormChanged.emit(this.scheduleBaseForm);
  }

  updateValueColor(color: string): void {
    this.scheduleBaseForm.controls.color.setValue(color);
  }
}
