import { Component, HostListener, Inject } from '@angular/core';
import { DialogService } from '../../services/wp-dialog.service';
import { DIALOG_DATA } from '../../tokens/dialog-data.token';

@Component({
  selector: 'app-message-dialog',
  templateUrl: './wp-message.component.html',
  styleUrls: ['./wp-message.component.scss'],
})
export class WpMessageComponent {
  message: string;
  activeButton: 'confirm' | 'cancel' = 'confirm';

  constructor(
    @Inject(DIALOG_DATA) public data: any,
    private dialogService: DialogService
  ) {
    if (data) {
      this.message = data.message;
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
        this.activeButton === 'confirm' ? this.confirm() : this.close();
        break;
      case 'ArrowLeft':
        this.activeButton = 'cancel';
        break;
      case 'ArrowRight':
        this.activeButton = 'confirm';
        break;
      default:
        break;
    }
  }

  confirm(): void {
    this.dialogService.close(WpMessageComponent, { saved: true });
  }

  close(): void {
    this.dialogService.close(WpMessageComponent, { rejected: true });
  }
}
