import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';

import { SvgComponent } from '../svg/svg.component';
import { Tab } from './tabs.types';

@Component({
  selector: 'wk-tabs',
  standalone: true,
  imports: [CommonModule, SvgComponent],
  templateUrl: './tabs.component.html',
  styleUrls: ['./styles/tabs.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsComponent implements AfterViewInit {
  @Input() public tabsItems: Tab[] = [];
  @Input() public orientation: 'horizontal' | 'vertical' = 'horizontal';
  @Input() public selectedIndex = 0;
  @Input() public disabled = false;
  @Input() public token?: string;

  @Output() public changeActiveTabEvent = new EventEmitter<Tab>();

  @ViewChildren('tabTmpl') private readonly _tabsTmpl: QueryList<
    ElementRef<HTMLDivElement>
  >;
  @ViewChild('indicator')
  private readonly _indicator: ElementRef<HTMLDivElement>;

  @HostBinding('class.vertical-tabs')
  public get isVertical(): boolean {
    return this.isVerticalTabs;
  }

  public get isVerticalTabs(): boolean {
    return this.orientation === 'vertical';
  }

  constructor(private readonly _renderer: Renderer2) {}

  public ngAfterViewInit(): void {
    const tabElement =
      this._tabsTmpl.toArray()[this.selectedIndex].nativeElement;
    this._moveIndicatorToTab(tabElement);
  }

  public changeActiveTab(tab: Tab, index: number): void {
    if (this.disabled || tab.disabled) return;

    this.selectedIndex = index;
    const tabElement = this._tabsTmpl.toArray()[index].nativeElement;

    this.changeActiveTabEvent.emit(tab);
    this._moveIndicatorToTab(tabElement);
  }

  private _moveIndicatorToTab(tabElement: HTMLElement): void {
    const indicatorElement = this._indicator.nativeElement;
    if (this.orientation === 'vertical') {
      const tabTop = tabElement.offsetTop;
      const PADDING_TOP = 4;

      this._renderer.setStyle(indicatorElement, 'height', `28px`);
      this._renderer.setStyle(
        indicatorElement,
        'top',
        `${tabTop + PADDING_TOP}px`
      );
      return;
    }
    const tabWidth = tabElement.offsetWidth;
    const tabLeft = tabElement.offsetLeft;

    this._renderer.setStyle(indicatorElement, 'width', `${tabWidth}px`);
    this._renderer.setStyle(indicatorElement, 'left', `${tabLeft}px`);
  }
}
