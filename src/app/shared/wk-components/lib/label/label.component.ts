import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { Icons } from '../../assets/svg.types';
import { Link, Links } from '../link/link.types';

@Component({
  selector: 'wk-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class LabelComponent implements OnInit {
  @Input() public label = '';
  @Input() public info = '';
  @Input() public bold = false;
  @Input() public required = false;
  @Input() public disabled = false;
  @Input() public for: string;
  @Input() public size: 's' | 'm' | 'l' = 'm';
  @Input() public links?: Links;

  public readonly iconInfo = Icons.Info;
  public secondaryTextParts: (string | Link)[];

  public get labelClasses(): Record<string, boolean> {
    return {
      label: true,
      bold: this.bold,
      [this.size]: true,
      disabled: this.disabled,
    };
  }

  public ngOnInit(): void {
    this.secondaryTextParts = this._parseMessage(this.label);
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

  private _parseMessage(message: string): (string | Link)[] {
    const placeholderRegex = /\{\{|}}/;
    const parts = message.split(placeholderRegex);
    return parts
      .filter(Boolean)
      .map((i) => (this.links?.[i] ? this.links[i] : i));
  }
}
