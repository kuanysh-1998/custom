import { Component, OnInit, Input, forwardRef } from '@angular/core';
import DataSource from 'devextreme/data/data_source';
import { HttpCustom } from '../../../shared/http';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'wp-select-box',
  templateUrl: './wp-select-box.component.html',
  styleUrls: ['./wp-select-box.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => WpSelectBoxComponent),
      multi: true,
    },
  ],
})
export class WpSelectBoxComponent implements OnInit {
  @Input() url: string;
  @Input() placeholder: string;
  dataSource: DataSource;
  selectedValue: string = '';
  private onChange: (value: any) => void;
  private onTouched: () => void;

  constructor(private http: HttpCustom) {}

  ngOnInit(): void {
    this.dataSource = new DataSource({
      store: this.http.createStore('id', this.url),
      pageSize: 20,
    });
  }

  onValueChanged(event) {
    this.selectedValue = event.value;
    if (this.onChange) {
      this.onChange(this.selectedValue);
    }
    if (this.onTouched) {
      this.onTouched();
    }
  }

  writeValue(value: any) {}

  registerOnChange(fn: (value: any) => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }

  reset() {
    this.selectedValue = null;
  }
}
