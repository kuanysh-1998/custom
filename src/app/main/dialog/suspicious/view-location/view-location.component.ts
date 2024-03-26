import { Component, Inject, Input, OnChanges, OnInit } from '@angular/core';
import { SuspiciousModel } from '../../../../models/suspicious.model';
import { ReportEmployeeModel } from 'src/app/models/report-employee.model';
import { DIALOG_DATA } from 'src/app/shared/tokens/dialog-data.token';

@Component({
  selector: 'app-view-location',
  templateUrl: './view-location.component.html',
  styleUrls: ['./view-location.component.scss'],
})
export class ViewLocationComponent implements OnInit, OnChanges {
  @Input()
  suspicious: SuspiciousModel | ReportEmployeeModel | null = null;

  latitude: number;
  longitude: number;
  zoom: number = 14;
  options: google.maps.MapOptions;
  position: google.maps.LatLngLiteral;

  constructor(
    @Inject(DIALOG_DATA) public data: SuspiciousModel
  ) {}

  ngOnInit(): void {
    this.updatePositionFromDataSources();
  }

  ngOnChanges() {
    this.updatePositionFromDataSources();
  }

  private updatePositionFromDataSources() {
    const dataSource = this.suspicious || this.data;
    if (dataSource) {
      this.position = {
        lat: dataSource.coordinates?.latitude || 0,
        lng: dataSource.coordinates?.longitude || 0,
      };
    }
  }
}
