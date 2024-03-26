import { Component, OnInit } from '@angular/core';
import { PersonalDeviceComponent } from './personal-device/personal-device.component';
import { CorporateDeviceComponent } from './corporate-device/corporate-device.component';
import { Tab } from 'src/app/shared/components/wp-tab-panel/wp-tab-panel.component';
import { LocalizationService } from 'src/app/shared/services/localization.service';

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.scss'],
})
export class DeviceComponent implements OnInit {
  deviceTabs: Tab[] = [
    {
      title: this.locolization.getSync('Личные устройства'),
      component: PersonalDeviceComponent,
    },
    {
      title: this.locolization.getSync('Корпоративные устройства'),
      component: CorporateDeviceComponent,
    },
  ];

  constructor(private locolization: LocalizationService) {}

  ngOnInit(): void {}
}
