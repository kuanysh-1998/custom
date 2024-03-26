import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'wk-link',
  templateUrl: './link.component.html',
  styleUrls: ['./link.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkComponent {
  @Input() public link = '';
  @Input() public text = '';
  @Input() public disabled = false;
  @Input() public download?: string;

  @Input() public variant: 'default' | 'secondary' = 'default';

  @HostBinding(`class.secondary`)
  public get class(): boolean {
    return this.variant !== 'default';
  }

  @HostBinding(`class.disabled`)
  public get isDisabled(): boolean {
    return this.disabled;
  }

  public isExternalLink(url: string): boolean {
    return url.startsWith('http') || url.startsWith('https') || !!this.download;
  }
}
