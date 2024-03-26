import { Pipe, PipeTransform } from '@angular/core';
import { AutoCompleteOption } from './autocomplete.types';

@Pipe({
  name: 'autocomplete',
})
export class AutocompletePipe implements PipeTransform {
  public transform(
    items: any[],
    filter: string,
    fields: string[]
  ): AutoCompleteOption[] {
    if (!items || !filter) {
      return items;
    }

    return items.filter((item) =>
      fields.some((field) => {
        return item[field]?.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
      })
    );
  }
}
