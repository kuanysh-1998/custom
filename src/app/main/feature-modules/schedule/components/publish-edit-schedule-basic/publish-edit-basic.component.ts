import { Component, Input } from '@angular/core';
import { Schedule } from '../../models/schedule-models';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-publish-edit-schedule-basic',
  templateUrl: './publish-edit-basic.component.html',
  styleUrls: ['./publish-edit-basic.component.scss'],
})
export class PublishEditBasicComponent {
  @Input()
  schedule: Schedule;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}


  editPublishedTimesheet() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { mode: 'edit' },
    });
  }
}
