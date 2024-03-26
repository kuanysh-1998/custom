import CustomStore from 'devextreme/data/custom_store';
import AspNetData from 'devextreme-aspnet-data-nojquery';
import { Injectable, OnDestroy } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthorizeService } from './services/authorize.service';

@Injectable()
export class AuthorizedStoreCreator implements OnDestroy {
  private requests: Array<XMLHttpRequest> = [];

  constructor(private auth: AuthorizeService) {}

  createStore(options: AspNetData.Options): CustomStore {
    const oldOnBeforeSend = options.onBeforeSend;

    options.onBeforeSend = (x, settings) => {
      if (oldOnBeforeSend) {
        oldOnBeforeSend(x, settings);
      }
      settings.headers = {
        Authorization: 'Bearer ' + this.auth.getToken(),
      };
      settings.url =
        environment.apiUrl +
        settings.url.substring(settings.url.indexOf('/api/'));
      (<any>settings).beforeSend = (xhr: XMLHttpRequest) => {
        this.requests.push(xhr);
      };
    };
    options.onAjaxError = (e) => {
      if (e.xhr.status == 401) {
        this.auth.logout();
      }
    };
    return AspNetData.createStore(options);
  }

  ngOnDestroy(): void {
    this.requests.forEach((xhr) => {
      if (xhr.readyState == 4) {
        return;
      }
      xhr.abort();
    });
  }
}
