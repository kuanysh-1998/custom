import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import { Position } from 'devextreme-angular/common';
import { PositionConfig } from 'devextreme/animation/position';

@Component({
  selector: 'wk-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipComponent {
  @Input() public for: Element | string;
  @Input() public content: string | TemplateRef<unknown>;
  @Input() public position: Position | PositionConfig = 'top';
  @Input() public visible = false;

  public get template(): TemplateRef<unknown> | null {
    if (typeof this.content === 'string') return null;
    return this.content;
  }

  public get stringContent(): string | null {
    if (typeof this.content === 'string') return this.content.trim();
    return null;
  }

  public get target(): Element | string {
    if (typeof this.for === 'string') return `#${this.for}`;
    return this.for;
  }
}
