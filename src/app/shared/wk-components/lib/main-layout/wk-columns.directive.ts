import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { TABLET_BREAKPOINT } from '../../assets/viewport';

@Directive({
  selector: '[wkColumns]',
  standalone: true,
})
export class WkColumnsDirective implements OnInit {
  @Input() public wkColumns: string;
  @Input() public columnsAdaptive?: string; // Новый входной параметр

  public maxColumn = 12;
  public maxColumnLine = 13;
  public maxColumnMobile = 6; // Максимальное количество колонок для мобильных устройств

  constructor(
    private readonly _el: ElementRef,
    private readonly _renderer: Renderer2
  ) {}

  public ngOnInit(): void {
    if (!this.wkColumns || !/^\d{1,2}\/\d{1,2}$/.test(this.wkColumns)) {
      this.wkColumns = '1/12';
    }
    if (!this.columnsAdaptive || !/^\d{1}\/\d{1}$/.test(this.columnsAdaptive)) {
      this.columnsAdaptive = '1/7';
    }

    this.applyStyles();
    window.addEventListener('resize', this.applyStyles.bind(this));
  }

  private applyStyles(): void {
    const isMobile = window.innerWidth <= TABLET_BREAKPOINT;
    let [start, end] = this.wkColumns.split('/').map(Number);
    let gridColumnEnd = end;

    if (isMobile && this.columnsAdaptive) {
      [start, end] = this.columnsAdaptive.split('/').map(Number);
      gridColumnEnd =
        end > this.maxColumnMobile ? this.maxColumnMobile + 1 : end + 1;
    } else {
      gridColumnEnd = end >= this.maxColumn ? this.maxColumnLine : end + 1;
    }

    this._renderer.setStyle(
      this._el.nativeElement,
      'grid-column-start',
      start.toString()
    );
    this._renderer.setStyle(
      this._el.nativeElement,
      'grid-column-end',
      gridColumnEnd.toString()
    );
  }
}
