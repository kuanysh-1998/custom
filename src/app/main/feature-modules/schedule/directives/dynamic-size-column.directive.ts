import { Directive, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[dynamicSizeColumn]',
})
export class DynamicSizeColumnDirective {
  widthLaptop: number = 1536;
  @HostBinding('style.max-width.px') maxWidth = 158;
  @HostBinding('style.flex') flexValue = '0 0 158px';

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.adjustSizes(window.innerWidth);
  }

  constructor() {
    this.adjustSizes(window.innerWidth);
  }

  private adjustSizes(windowWidth: number): void {
    if (windowWidth > this.widthLaptop) {
      this.maxWidth = 210;
      this.flexValue = '0 0 210px';
    }
  }
}
