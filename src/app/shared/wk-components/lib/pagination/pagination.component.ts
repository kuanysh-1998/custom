import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { Icons } from '../../assets/svg.types';
import { ButtonComponent } from '../button/button.component';
import { NumberInputComponent } from '../number-input/number-input.component';
import { TextFieldComponent } from '../text-field/text-field.component';

@Component({
  selector: 'wk-pagination',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    TextFieldComponent,
    ReactiveFormsModule,
    NumberInputComponent,
  ],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  @Input() public totalPages: number;
  @Input() public totalCount: number;

  @Input() public enableTotalCount = false;
  @Input() public pageNavigation = false;

  @Input()
  public get currentPage(): number {
    return this._currentPage;
  }

  public set currentPage(value) {
    this.goToPage(value);
  }

  public readonly icons = Icons;
  public control = new FormControl(1);

  @Output() public pageChange = new EventEmitter<number>();

  private _currentPage: number;

  public get isEnableTotalCount(): boolean {
    return (
      this.enableTotalCount && !!(this.totalCount || this.totalCount === 0)
    );
  }

  public get pagesToShow(): number[] {
    const maxPages = 5;
    const pagesArray = [];

    if (this.totalPages <= maxPages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pagesArray.push(i);
      }
    } else {
      const startPage = Math.max(1, this.currentPage - 2);
      const endPage = Math.min(this.totalPages, startPage + maxPages - 1);

      if (startPage === 1) {
        for (let i = 1; i <= maxPages; i++) {
          pagesArray.push(i);
        }
      } else if (endPage === this.totalPages) {
        for (
          let i = this.totalPages - maxPages + 1;
          i <= this.totalPages;
          i++
        ) {
          pagesArray.push(i);
        }
      } else {
        for (let i = startPage; i <= endPage; i++) {
          pagesArray.push(i);
        }
      }
    }

    return pagesArray;
  }

  public goToPage(page: number | string): void {
    const pageNumber = +page;
    if (pageNumber < 1) {
      this._currentPage = 1;
    } else if (pageNumber > this.totalPages) {
      this._currentPage = this.totalPages;
    } else {
      this._currentPage = pageNumber;
    }

    this.pageChange.emit(this._currentPage);
    this.control.reset();
  }
}
