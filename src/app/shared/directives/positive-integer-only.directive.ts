import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[positiveIntegerOnly]',
})
export class PositiveIntegerOnlyDirective {
  constructor(private el: ElementRef) { }

  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    const inputValue = this.el.nativeElement.value;

    // if (event.key !== 'Backspace' && event.key !== 'Delete' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && !/\d/.test(event.key)) {
    //   event.preventDefault();
    //   return;
    // }

    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      event.preventDefault();
      return;
    }

    if (inputValue.length > 1) {
      event.preventDefault();
      return;
    }

    // const regex = /0/g;
    // const hasTwoZeros = regex.test(inputValue);
    // if (hasTwoZeros && event.key === '0') {
    //   event.preventDefault();
    //   return;
    // }

    const inputNumber = parseInt(`${inputValue}${event.key}`);
    console.log(inputNumber);
    if (!isNaN(inputNumber) && (inputNumber < 0 || inputNumber > 3)) {
      event.preventDefault();
      return;
    }
  }

  // @HostListener('paste', ['$event']) onPaste(event: ClipboardEvent) {
  //   const pasteValue = event.clipboardData?.getData('text') || '';

  //   if (!/^\d+$/.test(pasteValue)) {
  //     event.preventDefault();
  //     return;
  //   }

  //   if (pasteValue.length > 1) {
  //     event.preventDefault();
  //     return;
  //   }

  //   const pasteNumber = parseInt(pasteValue);
  //   if (!isNaN(pasteNumber) && (pasteNumber < 0 || pasteNumber > 3)) {
  //     event.preventDefault();
  //     return;
  //   }
  // }

}
