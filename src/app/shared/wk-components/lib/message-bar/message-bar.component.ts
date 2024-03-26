import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';

import { Icons } from '../../assets/svg.types';
import { ButtonComponent } from '../button/button.component';
import { LinkComponent } from '../link/link.component';
import { Link, Links } from '../link/link.types';
import { SvgComponent } from '../svg/svg.component';
import { MessageBarOrientation, MessageBarTypes } from './message-bar.types';

@Component({
  selector: 'wk-message-bar',
  standalone: true,
  imports: [CommonModule, SvgComponent, ButtonComponent, LinkComponent],
  templateUrl: './message-bar.component.html',
  styleUrls: ['./message-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MessageBarComponent implements OnInit {
  @Input() public title = '';
  @Input() public secondaryText = '';

  @Input() public fullSize = false;
  @Input() public orientation?: MessageBarOrientation = 'horizontal';
  @Input() public isClosable = false;
  @Input() public type?: MessageBarTypes = 'success';

  @Input() public links?: Links;
  @Input() public template?: TemplateRef<unknown>;

  @Output() public closed = new EventEmitter<void>();

  public closeButtonIcon = Icons.Cross;
  public secondaryTextParts: (string | Link)[];

  @HostBinding('class.hidden')
  public get hidden(): boolean {
    return !this._isShow;
  }

  private _isShow = true;

  public get iconType(): Icons {
    switch (this.type) {
      case 'success':
        return Icons.Success;
      case 'info':
        return Icons.InfoNotification;
      case 'warning':
        return Icons.Warning;
      case 'error':
        return Icons.Error;
      default:
        return Icons.Success;
    }
  }

  constructor(private readonly _cdr: ChangeDetectorRef) {}

  public ngOnInit(): void {
    this.secondaryTextParts = this._parseMessage(this.secondaryText);
  }

  public isLink(part: string | Link): boolean {
    return typeof part !== 'string';
  }

  public getText(part: Link | string): string {
    return typeof part !== 'string' ? part.text : part;
  }

  public getIsDownload(part: Link | string): string | undefined {
    return typeof part !== 'string' ? part.download : undefined;
  }

  public getUrl(part: Link | string): string {
    return typeof part !== 'string' ? part.url : part;
  }

  public show(): void {
    this._isShow = true;
    this._cdr.detectChanges();
  }

  public hide(): void {
    this._isShow = false;
    this.closed.emit();
    this._cdr.detectChanges();
  }

  private _parseMessage(message: string): (string | Link)[] {
    const placeholderRegex = /\{\{|}}/;
    const parts = message.split(placeholderRegex);
    return parts
      .filter(Boolean)
      .map((i) => (this.links?.[i] ? this.links[i] : i));
  }
}
