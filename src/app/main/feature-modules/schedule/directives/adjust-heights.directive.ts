import {
  Directive,
  ElementRef,
  AfterContentChecked,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[adjustHeights]',
})
export class AdjustHeightsDirective implements AfterContentChecked {
  height: string = '25px';
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterContentChecked() {
    this.setWorkOffHeight();
  }

  setWorkOffHeight() {
    const gridCell = this.el.nativeElement;
    const workDayElement = gridCell.querySelector('.work-day');
    const workOffElement = gridCell.querySelector('.work-off');

    if (workDayElement && workOffElement) {
      this.renderer.setStyle(workOffElement, 'height', this.height);
    }
  }
}
