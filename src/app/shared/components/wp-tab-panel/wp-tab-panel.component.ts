import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy,
  Type,
} from '@angular/core';
import { PermissionEnum } from '../../models/permission.enum';

export interface Tab {
  title: string;
  component: Type<any>;
  requiredPermissions?: PermissionEnum[];
}

interface TabChangeEvent {
  addedItems: Array<{ index: number }>;
}

@Component({
  selector: 'wp-tab-panel',
  templateUrl: './wp-tab-panel.component.html',
  styleUrls: ['./wp-tab-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WpTabComponent implements OnInit {
  @Input() tabs: Tab[] = [];
  selectedIndex: number = 0;

  ngOnInit(): void {}

  tabChanged(event: TabChangeEvent): void {
    this.selectedIndex = event.addedItems[0].index;
  }
}
