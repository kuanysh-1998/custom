import { Component, Input, Type, ChangeDetectionStrategy } from '@angular/core';
import { DialogService } from '../../services/wp-dialog.service';
import { Subject } from 'rxjs';
import { Location } from '@angular/common';

export interface Position {
  my?: string;
  at?: string;
  of?: Window | string;
  offset: string;
}

@Component({
  selector: 'wp-popup',
  templateUrl: './wp-popup.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WpPopupComponent {
  @Input() title: string = '';
  @Input() width: number = 500;
  @Input() visible: boolean = false;
  @Input() componentType: Type<any>;
  @Input() componentData: any;

  position: Position | any = {
    my: 'center',
    at: 'center',
    of: window,
    offset: '0 0',
  };
  private destroy$ = new Subject<void>();

  constructor(
    private dialogService: DialogService,
    private location: Location
  ) {
    this.location.subscribe(() => {
      this.closeModal();
    });
  }

  ngOnInit() {
    if (this.componentType && this.componentData) {
      this.loadComponent(this.componentType, this.componentData);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadComponent(componentType: Type<any>, data: any) {
    this.componentType = componentType;
    this.componentData = data;
  }

  closeModal() {
    this.dialogService.close(this.componentType);
  }
}
