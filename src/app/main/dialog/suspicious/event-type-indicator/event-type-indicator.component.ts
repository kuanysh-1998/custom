import { Component, Input, OnInit } from '@angular/core';
import { EventType } from '../../../../models/report-employee.model';
import { DisplayValueModel } from '../../../../shared/models/display-value.model';

@Component({
  selector: 'app-event-type-indicator',
  templateUrl: './event-type-indicator.component.html',
  styleUrls: ['./event-type-indicator.component.scss'],
})
export class EventTypeIndicatorComponent implements OnInit {
  @Input()
  eventType: DisplayValueModel<EventType>;

  get isEventTypeIn() {
    return this.eventType?.value === EventType.IN;
  }

  get eventLabel() {
    return this.isEventTypeIn ? 'Приход' : 'Уход';
  }

  constructor() {}

  ngOnInit(): void {}
}
