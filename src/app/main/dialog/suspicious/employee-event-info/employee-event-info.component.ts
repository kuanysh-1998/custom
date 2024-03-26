import { Component, Input, OnInit } from '@angular/core';
import { DisplayValueModel } from '../../../../shared/models/display-value.model';
import { EventType } from '../../../../models/report-employee.model';

@Component({
  selector: 'app-employee-event-info',
  templateUrl: './employee-event-info.component.html',
  styleUrls: ['./employee-event-info.component.scss'],
})
export class EmployeeEventInfoComponent implements OnInit {
  @Input() eventType: DisplayValueModel<EventType>;

  @Input() employeeName: string;
  @Input() eventDate: Date;
  @Input() eventDateOffset: number;

  constructor() {}

  ngOnInit(): void {}

}
