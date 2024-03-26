import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[resizableWidth]',
})
export class ResizableWidthDirective {
  cellWidth: number = 150;
  defaultWidth: number;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.setDefaultWidth();
  }

  @Input()
  set resizableWidth(uniqueDates: string[]) {
    this.setDefaultWidth();
    const customGrid = this.el.nativeElement;
    let cellLength = uniqueDates.length * this.cellWidth + this.cellWidth;
    if (cellLength < this.defaultWidth) {
      cellLength = this.defaultWidth;
    }
    this.renderer.setStyle(customGrid, 'width', `${cellLength}px`);
  }

  private setDefaultWidth(): void {
    console.log('window.innerWidth', window.innerWidth);

    this.defaultWidth = window.innerWidth > 1600 ? 1750 : 1385;
  }
}
