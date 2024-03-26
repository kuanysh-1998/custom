import { HttpClient, HttpParams } from '@angular/common/http';
import CustomStore from 'devextreme/data/custom_store';
import { Injectable } from '@angular/core';

const isNotEmpty = (value) =>
  value !== undefined && value !== null && value !== '';

@Injectable({
  providedIn: 'root',
})
export class HttpCustomPost {
  constructor(private httpClient: HttpClient) {}

  createStore(
    key: string,
    url: string,
    getRequestBody: (loadOptions: any) => any
  ) {
    return new CustomStore({
      key: key || 'id',
      load: (loadOptions) => {
        let params = new HttpParams();

        const supportedLoadOptions = [
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
        ];

        supportedLoadOptions.forEach((option) => {
          if (loadOptions[option] && isNotEmpty(loadOptions[option])) {
            params = params.set(option, JSON.stringify(loadOptions[option]));
          }
        });

        const body = getRequestBody(loadOptions);

        return this.httpClient
          .post(url, body, { params: params })
          .toPromise()
          .then((response: any) => {
            return {
              data: response.data,
              totalCount: response.totalCount,
            };
          })
          .catch((error) => {
            throw 'Data Loading Error: ' + error;
          });
      },
    });
  }
}
