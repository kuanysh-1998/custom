import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'wp-photo-popup',
  templateUrl: './wp-photo-popup.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WpPhotoPopupComponent {
  @Input() photoUrl: string;
  @Input() isVisible: boolean;
  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscape(event: KeyboardEvent) {
    if (this.isVisible) {
      this.closeModal();
    }
  }
}
