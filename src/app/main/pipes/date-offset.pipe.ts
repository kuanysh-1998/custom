import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateOffset',
})
export class DateOffsetPipe implements PipeTransform {
  transform(value: number): string {
    const formattedValue = value > 0 ? `+${value}` : `${value}`;
    return `UTC ${formattedValue}`;
  }
}
