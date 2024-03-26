import CustomStore from 'devextreme/data/custom_store';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

const isNotEmpty = (value) =>
  value !== undefined && value !== null && value !== '';
@Injectable()
export class HttpCustom {
  constructor(private httpClient: HttpClient) {}

  createStore(key: string, url: string, customizeLoadOptions?: (loadOptions: any) => void) {
    key = !!key ? key : 'id';
    return new CustomStore({
      key: key,
      useDefaultSearch: true,
      load: (loadOptions) => {
        if (customizeLoadOptions) {
          customizeLoadOptions(loadOptions);
        }
        let params: HttpParams = new HttpParams();
        [
          'filter',
          'group',
          'groupSummary',
          'parentIds',
          'requireGroupCount',
          'requireTotalCount',
          'searchExpr',
          'searchOperation',
          'searchValue',
          'select',
          'sort',
          'skip',
          'take',
          'totalSummary',
          'userData',
        ].forEach(function (i) {
          if (i in loadOptions && isNotEmpty(loadOptions[i])) {
            params = params.set(i, JSON.stringify(loadOptions[i]));
          }
        });

        return this.httpClient
          .get(`${url}`, { params: params })
          .toPromise()
          .then((data: any) => {
            return {
              data: data.data,
              totalCount: data.totalCount,
              summary: data.summary,
              groupCount: data.groupCount,
            };
          })
          .catch((error) => {
            throw 'Data Loading Error';
          });
      },
      byKey: (keyValue) => {
        const filterByKey = [key, '=', keyValue];
        const params = new HttpParams().append(
          'filter',
          JSON.stringify(filterByKey)
        );
        return this.httpClient.get(url, { params: params }).toPromise();
      },
    });
  }
}
