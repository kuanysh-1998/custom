import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import {
  SuspiciousModel,
  DeviceType,
  MarkType,
} from '../models/suspicious.model';
import { SolutionModel } from '../models/solution.model';
import { DisplayValueModel } from '../shared/models/display-value.model';
import { LocalizationService } from '../shared/services/localization.service';
import DataSource from 'devextreme/data/data_source';
import { HttpCustom } from '../shared/http';
import { DataTimeTable } from '../models/suspicious.model';

export enum ActionType {
  View = 'View',
}

@Injectable({
  providedIn: 'root',
})
export class SuspiciousService {
  currentIndex: number;
  suspicious: DataSource;
  suspiciousPageCount: number;
  public dataSubject = new Subject<number>();
  public data$ = this.dataSubject.asObservable();
  contextMenuCondition: boolean[] = [];
  private dataLoadedSubject = new Subject<void>();
  public dataLoaded$ = this.dataLoadedSubject.asObservable();
  private pagesLoaded: { [pageIndex: number]: boolean } = {};
  private itemsPerPage: { [pageIndex: number]: number } = {};

  constructor(
    private http: HttpClient,
    private localization: LocalizationService,
    private httpCustom: HttpCustom
  ) {
    const dataStore = this.httpCustom.createStore(
      'id',
      'domain-api/mark/suspicious'
    );
    dataStore.on('loaded', (data) => {
      const employeeDataModels = data.data as SuspiciousModel[];
      employeeDataModels.forEach(
        (element: SuspiciousModel, index: number) => {
          element['menuItems'] = this.getMenuItems(element);
          this.contextMenuCondition[index] = false;
        }
      );
      const pageIndex = this.suspicious.pageIndex();
      this.itemsPerPage[pageIndex] = data.data.length;
      this.pagesLoaded[this.suspicious.pageIndex()] = true;
      this.notifyDataLoaded();
    });
    this.suspicious = new DataSource({
      store: dataStore,
    });
  }

  private getMenuItems(
    data: SuspiciousModel
  ): { text: string; actionType: ActionType }[] {
    const items = [];
    items.push({
      text: this.localization.getSync('Просмотреть'),
      actionType: ActionType.View,
    });
    return items;
  }

  areDataLoadedForPage(pageIndex: number): boolean {
    return !!this.pagesLoaded[pageIndex];
  }

  getItemsCountOnPage(pageIndex: number): number {
    return this.itemsPerPage[pageIndex] || 0;
  }

  notifyDataLoaded() {
    this.dataLoadedSubject.next();
  }

  changeData(value: number) {
    this.dataSubject.next(value);
  }

  accepted(id, solution: SolutionModel): Observable<void> {
    return this.http.put<void>(`domain-api/mark/${id}/accept`, solution);
  }

  decline(id: string): Observable<void> {
    return this.http.put<void>(`domain-api/mark/${id}/decline`, {});
  }

  getTimeTableList(markId: string): Observable<DataTimeTable> {
    return this.http.get<DataTimeTable>(
      `domain-api/timetable/spans/for-mark/${markId}`
    );
  }

  getDeviceTypes(): DisplayValueModel<DeviceType>[] {
    return [
      {
        display: this.localization.getSync('Личное'),
        value: DeviceType.PERSONAL,
      },
      {
        display: this.localization.getSync('Корпоративное'),
        value: DeviceType.CORPORATE,
      },
    ];
  }

  getMarkTypes(): DisplayValueModel<MarkType>[] {
    return [
      {
        display: this.localization.getSync('Приход'),
        value: MarkType.IN,
      },
      {
        display: this.localization.getSync('Уход'),
        value: MarkType.OUT,
      },
    ];
  }
}
